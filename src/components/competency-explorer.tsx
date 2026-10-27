"use client";
import { useState } from "react";
import {
  ArrowUpRight,
  BarChart3,
  List,
  Target,
  FileCheck2,
  Info,
} from "lucide-react";
import type { Score } from "@/lib/types";
import { Card, Badge, RouteLink } from "./ui/primitives";
import { useWorkspace } from "./workspace-context";
export function CompetencyExplorer({ scores }: { scores: Score[] }) {
  const { href } = useWorkspace();
  const [group, setGroup] = useState("all");
  const [view, setView] = useState<"chart" | "table">("chart");
  const [selectedId, setSelectedId] = useState(
    scores.find((s) => s.current !== null)?.competency.id,
  );
  const visible = scores.filter(
    (s) => group === "all" || s.competency.group === group,
  );
  const selected =
    visible.find((s) => s.competency.id === selectedId) ?? visible[0];
  return (
    <Card className="intelligence-card">
      <div className="card-head">
        <div>
          <span className="section-kicker">ROLE READINESS</span>
          <h2>Your competency landscape</h2>
          <p>Select a competency to inspect its evidence and next action.</p>
        </div>
        <RouteLink href={href("/competencies")}>Passport</RouteLink>
      </div>
      <div className="explorer-toolbar">
        <label>
          <span className="sr-only">Competency group</span>
          <select
            aria-label="Competency group"
            value={group}
            onChange={(e) => setGroup(e.target.value)}
          >
            <option value="all">All competency groups</option>
            {[...new Set(scores.map((s) => s.competency.group))].map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
        </label>
        <div
          className="view-switch"
          role="group"
          aria-label="Competency display"
        >
          <button
            aria-pressed={view === "chart"}
            onClick={() => setView("chart")}
          >
            <BarChart3 size={15} /> Chart
          </button>
          <button
            aria-pressed={view === "table"}
            onClick={() => setView("table")}
          >
            <List size={15} /> Table
          </button>
        </div>
      </div>
      {view === "table" ? (
        <div className="table-scroll explorer-table">
          <table>
            <caption className="sr-only">
              Competencies filtered by {group}
            </caption>
            <thead>
              <tr>
                <th>Competency</th>
                <th>Current / target</th>
                <th>Confidence</th>
                <th>Evidence</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((s) => (
                <tr key={s.competency.id}>
                  <td>
                    <a
                      className="text-link"
                      href={href(`/competencies#competency-${s.competency.id}`)}
                    >
                      {s.competency.name}
                      <ArrowUpRight size={13} />
                    </a>
                  </td>
                  <td>
                    {s.current === null ? "Unknown" : s.current.toFixed(1)} /{" "}
                    {s.competency.target}
                  </td>
                  <td>{Math.round(s.confidence * 100)}%</td>
                  <td>{s.evidence.length} items</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="explorer-grid">
          <div className="competency-bars">
            <div className="bar-legend">
              <span>
                <i /> Demonstrated level
              </span>
              <span>
                <i className="target-key" /> Role target
              </span>
            </div>
            {visible.map((s) => (
              <button
                key={s.competency.id}
                className={`competency-bar-row ${selected?.competency.id === s.competency.id ? "selected" : ""}`}
                aria-pressed={selected?.competency.id === s.competency.id}
                onClick={() => setSelectedId(s.competency.id)}
                aria-label={`Inspect ${s.competency.name}`}
              >
                <span className="bar-row-label">
                  <strong>{s.competency.name}</strong>
                  <span>
                    {s.current === null ? "Unknown" : s.current.toFixed(1)}
                    <small> / {s.competency.target}</small>
                  </span>
                </span>
                <span
                  className={`intelligence-track ${s.current === null ? "unknown" : ""}`}
                >
                  <span
                    className="intelligence-fill"
                    style={{ width: `${((s.current ?? 0) / 5) * 100}%` }}
                  />
                  <span
                    className="intelligence-target"
                    style={{ left: `${(s.competency.target / 5) * 100}%` }}
                  />
                </span>
              </button>
            ))}
            <div className="axis-labels">
              <span>0 · Foundation</span>
              <span>5 · Advanced</span>
            </div>
          </div>
          {selected && (
            <aside
              className="competency-inspector"
              aria-label="Selected competency details"
              aria-live="polite"
            >
              <Badge tone="teal">{selected.competency.group}</Badge>
              <h3>{selected.competency.name}</h3>
              <div className="inspector-level">
                {selected.current === null
                  ? "Unknown"
                  : selected.current.toFixed(1)}
                <span> / 5</span>
              </div>
              <p>
                <Target size={14} /> Target {selected.competency.target} ·{" "}
                {selected.gap === null
                  ? "Assess baseline"
                  : `${selected.gap.toFixed(1)} level gap`}
              </p>
              <div className="inspector-divider" />
              <span className="section-kicker">EVIDENCE STRENGTH</span>
              <strong>
                {Math.round(selected.confidence * 100)}% confidence
              </strong>
              <p>
                <FileCheck2 size={14} /> {selected.evidence.length} supporting
                record{selected.evidence.length === 1 ? "" : "s"}
              </p>
              <p className="inspector-source">
                {selected.evidence.at(-1)?.source ??
                  "No evidence yet. Unknown does not mean unskilled."}
              </p>
              <RouteLink
                href={href(
                  selected.current === null
                    ? "/diagnostic"
                    : "/recommendations",
                )}
              >
                {selected.current === null
                  ? "Assess this skill"
                  : "Explore suitable training"}
              </RouteLink>
            </aside>
          )}
        </div>
      )}
      <div className="intelligence-footnote">
        <Info size={14} /> Evidence-weighted estimates · 0–5 scale · proposed
        scoring rules
      </div>
    </Card>
  );
}
