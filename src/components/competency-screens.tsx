"use client";
import { useState } from "react";
import { Download, Info, Search } from "lucide-react";
import { useWorkspace } from "./workspace-context";
import { competencies } from "@/lib/fixtures";
import { scoreCompetencies } from "@/lib/engine";
import { Card, Badge, Progress, RouteLink } from "./ui/primitives";
import { Button } from "./ui/button";
export function downloadText(name: string, text: string, type = "text/plain") {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
export function Passport({ gapsOnly = false }: { gapsOnly?: boolean }) {
  const { state, href, demo } = useWorkspace();
  const [filter, setFilter] = useState("");
  const scores = scoreCompetencies(competencies, state.evidence);
  const visible = scores
    .filter((s) =>
      s.competency.name.toLowerCase().includes(filter.toLowerCase()),
    )
    .sort((a, b) => (b.priority ?? -1) - (a.priority ?? -1));
  return (
    <>
      <div className="notice">
        <Info size={18} />
        <p>
          Proficiency is estimated from diagnostic and practical evidence.
          Training completion is tracked separately. The weights and confidence
          model are proposed, not government standards.
        </p>
      </div>
      <div className="toolbar">
        <label className="search-box">
          <Search size={17} />
          <input
            aria-label="Search competencies"
            placeholder="Search competencies…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </label>
        <Button
          variant="outline"
          onClick={() =>
            downloadText(
              "unofficial-competency-passport.json",
              JSON.stringify(
                {
                  title: "UNOFFICIAL learning-progress report",
                  synthetic: demo,
                  generatedAt: new Date().toISOString(),
                  profile: state.profile,
                  scores,
                  trainingCompletions: state.completed,
                },
                null,
                2,
              ),
              "application/json",
            )
          }
        >
          <Download size={16} /> Export unofficial report
        </Button>
      </div>
      {gapsOnly ? (
        <div className="table-scroll">
          <table>
            <caption>Explainable skill gaps · scoring rule v1</caption>
            <thead>
              <tr>
                <th>Competency</th>
                <th>Demonstrated / target</th>
                <th>Gap</th>
                <th>Confidence</th>
                <th>Priority</th>
                <th>Next action</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((s) => (
                <tr key={s.competency.id}>
                  <td>
                    <strong>{s.competency.name}</strong>
                    <small>{s.competency.group}</small>
                  </td>
                  <td>
                    {s.current === null ? "Unknown" : s.current.toFixed(2)} /{" "}
                    {s.competency.target}
                  </td>
                  <td>{s.gap === null ? "Unknown" : s.gap.toFixed(2)}</td>
                  <td>
                    {Math.round(s.confidence * 100)}%
                    {s.conflict ? " · conflicting evidence" : ""}
                  </td>
                  <td>
                    {s.priority === null
                      ? "Awaiting evidence"
                      : s.priority.toFixed(3)}
                  </td>
                  <td>
                    <RouteLink
                      href={href(
                        s.current === null ? "/diagnostic" : "/recommendations",
                      )}
                    >
                      {s.current === null ? "Assess baseline" : "Find training"}
                    </RouteLink>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="passport-grid">
          {visible.map((s) => (
            <Card className="passport-card" id={`competency-${s.competency.id}`} key={s.competency.id}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <h2>{s.competency.name}</h2>
                <Badge>{s.competency.group}</Badge>
              </div>
              <div className="level">
                {s.current === null ? "Unknown" : s.current.toFixed(1)}
                <small> / 5 · target {s.competency.target}</small>
              </div>
              <Progress
                value={((s.current ?? 0) / 5) * 100}
                label={`${s.competency.name} proficiency`}
              />
              <p style={{ marginTop: 12 }}>
                Confidence {Math.round(s.confidence * 100)}% ·{" "}
                {s.evidence.length} evidence item(s)
                {s.conflict ? " · conflicting evidence reduces confidence" : ""}
              </p>
              <details>
                <summary>Inspect supporting evidence</summary>
                {s.evidence.length ? (
                  s.evidence.map((e) => (
                    <div className="evidence-item" key={e.id}>
                      <strong>{e.source}</strong>
                      <small>
                        {e.kind} · level {e.level.toFixed(1)}/5 ·{" "}
                        {new Date(e.date).toLocaleDateString("en-IN")} ·{" "}
                        {e.version}
                      </small>
                    </div>
                  ))
                ) : (
                  <p>
                    No baseline evidence yet. Take a diagnostic; absence of
                    evidence is not evidence of incompetence.
                  </p>
                )}
                <RouteLink href={href("/diagnostic")}>
                  Add assessment evidence
                </RouteLink>
              </details>
            </Card>
          ))}
        </div>
      )}
      {!visible.length && (
        <p role="status">No competencies match your search.</p>
      )}
    </>
  );
}
export function ProgressScreen() {
  const { state, href } = useWorkspace();
  const events = [...state.evidence].sort((a, b) =>
    b.date.localeCompare(a.date),
  );
  const baseline = state.evidence.filter((e) => e.kind === "diagnostic");
  const later = state.evidence.filter(
    (e) => e.kind === "post-assessment" || e.kind === "practice",
  );
  const before = scoreCompetencies(competencies, baseline);
  const after = scoreCompetencies(competencies, state.evidence);
  return (
    <div className="section-stack">
      <div className="notice">
        <Info size={18} />
        <p>
          These are observed evidence changes. Score differences do not prove
          that training caused improvement. Small question counts provide
          limited confidence.
        </p>
      </div>
      <Card>
        <div className="card-head">
          <h2>Before and after, with context</h2>
          <Badge tone="teal">{later.length} later evidence item(s)</Badge>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Competency</th>
                <th>Baseline estimate</th>
                <th>Current estimate</th>
                <th>Difference</th>
              </tr>
            </thead>
            <tbody>
              {after.map((s, i) => (
                <tr key={s.competency.id}>
                  <td>{s.competency.name}</td>
                  <td>{before[i].current ?? "Unknown"}</td>
                  <td>{s.current ?? "Unknown"}</td>
                  <td>
                    {s.current !== null && before[i].current !== null
                      ? (s.current - before[i].current!).toFixed(2)
                      : "Insufficient evidence"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card>
        <div className="card-head">
          <h2>Evidence timeline</h2>
          <RouteLink href={href("/competencies")}>Export passport</RouteLink>
        </div>
        <div className="card-body timeline">
          {events.map((e) => (
            <div className="timeline-item" key={e.id}>
              <h3>
                {competencies.find((c) => c.id === e.competencyId)?.name ??
                  e.competencyId}{" "}
                · {e.level.toFixed(1)}/5
              </h3>
              <p>{e.source}</p>
              <p>
                {e.kind} · {new Date(e.date).toLocaleDateString("en-IN")} ·
                confidence {Math.round(e.confidence * 100)}% · rule {e.version}
              </p>
            </div>
          ))}
          {!events.length && <p>No evidence recorded yet.</p>}
        </div>
      </Card>
    </div>
  );
}
