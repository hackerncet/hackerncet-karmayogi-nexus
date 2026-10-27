"use client";
import { useState } from "react";
import { FlaskConical, Info } from "lucide-react";
import { useWorkspace } from "./workspace-context";
import {
  labDefinitions,
  surveyRows,
  issueLabels,
  evaluateLab,
} from "@/lib/labs";
import { Card, Badge, Field, RouteLink, Empty } from "./ui/primitives";
import { Button } from "./ui/button";
export function Labs({ id }: { id?: string }) {
  const { state, act, demo, href, notify } = useWorkspace();
  const [selected, setSelected] = useState<number[]>([]);
  const [weight, setWeight] = useState("");
  const [mean, setMean] = useState("");
  const [choice, setChoice] = useState(-1);
  const [sql, setSql] = useState("SELECT COUNT(*) FROM survey");
  const [result, setResult] = useState<{
    score: number;
    feedback: string;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const lab = labDefinitions.find((l) => l.id === id);
  async function submit() {
    if (!lab) return;
    setBusy(true);
    const input =
      id === "quality"
        ? selected
        : id === "sampling"
          ? { weight: Number(weight), mean: Number(mean) }
          : id === "interpretation"
            ? choice
            : sql;
    try {
      if (demo) {
        const r = evaluateLab(lab.id, input);
        setResult(r);
        await act("lab", { id, input }, (s) => ({
          ...s,
          labAttempts: {
            ...s.labAttempts,
            [lab.id]: (s.labAttempts[lab.id] ?? 0) + 1,
          },
          evidence: [
            ...s.evidence,
            {
              id: crypto.randomUUID(),
              competencyId: r.competencyId,
              level: (r.score / 100) * 5,
              confidence: 0.6,
              kind: "practice",
              date: new Date().toISOString(),
              version: "lab-rules-v1",
              source: `Mission lab: ${lab.title} (${r.score}%)`,
            },
          ],
        }));
      } else {
        const res = await fetch("/api/labs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, input }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setResult(data);
        await act("refresh", {});
      }
    } catch (e) {
      notify(e instanceof Error ? e.message : "Lab evaluation failed");
    } finally {
      setBusy(false);
    }
  }
  if (!id)
    return (
      <>
        <div className="notice">
          <FlaskConical size={18} />
          <p>
            Four statistical missions. Synthetic datasets, deterministic
            evaluation, no unrestricted code execution. Every attempt adds
            explicitly scoped practical evidence.
          </p>
        </div>
        <div className="lab-grid">
          {labDefinitions.map((l, i) => (
            <Card className="lab-card" key={l.id}>
              <span className="lab-index">
                MISSION {String(i + 1).padStart(2, "0")} /{" "}
                {l.duration.toUpperCase()}
              </span>
              <div className="lab-icon">
                <FlaskConical size={22} />
              </div>
              <h2>{l.title}</h2>
              <p>{l.description}</p>
              <div className="course-actions">
                <RouteLink href={href(`/practice-labs/${l.id}`)}>
                  Enter mission
                </RouteLink>
                <Badge>{state.labAttempts[l.id] ?? 0} attempts</Badge>
              </div>
            </Card>
          ))}
        </div>
      </>
    );
  if (!lab)
    return (
      <Empty
        title="Mission not found"
        description="Choose a supported statistical mission."
        action={
          <RouteLink href={href("/practice-labs")}>View missions</RouteLink>
        }
      />
    );
  return (
    <div className="section-stack">
      <div className="notice">
        <Info size={18} />
        <p>
          {lab.description}{" "}
          {demo
            ? "Every action here is simulated."
            : "Scores are evaluated on the server."}
        </p>
      </div>
      <Card>
        <div className="card-head">
          <h2>{lab.title}</h2>
          <Badge tone="teal">SYNTHETIC DATA</Badge>
        </div>
        {id === "quality" && (
          <div className="table-scroll">
            <table>
              <caption>Synthetic household survey · all six records</caption>
              <thead>
                <tr>
                  <th>Identifier</th>
                  <th>Region</th>
                  <th>Age</th>
                  <th>Income (₹)</th>
                  <th>Weight</th>
                </tr>
              </thead>
              <tbody>
                {surveyRows.map((r, i) => (
                  <tr key={i}>
                    <td>{r.id}</td>
                    <td>{r.region}</td>
                    <td>{r.age}</td>
                    <td>{r.income ?? "Missing"}</td>
                    <td>{r.weight}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <form
          className="lab-form"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          {id === "quality" && (
            <fieldset>
              <legend>
                Which issues need investigation? Select all that apply.
              </legend>
              {issueLabels.map((l, i) => (
                <label className="answer-option" key={l}>
                  <input
                    type="checkbox"
                    checked={selected.includes(i)}
                    onChange={(e) =>
                      setSelected(
                        e.target.checked
                          ? [...selected, i]
                          : selected.filter((n) => n !== i),
                      )
                    }
                  />
                  {l}
                </label>
              ))}
            </fieldset>
          )}
          {id === "sampling" && (
            <div className="form-grid">
              <Field label="Weight for inclusion probability 0.2">
                <input
                  type="number"
                  step="any"
                  required
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </Field>
              <Field label="Weighted mean: values [10, 30], weights [1, 4]">
                <input
                  type="number"
                  step="any"
                  required
                  value={mean}
                  onChange={(e) => setMean(e.target.value)}
                />
              </Field>
            </div>
          )}
          {id === "interpretation" && (
            <fieldset>
              <legend>
                A synthetic indicator rose from 40% to 50%. Which interpretation
                is defensible?
              </legend>
              {[
                "It increased by 10%, proving training worked.",
                "It increased by 10 percentage points; the cause is not established.",
                "It doubled, so no uncertainty remains.",
              ].map((l, i) => (
                <label className="answer-option" key={l}>
                  <input
                    required
                    type="radio"
                    name="interpretation"
                    value={i}
                    onChange={() => setChoice(i)}
                  />
                  {l}
                </label>
              ))}
            </fieldset>
          )}
          {id === "sql" && (
            <Field
              label="Read-only training query"
              hint="Supported: SELECT COUNT(*) FROM survey; SELECT region, COUNT(*) FROM survey GROUP BY region. Fixed grammar only."
            >
              <textarea
                value={sql}
                onChange={(e) => setSql(e.target.value)}
                maxLength={500}
                required
                spellCheck={false}
              />
            </Field>
          )}
          <div className="form-actions">
            <Button disabled={busy}>
              {busy ? "Evaluating…" : "Evaluate mission"}
            </Button>
          </div>
          {result && (
            <div className="feedback" role="status">
              <strong>Score: {result.score}%</strong>
              <p>{result.feedback}</p>
              <RouteLink href={href("/competencies")}>
                Inspect your updated passport
              </RouteLink>
            </div>
          )}
        </form>
      </Card>
    </div>
  );
}
