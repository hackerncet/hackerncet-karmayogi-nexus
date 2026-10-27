"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BarChart3,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  Layers3,
  Users,
} from "lucide-react";
import { competencies, initialDemo, cohort } from "@/lib/fixtures";
import { scoreCompetencies } from "@/lib/engine";
const perspectives = ["Learner", "Trainer", "Organization"] as const;
export function PlatformPreview() {
  const [perspective, setPerspective] =
    useState<(typeof perspectives)[number]>("Learner");
  const demo = initialDemo();
  const scores = scoreCompetencies(competencies, demo.evidence);
  const route =
    perspective === "Learner"
      ? "/demo/dashboard"
      : perspective === "Trainer"
        ? "/demo/trainer"
        : "/demo/admin";
  return (
    <div className="platform-preview">
      <div className="preview-window-bar">
        <span className="preview-wordmark">
          <Layers3 size={17} /> nexus <span>/ workspace</span>
        </span>
        <span className="preview-live-label">INTERACTIVE PREVIEW</span>
      </div>
      <div
        className="preview-perspectives"
        role="group"
        aria-label="Preview perspective"
      >
        {perspectives.map((p) => (
          <button
            key={p}
            aria-pressed={perspective === p}
            onClick={() => setPerspective(p)}
          >
            {p === "Learner" ? (
              <LayoutDashboard size={15} />
            ) : p === "Trainer" ? (
              <ClipboardCheck size={15} />
            ) : (
              <Users size={15} />
            )}
            {p}
          </button>
        ))}
      </div>
      <div className="preview-workspace-content" aria-live="polite">
        <div className="preview-section-heading">
          <div>
            <span className="section-kicker">
              {perspective === "Organization"
                ? "WORKFORCE INTELLIGENCE"
                : perspective === "Trainer"
                  ? "CONTENT OPERATIONS"
                  : "PERSONAL COMPETENCY INTELLIGENCE"}
            </span>
            <h2>
              {perspective === "Learner"
                ? "A clearer path forward."
                : perspective === "Trainer"
                  ? "From source to assessment."
                  : "See capacity. Plan action."}
            </h2>
          </div>
          <span className="preview-avatar">
            {perspective === "Learner"
              ? "AR"
              : perspective === "Trainer"
                ? "TR"
                : "OP"}
          </span>
        </div>
        <div className="preview-metrics">
          {(perspective === "Learner"
            ? [
                {
                  label: "Skills with evidence",
                  value: `${scores.filter((s) => s.current !== null).length}/${scores.length}`,
                },
                {
                  label: "Priority gaps",
                  value: scores.filter((s) => (s.gap ?? 0) > 0).length,
                },
                {
                  label: "Practical attempts",
                  value: Object.values(demo.labAttempts).reduce(
                    (a, b) => a + b,
                    0,
                  ),
                },
              ]
            : perspective === "Trainer"
              ? [
                  { label: "Source materials", value: demo.materials.length },
                  {
                    label: "Reviewed questions",
                    value: demo.approvedQuestions.length,
                  },
                  { label: "Published quiz", value: demo.published ? 1 : 0 },
                ]
              : [
                  { label: "Synthetic officers", value: cohort.length },
                  {
                    label: "Departments",
                    value: new Set(cohort.map((p) => p.department)).size,
                  },
                  { label: "Tracked skills", value: 3 },
                ]
          ).map((m) => (
            <div key={m.label}>
              <strong>{m.value}</strong>
              <span>{m.label}</span>
            </div>
          ))}
        </div>
        <div className="preview-chart-head">
          <h3>
            {perspective === "Learner"
              ? "Current evidence vs. role target"
              : perspective === "Trainer"
                ? "Your assessment workflow"
                : "Mean proficiency across the demo cohort"}
          </h3>
          <span>
            {perspective === "Trainer" ? "Source grounded" : "0–5 scale"}
          </span>
        </div>
        {perspective === "Trainer" ? (
          <div className="preview-workflow">
            {[
              {
                label: "01",
                title: "Upload learning material",
                detail: "Private documents, located source excerpts",
                path: "materials",
              },
              {
                label: "02",
                title: "Review draft questions",
                detail: "Validate answers and supporting citations",
                path: "question-bank",
              },
              {
                label: "03",
                title: "Publish a reviewed assessment",
                detail: "Protected answers and server-side grading",
                path: "assessment-builder",
              },
            ].map((s) => (
              <Link href={`/demo/trainer/${s.path}`} key={s.path}>
                <span>{s.label}</span>
                <div>
                  <strong>{s.title}</strong>
                  <small>{s.detail}</small>
                </div>
                <ArrowUpRight size={16} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="preview-chart">
            {(perspective === "Learner"
              ? scores
                  .filter((s) => s.current !== null)
                  .slice(0, 4)
                  .map((s) => ({
                    label: s.competency.name,
                    value: s.current!,
                    target: s.competency.target,
                  }))
              : (["sampling", "python", "sql"] as const).map((key) => ({
                  label:
                    key === "sampling"
                      ? "Sampling & estimation"
                      : key === "python"
                        ? "Python"
                        : "SQL & data handling",
                  value: cohort.reduce((n, p) => n + p[key], 0) / cohort.length,
                  target: null,
                }))
            ).map((s) => (
              <Link
                href={
                  perspective === "Learner"
                    ? "/demo/competencies"
                    : "/demo/admin/analytics"
                }
                key={s.label}
                className="preview-chart-row"
              >
                <span>
                  {s.label}
                  <strong>
                    {s.value.toFixed(1)}
                    <small> / 5</small>
                  </strong>
                </span>
                <span className="preview-chart-track">
                  <i style={{ width: `${(s.value / 5) * 100}%` }} />
                  {s.target !== null && (
                    <b style={{ left: `${(s.target / 5) * 100}%` }} />
                  )}
                </span>
              </Link>
            ))}
          </div>
        )}
        <Link href={route} className="preview-action">
          <span>
            {perspective === "Learner" ? (
              <BarChart3 size={18} />
            ) : (
              <FileText size={18} />
            )}
            Open {perspective.toLowerCase()} demonstration
          </span>
          <ArrowUpRight size={17} />
        </Link>
      </div>
      <div className="preview-provenance">
        <span className="dot" /> Synthetic, deterministic data · Independent SIH
        demonstration
      </div>
    </div>
  );
}
