"use client";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Fingerprint,
  Target,
  Clock3,
  FlaskConical,
  BookOpen,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Route,
  FileCheck2,
  Activity,
} from "lucide-react";
import { useWorkspace } from "./workspace-context";
import { usePreferences } from "./preferences";
import { competencies, courses } from "@/lib/fixtures";
import { scoreCompetencies, rankCourses } from "@/lib/engine";
import { Card, Badge, RouteLink } from "./ui/primitives";
import { CompetencyExplorer } from "./competency-explorer";
export function Overview() {
  const { state, href, demo } = useWorkspace();
  const { t } = usePreferences();
  const scores = scoreCompetencies(competencies, state.evidence);
  const known = scores.filter((s) => s.current !== null);
  const gaps = scores.filter((s) => s.gap !== null && s.gap > 0);
  const ranked = rankCourses(courses, scores, state.completed);
  const hours = courses
    .filter((c) => state.completed.includes(c.id))
    .reduce((s, c) => s + c.hours, 0);
  const attempts = Object.values(state.labAttempts).reduce((s, n) => s + n, 0);
  const recent = [...state.evidence]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);
  const enrolled = courses.find(
    (c) => state.enrolled.includes(c.id) && !state.completed.includes(c.id),
  );
  const stages = [
    {
      title: "Your role",
      detail: "Profile & responsibilities",
      path: "/profile",
      done: !!state.profile.designation,
      icon: Fingerprint,
    },
    {
      title: "Assess",
      detail: "Establish your baseline",
      path: "/diagnostic",
      done: state.diagnosticRuns > 0,
      icon: ClipboardCheck,
    },
    {
      title: "Identify gaps",
      detail: "Compare with role targets",
      path: "/skill-gaps",
      done: known.length > 0,
      icon: Target,
    },
    {
      title: "Learn",
      detail: "Follow a focused pathway",
      path: "/learning-paths",
      done: state.completed.length > 0,
      icon: BookOpen,
    },
    {
      title: "Apply",
      detail: "Build practical evidence",
      path: "/practice-labs",
      done: attempts > 0,
      icon: FlaskConical,
    },
    {
      title: "Verify",
      detail: "Review later evidence",
      path: "/my-progress",
      done: state.evidence.some((e) => e.kind === "post-assessment"),
      icon: FileCheck2,
    },
  ];
  return (
    <>
      <section className="dashboard-intro">
        <div>
          <h2>
            {t("welcome")}, {state.profile.name.split(" ")[0]}.
          </h2>
          <p>
            {state.profile.designation || "Your learning workspace"}{" "}
            <span> / </span> {known.length} of {scores.length} competencies have
            evidence. Make your next step count.
          </p>
        </div>
        <Link className="button button-primary" href={href("/diagnostic")}>
          {state.diagnosticRuns ? "Retake diagnostic" : "Take your diagnostic"}
          <ArrowRight size={17} />
        </Link>
      </section>
      <div className="stats-grid intelligence-stats">
        {[
          {
            icon: Fingerprint,
            label: "Competencies with evidence",
            value: `${known.length}/${scores.length}`,
            foot: `${scores.length - known.length} awaiting assessment`,
            path: "/competencies",
            tag: "EVIDENCE COVERAGE",
          },
          {
            icon: Target,
            label: "Identified skill gaps",
            value: gaps.length,
            foot: "Against your current role targets",
            path: "/skill-gaps",
            tag: "PRIORITY AREAS",
          },
          {
            icon: Clock3,
            label: "Training hours completed",
            value: hours,
            foot: "Completion is separate from mastery",
            path: "/learning-paths",
            tag: "LEARNING ACTIVITY",
          },
          {
            icon: FlaskConical,
            label: "Practice attempts",
            value: attempts,
            foot: "Evaluated statistical missions",
            path: "/practice-labs",
            tag: "APPLIED KNOWLEDGE",
          },
        ].map((s) => (
          <Link
            href={href(s.path)}
            key={s.label}
            className="card stat-card metric-link"
          >
            <div className="stat-top">
              <span className="section-kicker">{s.tag}</span>
              <s.icon size={18} />
            </div>
            <div className="metric-value-line">
              <div className="stat-value">{s.value}</div>
              <ArrowUpRight size={18} />
            </div>
            <strong>{s.label}</strong>
            <p className="stat-foot">{s.foot}</p>
          </Link>
        ))}
      </div>
      <div className="intelligence-layout">
        <CompetencyExplorer scores={scores} />
        <div className="dashboard-rail">
          <Card className="next-action-card">
            <div className="next-action-label">
              <span className="section-kicker">NEXT BEST ACTION</span>
              <Route size={18} />
            </div>
            <Badge tone="teal">
              {enrolled ? "CONTINUE YOUR PATH" : "PRACTICAL MISSION"}
            </Badge>
            <h2>
              {enrolled ? enrolled.title : "Turn knowledge into evidence."}
            </h2>
            <p>
              {enrolled
                ? "Pick up your demonstration lesson, then validate your learning with a practical assessment."
                : "Investigate missing values, duplicate records and outliers in a synthetic survey dataset."}
            </p>
            <div className="action-meta">
              <Clock3 size={14} />
              {enrolled
                ? `${enrolled.hours} hours · synthetic course`
                : "15 min · survey data quality"}
            </div>
            <Link
              className="button button-primary"
              href={href(
                enrolled ? `/courses/${enrolled.id}` : "/practice-labs/quality",
              )}
            >
              {enrolled ? "Continue learning" : "Start the mission"}
              <ArrowUpRight size={16} />
            </Link>
          </Card>
          <Card>
            <div className="card-head">
              <div>
                <span className="section-kicker">PERSONALIZED LEARNING</span>
                <h2>{t("recommendations")}</h2>
              </div>
              <Link
                href={href("/recommendations")}
                className="icon-button"
                aria-label="View all recommendations"
              >
                <ArrowUpRight size={18} />
              </Link>
            </div>
            {ranked.slice(0, 2).map(({ course, reason }) => (
              <div className="recommended-row" key={course.id}>
                <div className="recommended-provider">
                  <BookOpen size={14} /> {course.provider}
                  <span>{course.hours}h</span>
                </div>
                <h3>
                  <Link href={href(`/courses/${course.id}`)}>
                    {course.title}
                    <ArrowUpRight size={15} />
                  </Link>
                </h3>
                <details>
                  <summary>Why this recommendation?</summary>
                  <p>{reason}</p>
                </details>
              </div>
            ))}
            <div className="rail-footer">
              <RouteLink href={href("/recommendations")}>
                Explore all training
              </RouteLink>
            </div>
          </Card>
        </div>
      </div>
      <Card className="journey-card">
        <div className="card-head">
          <div>
            <span className="section-kicker">COMPETENCY-TO-IMPACT ENGINE</span>
            <h2>Your progress, connected.</h2>
          </div>
          <Badge>
            {demo ? "Simulated learning journey" : "Personal evidence journey"}
          </Badge>
        </div>
        <nav
          className="journey-stages"
          aria-label="Competency-to-impact journey"
        >
          {stages.map((s, i) => (
            <Link
              className={`journey-stage ${s.done ? "complete" : ""}`}
              href={href(s.path)}
              key={s.path}
            >
              <span className="stage-icon">
                {s.done ? <Check size={17} /> : <s.icon size={17} />}
              </span>
              <span className="stage-number">0{i + 1}</span>
              <strong>{s.title}</strong>
              <small>{s.detail}</small>
              <span className="stage-state">
                {s.done ? "Evidence available" : "Explore step"}
                <ArrowRight size={12} />
              </span>
            </Link>
          ))}
        </nav>
      </Card>
      <div className="activity-section">
        <div>
          <span className="section-kicker">EVIDENCE TRAIL</span>
          <h2>Recent competency activity</h2>
          <p>
            {demo
              ? "Synthetic records from this demonstration."
              : "Your recorded assessment and practical evidence."}
          </p>
          <RouteLink href={href("/my-progress")}>View full history</RouteLink>
        </div>
        <div className="activity-list">
          {recent.length ? (
            recent.map((e) => (
              <Link
                href={href(`/competencies#competency-${e.competencyId}`)}
                key={e.id}
                className="activity-row"
              >
                <span className="activity-symbol">
                  <Activity size={17} />
                </span>
                <div>
                  <strong>
                    {competencies.find((c) => c.id === e.competencyId)?.name ??
                      e.competencyId}
                  </strong>
                  <small>
                    {e.kind} · {e.source}
                  </small>
                </div>
                <span className="activity-level">
                  {e.level.toFixed(1)}
                  <small> / 5</small>
                </span>
                <ArrowUpRight size={15} />
              </Link>
            ))
          ) : (
            <p className="activity-empty">
              Complete a diagnostic or mission to start your evidence trail.
            </p>
          )}
        </div>
      </div>
      {state.completed.length > 0 && (
        <Card className="mission-strip">
          <CheckCircle2 />
          <div>
            <h2>Training completed. Ready to demonstrate it?</h2>
            <p>
              Take a post-training assessment to add new evidence to your
              passport.
            </p>
          </div>
          <RouteLink href={href("/assessments/post-training")}>
            Assess progress
          </RouteLink>
        </Card>
      )}
    </>
  );
}
