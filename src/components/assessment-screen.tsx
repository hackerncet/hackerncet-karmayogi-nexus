"use client";
import { useState } from "react";
import { ClipboardCheck, Info, RotateCcw } from "lucide-react";
import { useWorkspace } from "./workspace-context";
import { Card, Badge, Empty, Progress, RouteLink } from "./ui/primitives";
import { Button } from "./ui/button";
import { diagnosticQuestions } from "@/lib/fixtures";
import { grade, evidenceFromGrade, publicQuestions } from "@/lib/engine";
import type { PublicQuestion } from "@/lib/types";
type GradeResult = {
  score: number;
  results: {
    questionId: string;
    correct: boolean;
    explanation: string;
    answer: number[];
  }[];
};
export function AssessmentScreen({
  id = "baseline",
  list = false,
}: {
  id?: string;
  list?: boolean;
}) {
  const { state, demo, href, act, notify } = useWorkspace();
  const key = id === "baseline" ? "baseline" : id;
  const [started, setStarted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [liveQuestions, setLiveQuestions] = useState<PublicQuestion[]>([]);
  const [attemptId, setAttemptId] = useState("");
  const [responses, setResponses] = useState<Record<string, number[]>>(
    state.assessmentDrafts[key] ?? {},
  );
  const [result, setResult] = useState<GradeResult | null>(null);
  const isPublished = id === "published";
  const raw = isPublished ? state.questions : diagnosticQuestions;
  const questions = demo ? publicQuestions(raw) : liveQuestions;
  async function start() {
    setBusy(true);
    try {
      if (!demo) {
        const res = await fetch("/api/assessments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "start", assessmentId: id }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setLiveQuestions(data.questions);
        setAttemptId(data.attemptId);
        setResponses(data.responses ?? {});
      }
      if (demo) setResponses(state.assessmentDrafts[key] ?? {});
      setStarted(true);
    } catch (e) {
      notify(e instanceof Error ? e.message : "Unable to start assessment");
    } finally {
      setBusy(false);
    }
  }
  function answer(q: PublicQuestion, index: number, checked: boolean) {
    const selected =
      q.type === "multiple"
        ? checked
          ? [...(responses[q.id] ?? []), index]
          : (responses[q.id] ?? []).filter((x) => x !== index)
        : [index];
    const next = { ...responses, [q.id]: selected };
    setResponses(next);
    if (demo)
      act("save-draft", {}, (s) => ({
        ...s,
        assessmentDrafts: { ...s.assessmentDrafts, [key]: next },
      }));
  }
  async function save() {
    if (demo) {
      notify("Simulated answers are saved automatically in this browser.");
      return;
    }
    setBusy(true);
    try {
      const r = await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save", attemptId, responses }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      notify("Answers saved. Resume this assessment before its deadline.");
    } catch (e) {
      notify(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }
  async function submit() {
    setBusy(true);
    try {
      if (demo) {
        const g = grade(raw, responses);
        setResult(g);
        const evidence = evidenceFromGrade(
          raw,
          responses,
          id === "baseline" ? "diagnostic" : "post-assessment",
          new Date().toISOString(),
        );
        await act("assessment", { id }, (s) => ({
          ...s,
          evidence: [...s.evidence, ...evidence],
          diagnosticRuns: s.diagnosticRuns + 1,
          assessmentDrafts: { ...s.assessmentDrafts, [key]: {} },
        }));
      } else {
        const r = await fetch("/api/assessments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "submit", attemptId, responses }),
        });
        const data = await r.json();
        if (!r.ok) throw new Error(data.error);
        setResult(data);
        await act("refresh", {});
      }
    } catch (e) {
      notify(e instanceof Error ? e.message : "Evaluation failed");
    } finally {
      setBusy(false);
    }
  }
  if (list)
    return (
      <div className="section-stack">
        {[
          {
            id: "baseline",
            title: "Baseline competency diagnostic",
            text: "Establish initial evidence across sampling, quality, Python, SQL and privacy.",
          },
          {
            id: "post-training",
            title: "Post-training practice assessment",
            text: "Comparable coverage for observed progress; practice questions may be repeated.",
          },
          ...(demo && state.published
            ? [
                {
                  id: "published",
                  title: "Trainer-published demonstration quiz",
                  text: "Questions reviewed and published in this isolated browser demonstration.",
                },
              ]
            : []),
        ].map((a) => (
          <Card className="mission-strip" key={a.id}>
            <ClipboardCheck />
            <div>
              <h2>{a.title}</h2>
              <p>{a.text}</p>
            </div>
            <RouteLink href={href(`/assessments/${a.id}`)}>
              Open assessment
            </RouteLink>
          </Card>
        ))}
      </div>
    );
  if (isPublished && !state.published)
    return (
      <Empty
        title="No published quiz yet"
        description="A trainer must review and publish the demonstration question bank before this quiz becomes available."
        action={
          <RouteLink href={href("/trainer/question-bank")}>
            Open trainer studio
          </RouteLink>
        }
      />
    );
  if (!started)
    return (
      <Card className="quiz-result">
        <ClipboardCheck
          size={32}
          style={{ margin: "0 auto 15px", color: "var(--teal)" }}
        />
        <h2>
          {id === "baseline"
            ? "Your baseline starts with evidence."
            : "Demonstrate your next milestone."}
        </h2>
        <p
          className="muted"
          style={{ fontSize: 13, margin: "15px auto", maxWidth: 550 }}
        >
          {demo
            ? `${raw.length} practice questions · untimed · resumable in this browser · simulated grading`
            : "Assessments are loaded from the authorized question bank. Grading and attempt policy are enforced on the server."}
        </p>
        <div className="notice" style={{ textAlign: "left" }}>
          <Info size={18} />
          <p>
            Small diagnostic sets produce uncertain estimates. Results are
            unofficial learning evidence. They do not award certification.
            Multi-answer questions require every correct option and no extra
            options.
          </p>
        </div>
        <Button disabled={busy} onClick={start}>
          {busy ? "Starting…" : "Begin assessment"}
        </Button>
      </Card>
    );
  return (
    <div className="quiz-wrap">
      {result && (
        <Card className="quiz-result" aria-live="polite">
          <Badge tone="teal">
            {demo ? "SIMULATED PRACTICE RESULT" : "SERVER-GRADED RESULT"}
          </Badge>
          <strong>{result.score}%</strong>
          <h2>Evidence added to your passport.</h2>
          <p className="muted" style={{ fontSize: 12, marginTop: 10 }}>
            Review explanations below. Competency estimates reflect coverage and
            confidence.
          </p>
          <RouteLink href={href("/competencies")}>
            View updated evidence
          </RouteLink>
        </Card>
      )}
      <div className="quiz-controls">
        <Badge>
          {id === "baseline" ? "BASELINE" : "POST-TRAINING"} · VERSION 1
        </Badge>
        <span className="muted" style={{ fontSize: 12 }}>
          {Object.values(responses).filter((r) => r.length).length} /{" "}
          {questions.length} answered
        </span>
      </div>
      <Progress
        value={
          questions.length
            ? (Object.values(responses).filter((r) => r.length).length /
                questions.length) *
              100
            : 0
        }
        label="Questions answered"
      />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        style={{ marginTop: 20 }}
      >
        {questions.map((q, i) => (
          <Card className="question-card" key={q.id}>
            <div className="question-meta">
              <Badge>QUESTION {i + 1}</Badge>
              <Badge>
                {q.type === "multiple" ? "Select all that apply" : "One answer"}
              </Badge>
              <Badge>Level {q.difficulty}</Badge>
            </div>
            <fieldset disabled={!!result}>
              <legend>{q.stem}</legend>
              {q.options.map((o, j) => (
                <label className="answer-option" key={j}>
                  <input
                    type={q.type === "multiple" ? "checkbox" : "radio"}
                    name={q.id}
                    checked={(responses[q.id] ?? []).includes(j)}
                    onChange={(e) => answer(q, j, e.target.checked)}
                  />
                  <span>{o}</span>
                </label>
              ))}
            </fieldset>
            {result && (
              <div className="feedback">
                <strong>
                  {result.results.find((r) => r.questionId === q.id)?.correct
                    ? "Correct"
                    : "Review this answer"}
                </strong>
                <p>
                  {
                    result.results.find((r) => r.questionId === q.id)
                      ?.explanation
                  }
                </p>
                <p>Source: {q.source}</p>
              </div>
            )}
          </Card>
        ))}
        {!result ? (
          <div className="quiz-controls">
            <Button
              type="button"
              variant="outline"
              onClick={save}
              disabled={busy}
            >
              Save and resume later
            </Button>
            <Button disabled={busy || !questions.length}>
              {busy ? "Evaluating…" : "Submit for evaluation"}
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setResult(null);
              setResponses({});
              setStarted(false);
            }}
          >
            <RotateCcw size={16} />
            Start a new attempt
          </Button>
        )}
      </form>
    </div>
  );
}
