"use client";
import Link from "next/link";
import {
  Fingerprint,
  Target,
  Clock3,
  FlaskConical,
  ArrowRight,
  BookOpen,
  Info,
  CheckCircle2,
} from "lucide-react";
import { useWorkspace } from "./workspace-context";
import { usePreferences } from "./preferences";
import { competencies, courses } from "@/lib/fixtures";
import { scoreCompetencies, rankCourses } from "@/lib/engine";
import { Card, Badge, Progress, RouteLink } from "./ui/primitives";
export function Overview() {
  const { state, href } = useWorkspace();
  const { t } = usePreferences();
  const scores = scoreCompetencies(competencies, state.evidence);
  const known = scores.filter((s) => s.current !== null);
  const gaps = scores.filter((s) => s.gap !== null && s.gap > 0);
  const ranked = rankCourses(courses, scores, state.completed);
  const hours = courses
    .filter((c) => state.completed.includes(c.id))
    .reduce((s, c) => s + c.hours, 0);
  return (
    <>
      <section className="welcome-card">
        <div>
          <div className="eyebrow">YOUR LEARNING, WITH PURPOSE</div>
          <h2>
            {t("welcome")}, {state.profile.name.split(" ")[0]}.
          </h2>
          <p>
            Your next step starts with evidence. Build confidence in sampling,
            survey quality and the tools behind better official statistics.
          </p>
        </div>
        <Link className="button" href={href("/diagnostic")}>
          {state.diagnosticRuns ? "Retake diagnostic" : "Take your diagnostic"}
          <ArrowRight size={16} />
        </Link>
      </section>
      <div className="stats-grid">
        {[
          {
            icon: Fingerprint,
            label: "Competencies with evidence",
            value: `${known.length}/${scores.length}`,
            foot: `${scores.length - known.length} awaiting assessment`,
          },
          {
            icon: Target,
            label: "Identified skill gaps",
            value: gaps.length,
            foot: "Based on demonstrated evidence",
          },
          {
            icon: Clock3,
            label: "Training hours completed",
            value: hours,
            foot: "Training ≠ demonstrated mastery",
          },
          {
            icon: FlaskConical,
            label: "Practice attempts",
            value: Object.values(state.labAttempts).reduce((s, n) => s + n, 0),
            foot: "Evidence from mission labs",
          },
        ].map((s) => (
          <Card className="stat-card" key={s.label}>
            <div className="stat-top">
              <span>{s.label}</span>
              <span className="stat-icon">
                <s.icon size={16} />
              </span>
            </div>
            <div className="stat-value">{s.value}</div>
            <p className="stat-foot">{s.foot}</p>
          </Card>
        ))}
      </div>
      <div className="dashboard-grid">
        <Card>
          <div className="card-head">
            <div>
              <h2>Your competency landscape</h2>
              <p>Demonstrated level relative to role target</p>
            </div>
            <RouteLink href={href("/competencies")}>View passport</RouteLink>
          </div>
          <div className="card-body">
            {scores.slice(0, 6).map((s) => (
              <div className="score-row" key={s.competency.id}>
                <div className="score-labels">
                  <span>{s.competency.name}</span>
                  <small>
                    {s.current === null
                      ? "Not assessed"
                      : `${s.current.toFixed(1)} / ${s.competency.target} target`}
                  </small>
                </div>
                <Progress
                  value={s.current === null ? 0 : (s.current / 5) * 100}
                  label={`${s.competency.name}, ${s.current === null ? "not assessed" : `${s.current} out of 5`}`}
                />
              </div>
            ))}
            <p className="score-note">
              <Info size={14} />
              Unknown competencies are not scored as zero.
            </p>
          </div>
        </Card>
        <Card>
          <div className="card-head">
            <div>
              <h2>{t("recommendations")}</h2>
              <p>Matched to your role and current evidence</p>
            </div>
            <RouteLink href={href("/recommendations")}>View all</RouteLink>
          </div>
          {ranked.slice(0, 3).map(({ course }) => (
            <div className="course-list-item" key={course.id}>
              <span className="course-icon">
                <BookOpen size={18} />
              </span>
              <div>
                <Badge
                  tone={course.provider === "NSSTA demo" ? "blue" : "teal"}
                >
                  {course.provider}
                </Badge>
                <h3>{course.title}</h3>
                <p>
                  {course.hours} hours · Level {course.level} · Synthetic course
                </p>
                <RouteLink href={href(`/courses/${course.id}`)}>
                  Explore course
                </RouteLink>
              </div>
            </div>
          ))}
        </Card>
      </div>
      <Card className="mission-strip">
        <FlaskConical />
        <div>
          <h2>Put your knowledge to work.</h2>
          <p>
            Investigate missing values, duplicate records and outliers in a
            synthetic survey.
          </p>
          <Badge tone="teal">PRACTICAL EVIDENCE · 15 MIN</Badge>
        </div>
        <RouteLink href={href("/practice-labs/quality")}>
          Start the mission
        </RouteLink>
      </Card>
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
