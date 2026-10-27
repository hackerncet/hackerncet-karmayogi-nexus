"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  FileText,
  Sparkles,
  Check,
  Trash2,
  Download,
  Info,
  Eye,
  Pencil,
  ClipboardCheck,
} from "lucide-react";
import { useWorkspace } from "./workspace-context";
import { Card, Badge, Field, Modal, Empty, RouteLink } from "./ui/primitives";
import { Button } from "./ui/button";
import { diagnosticQuestions, competencies } from "@/lib/fixtures";
import { downloadText } from "./competency-screens";
import type { Question } from "@/lib/types";
export function TrainerScreen({
  section = "materials",
  materialId,
}: {
  section?: string;
  materialId?: string;
}) {
  const { state, demo, act, href, notify } = useWorkspace();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [material, setMaterial] = useState(
    materialId ?? state.materials[0]?.id ?? "",
  );
  const [count, setCount] = useState(3);
  const [difficulty, setDifficulty] = useState(2);
  const [type, setType] = useState("single");
  const [language, setLanguage] = useState("English");
  const [competency, setCompetency] = useState("sampling");
  const [objective, setObjective] = useState(
    "Apply sampling concepts to a household survey.",
  );
  const [title, setTitle] = useState("Statistical capacity practice quiz");
  async function upload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const form = new FormData(e.currentTarget);
    const file = form.get("file");
    try {
      if (!(file instanceof File) || !file.size)
        throw new Error("Select a file.");
      if (demo) {
        if (!/\.(txt|md)$/i.test(file.name) || file.size > 100000)
          throw new Error(
            "The browser demo accepts TXT/Markdown up to 100 KB. Live uploads support additional formats.",
          );
        const text = await file.text();
        if (!text.trim()) throw new Error("The file is empty.");
        const id = crypto.randomUUID();
        await act("upload", {}, (s) => ({
          ...s,
          materials: [
            ...s.materials,
            { id, name: file.name, text, status: "ready" },
          ],
        }));
        setMaterial(id);
      } else {
        const res = await fetch("/api/materials", {
          method: "POST",
          body: form,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        notify(
          `Private upload saved. Status: ${data.status}. Select Process to extract and index it.`,
        );
        router.refresh();
      }
    } catch (e) {
      notify(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }
  async function generate() {
    setBusy(true);
    try {
      if (demo) {
        if (material !== "sample")
          throw new Error(
            "Prewritten demo examples are grounded in the built-in Sampling essentials material only. Real generation from your upload requires an AI provider.",
          );
        const questions = diagnosticQuestions
          .slice(0, 3)
          .map((q) => ({ ...q, id: crypto.randomUUID() }));
        await act("generate", {}, (s) => ({
          ...s,
          questions,
          approvedQuestions: [],
          published: false,
        }));
        notify(
          "Loaded 3 prewritten demonstration questions. No AI was called.",
        );
      } else {
        const res = await fetch("/api/questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            materialId: material,
            count,
            difficulty,
            type,
            language,
            competencyId: competency,
            objective,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        notify(
          "AI draft questions generated. Review sources and answers before approval.",
        );
        router.refresh();
      }
    } catch (e) {
      notify(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setBusy(false);
    }
  }
  async function publish() {
    setBusy(true);
    try {
      if (
        !state.questions.length ||
        state.questions.some((q) => !state.approvedQuestions.includes(q.id))
      )
        throw new Error("Review and approve every question first.");
      const ok = await act(
        "publish",
        { title, ids: state.questions.map((q) => q.id) },
        (s) => ({ ...s, published: true }),
      );
      if (ok)
        notify(
          demo
            ? "Demonstration quiz published. Open Assessments to take it."
            : "Assessment published to your organization.",
        );
    } catch (e) {
      notify(e instanceof Error ? e.message : "Publication failed");
    } finally {
      setBusy(false);
    }
  }
  async function process(id: string) {
    setBusy(true);
    try {
      const res = await fetch("/api/materials/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      notify(`Processing complete: ${data.chunks ?? 0} chunks.`);
      router.refresh();
    } catch (e) {
      notify(e instanceof Error ? e.message : "Processing failed");
    } finally {
      setBusy(false);
    }
  }
  const nav = [
    ["materials", "Learning materials"],
    ["question-bank", "Question bank"],
    ["assessment-builder", "Assessment builder"],
    ["assessments", "Published assessments"],
    ["analytics", "Assessment quality"],
  ];
  return (
    <div className="section-stack">
      <div className="toolbar">
        {nav.map(([key, name]) => (
          <RouteLink key={key} href={href(`/trainer/${key}`)}>
            {name}
          </RouteLink>
        ))}
      </div>
      <div className="notice warning">
        <Info size={18} />
        <p>
          {demo
            ? "Trainer actions here are simulated. Question examples are prewritten and labeled; uploading text does not enable AI."
            : "Generated questions remain drafts until trainer review. Structure and citations are validated; factual correctness requires human review."}
        </p>
      </div>
      {section === "materials" && (
        <>
          <Card>
            <div className="card-head">
              <h2>Upload learning material</h2>
              <Badge tone="teal">
                {demo ? "BROWSER-ONLY DEMO" : "PRIVATE STORAGE"}
              </Badge>
            </div>
            <form className="card-body" onSubmit={upload}>
              <Field
                label={
                  demo
                    ? "TXT or Markdown · up to 100 KB"
                    : "PDF, DOCX, PPTX, TXT, Markdown or MP4 · up to 10 MiB"
                }
                hint="Video requires a transcript; no transcription provider is connected."
              >
                <input
                  name="file"
                  type="file"
                  accept={demo ? ".txt,.md" : ".pdf,.docx,.pptx,.txt,.md,.mp4"}
                  required
                />
              </Field>
              <div className="form-actions">
                <Button disabled={busy}>
                  <Upload size={16} />
                  {busy ? "Uploading…" : "Upload material"}
                </Button>
              </div>
            </form>
          </Card>
          {state.materials.map((m) => (
            <Card className="card-body" key={m.id}>
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <FileText size={20} />
                <h2>{m.name}</h2>
                <Badge>{m.status ?? "ready"}</Badge>
              </div>
              {m.text && <pre className="document-preview">{m.text}</pre>}
              {m.error && <p className="error-text">{m.error}</p>}
              {!demo &&
                ["queued", "failed", "processing"].includes(m.status ?? "") && (
                  <Button
                    variant="outline"
                    style={{ marginTop: 12 }}
                    disabled={busy}
                    onClick={() => process(m.id)}
                  >
                    Process / retry extraction
                  </Button>
                )}
            </Card>
          ))}
        </>
      )}
      {["question-bank", "assessment-builder"].includes(section) && (
        <>
          <Card>
            <div className="card-head">
              <h2>
                {demo
                  ? "Load demonstration question examples"
                  : "Generate source-grounded draft questions"}
              </h2>
              <Sparkles size={20} />
            </div>
            <div className="card-body">
              <div className="form-grid">
                <Field label="Learning material">
                  <select
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                  >
                    {state.materials.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Competency">
                  <select
                    value={competency}
                    onChange={(e) => setCompetency(e.target.value)}
                  >
                    {competencies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Question count">
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={count}
                    onChange={(e) => setCount(Number(e.target.value))}
                    disabled={demo}
                  />
                </Field>
                <Field label="Difficulty">
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(Number(e.target.value))}
                    disabled={demo}
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n}>{n}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Question format">
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    disabled={demo}
                  >
                    <option value="single">Single-answer MCQ</option>
                    <option value="multiple">Multiple-answer MCQ</option>
                    <option value="true-false">True / false</option>
                    <option value="scenario">
                      Scenario objective question
                    </option>
                  </select>
                </Field>
                <Field label="Question language">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    disabled={demo}
                  >
                    <option>English</option>
                    <option>Hindi</option>
                  </select>
                </Field>
                <Field label="Learning objective">
                  <input
                    value={objective}
                    maxLength={500}
                    onChange={(e) => setObjective(e.target.value)}
                    disabled={demo}
                  />
                </Field>
              </div>
              <div className="form-actions">
                <Button onClick={generate} disabled={busy || !material}>
                  <Sparkles size={16} />
                  {busy
                    ? "Working…"
                    : demo
                      ? "Load 3 prewritten examples"
                      : "Generate AI drafts"}
                </Button>
                {state.questions.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={() =>
                      downloadText(
                        "trainer-question-bank.json",
                        JSON.stringify(
                          { synthetic: demo, questions: state.questions },
                          null,
                          2,
                        ),
                        "application/json",
                      )
                    }
                  >
                    <Download size={16} />
                    Export bank
                  </Button>
                )}
              </div>
            </div>
          </Card>
          {state.questions.map((q) => (
            <QuestionEditor key={q.id} question={q} />
          ))}
          {!state.questions.length && (
            <Empty
              title="Your question bank is ready for its first draft"
              description="Choose a source and generate drafts. Review every answer and source before publishing."
            />
          )}
          {section === "assessment-builder" && (
            <Card className="card-body">
              <Field label="Assessment title">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={150}
                />
              </Field>
              <p className="token-hint">
                {state.approvedQuestions.length}/{state.questions.length}{" "}
                approved. Publication requires approval of all selected
                questions.
              </p>
              <div className="form-actions">
                <Button
                  disabled={busy || !state.questions.length}
                  onClick={publish}
                >
                  <ClipboardCheck size={16} />
                  Publish reviewed assessment
                </Button>
              </div>
            </Card>
          )}
        </>
      )}
      {section === "assessments" &&
        (state.published ? (
          <Card className="mission-strip">
            <ClipboardCheck />
            <div>
              <h2>Published statistical practice</h2>
              <p>
                {state.questions.length} questions · approved by simulated
                trainer
              </p>
            </div>
            <RouteLink href={href("/assessments/published")}>
              Open learner quiz
            </RouteLink>
          </Card>
        ) : state.liveAssessments?.length ? (
          <div className="section-stack">
            {state.liveAssessments.map((a) => (
              <Card className="mission-strip" key={a.id}>
                <h2>{a.title}</h2>
                <RouteLink href={href(`/assessments/${a.id}`)}>
                  Open assessment
                </RouteLink>
              </Card>
            ))}
          </div>
        ) : (
          <Empty
            title="No assessments published"
            description="Review the question bank, then publish an assessment."
            action={
              <RouteLink href={href("/trainer/assessment-builder")}>
                Build assessment
              </RouteLink>
            }
          />
        ))}
      {section === "analytics" && (
        <Card className="card-body">
          <h2>Question quality review</h2>
          <p className="muted" style={{ marginTop: 15 }}>
            Questions: {state.questions.length} · Approved:{" "}
            {state.approvedQuestions.length} · Drafts:{" "}
            {state.questions.length - state.approvedQuestions.length}
          </p>
          <p className="token-hint">
            Difficulty calibration, distractor analysis and cohort performance
            require adequate authorized response data. No reliability statistics
            are fabricated.
          </p>
        </Card>
      )}
    </div>
  );
}
function QuestionEditor({ question: q }: { question: Question }) {
  const { state, act, demo, notify } = useWorkspace();
  const [stem, setStem] = useState(q.stem);
  const [explanation, setExplanation] = useState(q.explanation);
  const [answers, setAnswers] = useState(q.answer);
  const approved = state.approvedQuestions.includes(q.id);
  async function save(approve: boolean) {
    const next = { ...q, stem, explanation, answer: answers };
    if (stem.length < 15 || explanation.length < 20 || !answers.length) {
      notify("Provide a meaningful stem, explanation and correct answer.");
      return;
    }
    await act(
      "question-update",
      { id: q.id, question: next, approve },
      (s) => ({
        ...s,
        questions: s.questions.map((x) =>
          x.id === q.id
            ? { ...next, version: String(Number(q.version) + 1) }
            : x,
        ),
        approvedQuestions: approve
          ? [...new Set([...s.approvedQuestions, q.id])]
          : s.approvedQuestions.filter((id) => id !== q.id),
        published: false,
      }),
    );
  }
  return (
    <Card className="card-body">
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <Badge tone={approved ? "teal" : "amber"}>
          {approved ? "APPROVED" : "DRAFT · REVIEW REQUIRED"}
        </Badge>
        <Badge>Version {q.version}</Badge>
        <Badge>{demo ? "PREWRITTEN DEMO" : "AI-GENERATED DRAFT"}</Badge>
      </div>
      <h2 style={{ fontSize: 17, marginBottom: 12 }}>{q.stem}</h2>
      <ol style={{ paddingLeft: 23, fontSize: 13 }}>
        {q.options.map((o, i) => (
          <li key={i}>
            {o} {q.answer.includes(i) ? <strong> · Correct</strong> : ""}
          </li>
        ))}
      </ol>
      <p className="token-hint">
        Source: {q.source}
        <br />
        Supporting excerpt: “{q.quote}”
      </p>
      <div className="form-actions">
        <Modal
          trigger={
            <Button variant="outline" size="sm">
              <Pencil size={14} />
              Edit & review
            </Button>
          }
          title="Review question and source"
          description="Check factual correctness, ambiguity, answer mapping and the exact supporting excerpt before approval."
        >
          <div className="section-stack">
            <Field label="Question stem">
              <textarea
                value={stem}
                onChange={(e) => setStem(e.target.value)}
                maxLength={1200}
              />
            </Field>
            <Field label="Explanation">
              <textarea
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                maxLength={1800}
              />
            </Field>
            <fieldset>
              <legend>Correct answer(s)</legend>
              {q.options.map((o, i) => (
                <label className="answer-option" key={i}>
                  <input
                    type={q.type === "multiple" ? "checkbox" : "radio"}
                    name={`answer-${q.id}`}
                    checked={answers.includes(i)}
                    onChange={(e) =>
                      setAnswers(
                        q.type === "multiple"
                          ? e.target.checked
                            ? [...answers, i]
                            : answers.filter((a) => a !== i)
                          : [i],
                      )
                    }
                  />
                  {o}
                </label>
              ))}
            </fieldset>
            <p className="document-preview">{q.quote}</p>
            <div className="form-actions">
              <Button variant="outline" onClick={() => save(false)}>
                Save draft
              </Button>
              <Button onClick={() => save(true)}>
                <Check size={15} />
                Approve reviewed question
              </Button>
            </div>
          </div>
        </Modal>
        <Modal
          trigger={
            <Button variant="ghost" size="sm">
              <Eye size={15} />
              Preview
            </Button>
          }
          title="Learner question preview"
          description="Correct-answer mappings are hidden in this preview."
        >
          <p>{q.stem}</p>
          {q.options.map((o) => (
            <p className="answer-option" key={o}>
              {o}
            </p>
          ))}
        </Modal>
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            act("question-delete", { id: q.id }, (s) => ({
              ...s,
              questions: s.questions.filter((x) => x.id !== q.id),
              approvedQuestions: s.approvedQuestions.filter(
                (id) => id !== q.id,
              ),
              published: false,
            }))
          }
        >
          <Trash2 size={14} />
          Delete
        </Button>
      </div>
      <p className="token-hint">
        {approved
          ? "Trainer approved; approval is not an official accreditation."
          : "Drafts cannot be published until reviewed and approved."}
      </p>
    </Card>
  );
}
