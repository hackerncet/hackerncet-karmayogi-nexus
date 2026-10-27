"use client";
import { useState } from "react";
import {
  Clock3,
  BookOpen,
  Search,
  Info,
  Route,
  CheckCircle2,
} from "lucide-react";
import { useWorkspace } from "./workspace-context";
import { competencies, courses } from "@/lib/fixtures";
import { rankCourses, scoreCompetencies } from "@/lib/engine";
import { Badge, Card, Empty, RouteLink } from "./ui/primitives";
import { Button } from "./ui/button";
export function Catalogue({
  id,
  nssta = false,
}: {
  id?: string;
  nssta?: boolean;
}) {
  const { state, href, act, demo } = useWorkspace();
  const [query, setQuery] = useState("");
  const [provider, setProvider] = useState(nssta ? "NSSTA demo" : "all");
  const [page, setPage] = useState(1);
  const ranked = rankCourses(
    courses,
    scoreCompetencies(competencies, state.evidence),
  );
  const filtered = ranked.filter(
    (r) =>
      (!id || r.course.id === id) &&
      (provider === "all" || provider === r.course.provider) &&
      (r.course.title + " " + r.reason)
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const selected = filtered.slice((page - 1) * 4, page * 4);
  return (
    <>
      <div className="notice warning">
        <Info size={18} />
        <p>
          All catalogue entries shown here are synthetic demonstrations. They
          are not verified iGOT courses or approved NSSTA/TPAC programmes. No
          real enrolment or certification occurs.
        </p>
      </div>
      {!id && (
        <div className="toolbar">
          <label className="search-box">
            <Search size={17} />
            <input
              aria-label="Search courses"
              placeholder="Search courses or competencies…"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
            />
          </label>
          <select
            aria-label="Course provider"
            value={provider}
            onChange={(e) => {
              setProvider(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All providers</option>
            <option value="iGOT demo">iGOT · demonstration</option>
            <option value="NSSTA demo">NSSTA · demonstration</option>
          </select>
          <Badge>{filtered.length} results</Badge>
        </div>
      )}
      <div className="catalog-grid">
        {selected.map(({ course, blocked, reason }) => {
          const enrolled = state.enrolled.includes(course.id);
          return (
            <Card className="catalog-card" key={course.id}>
              <div className="badges">
                <Badge
                  tone={course.provider === "NSSTA demo" ? "blue" : "teal"}
                >
                  {course.provider}
                </Badge>
                <Badge>SYNTHETIC</Badge>
                {state.completed.includes(course.id) && (
                  <Badge tone="teal">Completed</Badge>
                )}
              </div>
              <h2>{course.title}</h2>
              <p>{course.description}</p>
              <div className="course-meta">
                <span>
                  <Clock3 size={14} />
                  {course.hours} hours
                </span>
                <span>
                  <BookOpen size={14} />
                  Level {course.level}/5
                </span>
              </div>
              <div className="reason">
                <strong>Why this fits</strong>
                <p style={{ margin: "6px 0" }}>{reason}</p>
                <span>
                  Delivery: {course.delivery}
                  <br />
                  Eligibility: {course.eligibility}
                  <br />
                  Prerequisites:{" "}
                  {blocked.length
                    ? blocked.map((p) => `${p.id} ≥ ${p.level}`).join(", ")
                    : course.prerequisites.length
                      ? "Met"
                      : "None"}
                </span>
                {course.provider === "NSSTA demo" && (
                  <p style={{ margin: "8px 0 0" }}>
                    TPAC approval evidence: unavailable. No approval or dates
                    claimed.
                  </p>
                )}
              </div>
              <div className="course-actions">
                {demo ? (
                  <Button
                    variant={enrolled ? "outline" : "default"}
                    disabled={blocked.length > 0}
                    onClick={() =>
                      act("enrol", { courseId: course.id }, (s) => ({
                        ...s,
                        enrolled: enrolled
                          ? s.enrolled.filter((x) => x !== course.id)
                          : [...s.enrolled, course.id],
                      }))
                    }
                  >
                    {enrolled ? "Leave demo path" : "Join demo path"}
                  </Button>
                ) : (
                  <Badge tone="amber">Live catalogue not connected</Badge>
                )}
                <a
                  href={course.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link"
                >
                  Provider website ↗
                </a>
              </div>
              {id && enrolled && (
                <div style={{ marginTop: 20 }}>
                  <h3>Demonstration lesson</h3>
                  <p style={{ marginTop: 10 }}>
                    Start with a clear question and inspect your data. Document
                    missingness, validate identifiers and keep a reproducible
                    audit trail. For an observation with selection probability
                    π, use inverse-probability weight 1/π. A weighted mean is
                    Σ(wᵢyᵢ)/Σwᵢ.
                  </p>
                  <Button
                    variant="outline"
                    disabled={state.completed.includes(course.id)}
                    onClick={() =>
                      act("complete-course", { courseId: course.id }, (s) => ({
                        ...s,
                        completed: [...new Set([...s.completed, course.id])],
                      }))
                    }
                  >
                    <CheckCircle2 size={15} />
                    {state.completed.includes(course.id)
                      ? "Lesson completed"
                      : "Mark demo lesson complete"}
                  </Button>
                  <p className="token-hint">
                    Completion is self-reported learning activity. Proficiency
                    requires assessment or lab evidence.
                  </p>
                  <RouteLink href={href("/assessments/post-training")}>
                    Demonstrate what you learned
                  </RouteLink>
                </div>
              )}
            </Card>
          );
        })}
      </div>
      {!filtered.length && (
        <Empty
          title="No courses found"
          description="Try a different search or provider. No course identifiers are invented."
        />
      )}
      {!id && filtered.length > 4 && (
        <div className="quiz-controls">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <span>
            Page {page} of {Math.ceil(filtered.length / 4)}
          </span>
          <Button
            variant="outline"
            disabled={page * 4 >= filtered.length}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </>
  );
}
export function LearningPaths() {
  const { state, href } = useWorkspace();
  const enrolled = courses.filter((c) => state.enrolled.includes(c.id));
  if (!enrolled.length)
    return (
      <Empty
        title="Your next chapter starts here"
        description="Explore recommendations and join a demonstration course to build your personal pathway."
        action={
          <RouteLink href={href("/recommendations")}>
            Find your next step
          </RouteLink>
        }
      />
    );
  return (
    <div className="section-stack">
      {enrolled.map((c, i) => (
        <Card className="mission-strip" key={c.id}>
          <Route />
          <div>
            <Badge>
              STEP {i + 1} · {c.provider}
            </Badge>
            <h2 style={{ marginTop: 8 }}>{c.title}</h2>
            <p>
              {state.completed.includes(c.id)
                ? "Training completed · mastery not yet inferred"
                : "Learning in progress"}{" "}
              · {c.hours} hours
            </p>
          </div>
          <RouteLink href={href(`/courses/${c.id}`)}>
            {state.completed.includes(c.id) ? "Revisit lesson" : "Continue"}
          </RouteLink>
        </Card>
      ))}
    </div>
  );
}
