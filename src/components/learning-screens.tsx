"use client";
import { useState } from "react";
import {
  Clock3,
  BookOpen,
  Search,
  Info,
  Route,
  CheckCircle2,
  ArrowUpRight,
  SlidersHorizontal,
  Columns3,
  LayoutGrid,
  List,
} from "lucide-react";
import { useWorkspace } from "./workspace-context";
import { competencies, courses } from "@/lib/fixtures";
import { rankCourses, scoreCompetencies } from "@/lib/engine";
import { Badge, Card, Empty, Modal, RouteLink } from "./ui/primitives";
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
  const [level, setLevel] = useState("all");
  const [sort, setSort] = useState("recommended");
  const [view, setView] = useState("grid");
  const [comparison, setComparison] = useState<string[]>([]);
  const ranked = rankCourses(
    courses,
    scoreCompetencies(competencies, state.evidence),
  );
  const filtered = ranked.filter(
    (r) =>
      (!id || r.course.id === id) &&
      (level === "all" ||
        (level === "foundation" ? r.course.level <= 2 : r.course.level > 2)) &&
      (provider === "all" || provider === r.course.provider) &&
      (r.course.title + " " + r.reason)
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  if (sort === "duration")
    filtered.sort((a, b) => a.course.hours - b.course.hours);
  if (sort === "level")
    filtered.sort((a, b) => a.course.level - b.course.level);
  const compared = courses.filter((c) => comparison.includes(c.id));
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
        <div className="catalogue-controls">
          <div className="catalogue-intro">
            <div>
              <span className="section-kicker">LEARNING LIBRARY</span>
              <h2>Training for your next step.</h2>
              <p>
                Explore both providers, inspect the fit and compare your
                options.
              </p>
            </div>
            <SlidersHorizontal size={23} />
          </div>
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
            <select
              aria-label="Course difficulty"
              value={level}
              onChange={(e) => {
                setLevel(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">All levels</option>
              <option value="foundation">Foundation · levels 1–2</option>
              <option value="advanced">Intermediate & advanced · 3–5</option>
            </select>
            <select
              aria-label="Sort courses"
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
            >
              <option value="recommended">Recommended first</option>
              <option value="duration">Shortest duration</option>
              <option value="level">Difficulty: low to high</option>
            </select>
          </div>
          <div className="catalogue-result-line">
            <Badge>{filtered.length} results</Badge>
            <span>Every recommendation has an explanation.</span>
            <div
              className="view-switch"
              role="group"
              aria-label="Course layout"
            >
              <button
                aria-label="Grid view"
                aria-pressed={view === "grid"}
                onClick={() => setView("grid")}
              >
                <LayoutGrid size={15} />
              </button>
              <button
                aria-label="List view"
                aria-pressed={view === "list"}
                onClick={() => setView("list")}
              >
                <List size={15} />
              </button>
            </div>
          </div>
        </div>
      )}
      <div
        className={`catalog-grid ${view === "list" && !id ? "catalog-list-view" : ""} ${id ? "catalog-detail-view" : ""}`}
      >
        {selected.map(({ course, blocked, reason }) => {
          const enrolled = state.enrolled.includes(course.id);
          return (
            <Card className="catalog-card" key={course.id}>
              <div
                className={`course-cover ${course.provider === "NSSTA demo" ? "programme-cover" : ""}`}
              >
                <span>
                  {course.provider === "NSSTA demo"
                    ? "INSTRUCTOR-LED PROGRAMME"
                    : "SELF-PACED LEARNING"}
                </span>
                <BookOpen size={30} />
                <span className="cover-competency">
                  {course.competencyIds
                    .map((id) => competencies.find((c) => c.id === id)?.name)
                    .filter(Boolean)
                    .join(" / ")}
                </span>
              </div>
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
              <details className="reason" open={!!id}>
                <summary>Why this fits your profile</summary>
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
              </details>
              {!id && (
                <div className="course-discovery-actions">
                  <RouteLink href={href(`/courses/${course.id}`)}>
                    View course
                  </RouteLink>
                  <button
                    className="compare-toggle"
                    aria-label={`Compare ${course.title}`}
                    aria-pressed={comparison.includes(course.id)}
                    disabled={
                      !comparison.includes(course.id) && comparison.length >= 3
                    }
                    onClick={() =>
                      setComparison((previous) =>
                        previous.includes(course.id)
                          ? previous.filter((id) => id !== course.id)
                          : [...previous, course.id],
                      )
                    }
                  >
                    <Columns3 size={14} />
                    {comparison.includes(course.id) ? "Selected" : "Compare"}
                  </button>
                </div>
              )}
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
                  Provider website <ArrowUpRight size={14} />
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
      {!id && comparison.length > 0 && (
        <div className="comparison-bar">
          <span role="status">{comparison.length} of 3 courses selected</span>
          <Modal
            trigger={
              <Button disabled={comparison.length < 2}>
                <Columns3 size={16} /> Compare selected courses
              </Button>
            }
            title="Compare your training options"
            description="Synthetic catalogue records. No official course availability, enrolment or TPAC approval is implied."
          >
            <div className="table-scroll">
              <table>
                <caption>Selected demonstration training options</caption>
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Provider</th>
                    <th>Duration</th>
                    <th>Level</th>
                    <th>Prerequisites</th>
                  </tr>
                </thead>
                <tbody>
                  {compared.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <RouteLink href={href(`/courses/${c.id}`)}>
                          {c.title}
                        </RouteLink>
                      </td>
                      <td>{c.provider}</td>
                      <td>{c.hours} hours</td>
                      <td>{c.level}/5</td>
                      <td>
                        {c.prerequisites.length
                          ? c.prerequisites
                              .map((p) => `${p.id} ≥ ${p.level}`)
                              .join(", ")
                          : "None"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Modal>
          <Button variant="ghost" onClick={() => setComparison([])}>
            Clear selection
          </Button>
          {comparison.length < 2 && (
            <small>Select at least two courses to compare.</small>
          )}
        </div>
      )}
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
