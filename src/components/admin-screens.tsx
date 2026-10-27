"use client";
import { useState } from "react";
import {
  Info,
  Users,
  Target,
  Clock3,
  Download,
  SlidersHorizontal,
  ShieldCheck,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Catalogue } from "./learning-screens";
import { useWorkspace } from "./workspace-context";
import { Card, Badge, Field, RouteLink, Empty } from "./ui/primitives";
import { Button } from "./ui/button";
import { cohort, competencies } from "@/lib/fixtures";
import { simulate, scenarioSchema } from "@/lib/engine";
import { downloadText } from "./competency-screens";
export function AdminScreen({ section = "analytics" }: { section?: string }) {
  const { state, demo, href, role } = useWorkspace();
  const [department, setDepartment] = useState("all");
  const data = cohort.filter(
    (x) => department === "all" || x.department === department,
  );
  const chart = demo
    ? ["sampling", "python", "sql"].map((key) => ({
        name: key[0].toUpperCase() + key.slice(1),
        mean_level: Number(
          (
            data.reduce(
              (s, r) => s + r[key as "sampling" | "python" | "sql"],
              0,
            ) / Math.max(data.length, 1)
          ).toFixed(2),
        ),
        learners: data.length,
      }))
    : (state.organizationAnalytics?.map((x) => ({
        name:
          competencies.find((c) => c.id === x.competency_id)?.name ??
          x.competency_id,
        mean_level: Number(x.mean_level),
        learners: x.learners,
      })) ?? []);
  const nav = [
    ["analytics", "Analytics"],
    ["workforce", "Workforce"],
    ["competency-framework", "Framework"],
    ["learning-plans", "Training plans"],
    ["training-programmes", "NSSTA catalogue"],
    ["impact-simulator", "Impact simulator"],
    ["integrations", "Integrations"],
    ["users", "Access controls"],
    ["audit-logs", "Audit status"],
  ];
  if (section === "impact-simulator")
    return (
      <>
        <AdminNav nav={nav} href={href} />
        <Simulator />
      </>
    );
  if (section === "integrations")
    return (
      <>
        <AdminNav nav={nav} href={href} />
        <IntegrationStatus />
      </>
    );
  if (section === "training-programmes")
    return (
      <>
        <AdminNav nav={nav} href={href} />
        <Catalogue nssta />
      </>
    );
  if (section === "competency-framework")
    return (
      <>
        <AdminNav nav={nav} href={href} />
        <div className="notice">
          <Info size={18} />
          <p>
            Demonstration framework v1. Role targets and priority weights below
            are proposed settings. Live framework editing is pending
            administrative provisioning.
          </p>
        </div>
        <div className="table-scroll">
          <table>
            <caption>
              Survey analyst role · demonstration target requirements
            </caption>
            <thead>
              <tr>
                <th>Competency</th>
                <th>Group</th>
                <th>Target / 5</th>
                <th>Role importance</th>
                <th>Department priority</th>
              </tr>
            </thead>
            <tbody>
              {competencies.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.group}</td>
                  <td>{c.target}</td>
                  <td>{c.importance}</td>
                  <td>{c.departmentPriority}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  if (["learning-plans", "users", "audit-logs"].includes(section))
    return (
      <>
        <AdminNav nav={nav} href={href} />
        <Card className="card-body">
          <ShieldCheck size={24} />
          <h2 style={{ marginTop: 15 }}>
            {section === "learning-plans"
              ? "Department training plans"
              : section === "users"
                ? "Server-controlled access"
                : "Auditable activity"}
          </h2>
          <p className="muted" style={{ fontSize: 13, marginTop: 12 }}>
            {section === "learning-plans"
              ? "Use the simulator to review training assumptions and resource hours. Persistent cohort plan management is not yet implemented."
              : section === "users"
                ? `Current access: ${demo ? "simulated administrator view" : role}. Users cannot change membership roles through profile fields. Real role provisioning requires a trusted platform administrator; account-management mutations are not exposed.`
                : "Live assessment publication, question review and assessment submission write database audit records. This demonstration does not invent live security logs. A full operational log viewer is pending."}
          </p>
          <div className="form-actions">
            <RouteLink href={href("/admin/impact-simulator")}>
              Open planning simulator
            </RouteLink>
          </div>
        </Card>
      </>
    );
  return (
    <>
      <AdminNav nav={nav} href={href} />
      <div className="notice">
        <Info size={18} />
        <p>
          {demo
            ? "All workforce records below are deterministic synthetic fixtures. Aggregates are calculated from those fixtures."
            : "Only authorized department aggregates are returned. Cohorts with fewer than five learners are suppressed. Identifiable employee rows are not exposed."}
        </p>
      </div>
      {demo && (
        <div className="toolbar">
          <Field label="Department">
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="all">All synthetic departments</option>
              {[...new Set(cohort.map((x) => x.department))].map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </Field>
          <Button
            variant="outline"
            onClick={() =>
              downloadText(
                "synthetic-workforce-aggregates.csv",
                "competency,mean_level,learner_count\n" +
                  chart
                    .map((x) => `${x.name},${x.mean_level},${x.learners}`)
                    .join("\n"),
                "text/csv",
              )
            }
          >
            <Download size={16} />
            Export aggregates
          </Button>
        </div>
      )}
      {demo && (
        <div className="stats-grid">
          {[
            {
              label: "Authorized synthetic learners",
              value: data.length,
              icon: Users,
            },
            {
              label: "Coverage ≥ level 3 · Python",
              value: `${Math.round((data.filter((x) => x.python >= 3).length / Math.max(data.length, 1)) * 100)}%`,
              icon: Target,
            },
            {
              label: "Reported training hours",
              value: data.reduce((s, x) => s + x.hours, 0),
              icon: Clock3,
            },
            {
              label: "Course completion proportion",
              value: `${Math.round((data.filter((x) => x.completed).length / Math.max(data.length, 1)) * 100)}%`,
              icon: ShieldCheck,
            },
          ].map((s) => (
            <Card className="stat-card" key={s.label}>
              <div className="stat-top">
                {s.label}
                <s.icon size={16} />
              </div>
              <div className="stat-value">{s.value}</div>
              <p className="stat-foot">Calculated from synthetic fixtures</p>
            </Card>
          ))}
        </div>
      )}
      {chart.length ? (
        <Card>
          <div className="card-head">
            <h2>Competency distribution</h2>
            <Badge tone="teal">
              {demo ? "SYNTHETIC AGGREGATES" : "DEPARTMENT AGGREGATES"}
            </Badge>
          </div>
          <div className="card-body">
            <div
              className="chart-area"
              role="img"
              aria-label="Bar chart of mean competency estimates. Exact values are in the following table."
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chart} accessibilityLayer>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "var(--muted)" }}
                  />
                  <YAxis
                    domain={[0, 5]}
                    tick={{ fontSize: 11, fill: "var(--muted)" }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--surface)",
                      color: "var(--ink)",
                      border: "1px solid var(--border)",
                    }}
                  />
                  <Bar
                    dataKey="mean_level"
                    name="Mean level / 5"
                    fill="var(--teal)"
                    radius={[5, 5, 0, 0]}
                    maxBarSize={55}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <table>
              <caption>Accessible competency aggregate values</caption>
              <thead>
                <tr>
                  <th>Competency</th>
                  <th>Mean level / 5</th>
                  <th>Learners</th>
                </tr>
              </thead>
              <tbody>
                {chart.map((c) => (
                  <tr key={c.name}>
                    <td>{c.name}</td>
                    <td>{c.mean_level}</td>
                    <td>{c.learners}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Empty
          title="No reportable aggregates"
          description="There may be no evidence yet, or all authorized cohorts are smaller than the minimum disclosure threshold of five learners."
        />
      )}
      <Card className="mission-strip">
        <SlidersHorizontal />
        <div>
          <h2>Explore a capacity-building scenario</h2>
          <p>
            Change participation, completion and effectiveness assumptions.
            Inspect all three scenarios.
          </p>
        </div>
        <RouteLink href={href("/admin/impact-simulator")}>
          Run a simulation
        </RouteLink>
      </Card>
    </>
  );
}
function AdminNav({
  nav,
  href,
}: {
  nav: string[][];
  href: (s: string) => string;
}) {
  return (
    <nav aria-label="Administration pages" className="toolbar">
      {nav.map(([key, label]) => (
        <RouteLink key={key} href={href(`/admin/${key}`)}>
          {label}
        </RouteLink>
      ))}
    </nav>
  );
}
export function Simulator() {
  const { demo, act, notify } = useWorkspace();
  const [input, setInput] = useState({
    population: 200,
    participation: 0.8,
    completion: 0.85,
    effectiveness: 0.5,
    hours: 10,
    baselineCoverage: 0.3,
  });
  const parsed = scenarioSchema.safeParse(input);
  const result = parsed.success ? simulate(parsed.data) : [];
  return (
    <>
      <div className="notice warning">
        <Info size={18} />
        <p>
          SIMULATION · These are assumption-based projections, not AI forecasts
          or established training impact. Effectiveness is a hypothetical
          proportion of remaining uncovered participants who gain target-level
          evidence. No causal effect is asserted.
        </p>
      </div>
      <div className="simulation-grid">
        <Card className="card-body">
          <h2>Make the assumptions explicit</h2>
          <div className="section-stack" style={{ marginTop: 22 }}>
            <Field label="Population size">
              <input
                type="number"
                min="1"
                max="1000000"
                value={input.population}
                onChange={(e) =>
                  setInput({ ...input, population: Number(e.target.value) })
                }
              />
            </Field>
            {(
              [
                ["participation", "Participation assumption"],
                ["completion", "Completion assumption"],
                ["effectiveness", "Effectiveness assumption"],
                ["baselineCoverage", "Initial competency coverage"],
              ] as const
            ).map(([key, label]) => (
              <Field
                key={key}
                label={`${label} · ${Math.round(input[key] * 100)}%`}
              >
                <input
                  className="range-input"
                  type="range"
                  min="0"
                  max="100"
                  value={input[key] * 100}
                  onChange={(e) =>
                    setInput({ ...input, [key]: Number(e.target.value) / 100 })
                  }
                />
              </Field>
            ))}
            <Field label="Training hours per participant">
              <input
                type="number"
                min="0"
                max="2000"
                value={input.hours}
                onChange={(e) =>
                  setInput({ ...input, hours: Number(e.target.value) })
                }
              />
            </Field>
            <p className="token-hint">
              Coverage = baseline + completers × effectiveness × remaining
              uncovered share. Best/conservative effectiveness factors: 1.2 /
              0.75, capped at 100%.
            </p>
            {!parsed.success && (
              <p role="alert" className="error-text">
                Use a population between 1 and 1,000,000 and 0–2,000 training
                hours.
              </p>
            )}
            <Button
              disabled={!parsed.success}
              onClick={async () => {
                if (demo) {
                  notify(
                    "This is a simulated planning scenario. Export it to retain the assumptions.",
                  );
                  return;
                }
                await act("save-scenario", { assumptions: input });
              }}
            >
              Save {demo ? "simulated" : "planning"} scenario
            </Button>
            <Button
              variant="outline"
              disabled={!parsed.success}
              onClick={() =>
                downloadText(
                  "training-impact-simulation.json",
                  JSON.stringify(
                    {
                      label: "SIMULATION — NOT A FORECAST",
                      assumptions: input,
                      result,
                    },
                    null,
                    2,
                  ),
                  "application/json",
                )
              }
            >
              <Download size={16} />
              Export assumptions & results
            </Button>
          </div>
        </Card>
        <div>
          {result.map((r) => (
            <Card className="sim-result" key={r.name}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h3>{r.name} scenario</h3>
                <Badge>SIMULATION</Badge>
              </div>
              <div className="sim-numbers">
                <div>
                  <strong>{(r.coverage * 100).toFixed(1)}%</strong>
                  <small>Projected competency coverage</small>
                </div>
                <div>
                  <strong>{r.remaining}</strong>
                  <small>Remaining uncovered learners</small>
                </div>
              </div>
              <div className="sim-numbers">
                <div>
                  {r.participants}
                  <small>Estimated participants</small>
                </div>
                <div>
                  {r.completers}
                  <small>Expected completers</small>
                </div>
                <div>
                  {r.hours.toLocaleString()}
                  <small>Participant training hours</small>
                </div>
              </div>
              <p className="token-hint">
                Hypothetical effectiveness: {Math.round(r.assumption * 100)}%.
                Inputs and outcomes are estimated, not observed.
              </p>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
export function IntegrationStatus() {
  return (
    <div className="status-grid">
      {[
        {
          title: "iGOT Karmayogi",
          status: "DEMO ADAPTER",
          text: "Synthetic catalogue available. Authorized provider fails closed until approved API documentation and credentials are supplied.",
        },
        {
          title: "NSSTA / TPAC",
          status: "SYNTHETIC CATALOGUE",
          text: "Programme records are illustrative. No TPAC approvals, dates or official enrolments are claimed.",
        },
        {
          title: "AI generation & tutor",
          status: "CONFIGURATION REQUIRED",
          text: "Server-side compatible provider adapter implemented. Prewritten examples are shown only in labeled demo mode. Provider credentials have not been configured or tested.",
        },
        {
          title: "Supabase & Render",
          status: "CLOUD VERIFICATION PENDING",
          text: "Source includes migrations, Auth integration and Render instructions. Cloud resources have not been selected, migrated or deployed.",
        },
      ].map((x) => (
        <Card key={x.title}>
          <Badge tone="amber">{x.status}</Badge>
          <h2>{x.title}</h2>
          <p>{x.text}</p>
        </Card>
      ))}
    </div>
  );
}
