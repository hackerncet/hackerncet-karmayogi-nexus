"use client";
import { useState } from "react";
import { Send, Trash2, Bot, Info } from "lucide-react";
import { useWorkspace } from "./workspace-context";
import { Card, Modal, Badge } from "./ui/primitives";
import { Button } from "./ui/button";
export function TutorScreen() {
  const { state, act, demo, notify } = useWorkspace();
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [liveMessages, setLiveMessages] = useState(state.messages);
  const messages = demo ? state.messages : liveMessages;
  async function ask(question: string) {
    if (!question.trim() || busy) return;
    setBusy(true);
    setInput("");
    try {
      if (demo) {
        const answer = /weight/i.test(question)
          ? "A survey weight is the inverse inclusion probability: w = 1/π. If π = 0.2, w = 5. A weighted mean is Σ(wy) / Σw. [Sampling essentials.md · section 2–3]"
          : /missing|quality/i.test(question)
            ? "Investigate and document missing values. A duplicate identifier needs review, and replacing a missing value with zero changes its meaning. [Sampling essentials.md · section 4–5]"
            : /sampling|strati/i.test(question)
              ? "Stratified sampling divides the population into mutually exclusive groups and samples independently within each group. [Sampling essentials.md · section 1]"
              : "This prewritten demonstration can explain stratified sampling, survey weights and missing-value handling from Sampling essentials.md. A real source-grounded tutor requires an approved AI provider and authorized documents. No official policy advice is provided.";
        await act("chat", {}, (s) => ({
          ...s,
          messages: [
            ...s.messages,
            { role: "user", content: question },
            {
              role: "assistant",
              content: `DEMO · prewritten example, not AI generation\n\n${answer}`,
            },
          ],
        }));
      } else {
        const res = await fetch("/api/tutor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: question }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setLiveMessages([
          ...messages,
          { role: "user", content: question },
          { role: "assistant", content: data.content },
        ]);
      }
    } catch (e) {
      notify(e instanceof Error ? e.message : "Tutor unavailable");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="notice">
        <Info size={18} />
        <p>
          {demo
            ? "This is a prewritten demonstration assistant. It does not call an AI model."
            : "The tutor uses authorized learning documents and cites its sources. If no AI provider is configured, it returns an explicit unavailable status."}{" "}
          Responses are learning support, not MoSPI policy.
        </p>
      </div>
      <div className="suggestions">
        {[
          "Explain stratified sampling.",
          "What is a weighted estimate?",
          "How should I handle missing values?",
        ].map((q) => (
          <Button
            variant="outline"
            size="sm"
            key={q}
            onClick={() => ask(q)}
            disabled={busy}
          >
            {q}
          </Button>
        ))}
      </div>
      <Card className="chat-panel">
        <div className="card-head">
          <h2 style={{ display: "flex", gap: 9, alignItems: "center" }}>
            <Bot size={20} />
            Learning assistant
          </h2>
          <Modal
            trigger={
              <Button variant="ghost" size="sm">
                <Trash2 size={15} />
                Clear chat
              </Button>
            }
            title="Clear this conversation?"
            description="Remove messages from your current learning conversation."
          >
            <Button
              variant="danger"
              onClick={async () => {
                const ok = await act("clear-chat", {}, (s) => ({
                  ...s,
                  messages: [],
                }));
                if (ok) setLiveMessages([]);
              }}
            >
              Clear conversation
            </Button>
          </Modal>
        </div>
        <div
          className="chat-messages"
          aria-live="polite"
          aria-relevant="additions"
        >
          {!messages.length && (
            <div className="empty">
              <Bot size={32} />
              <h2>Start with a question.</h2>
              <p>
                Explore sampling, weights and data quality with source
                references.
              </p>
              <Badge tone="teal">
                {demo ? "PREWRITTEN DEMO" : "DOCUMENT-GROUNDED"}
              </Badge>
            </div>
          )}
          {messages.map((m, i) => (
            <div className={`chat-message ${m.role}`} key={i}>
              <strong>
                {m.role === "user"
                  ? "YOU"
                  : demo
                    ? "DEMO ASSISTANT"
                    : "LEARNING ASSISTANT"}
              </strong>
              {m.content}
            </div>
          ))}
          {busy && <p role="status">Looking for source-grounded context…</p>}
        </div>
        <form
          className="chat-form"
          onSubmit={(e) => {
            e.preventDefault();
            ask(input);
          }}
        >
          <label className="sr-only" htmlFor="tutor-message">
            Your learning question
          </label>
          <input
            id="tutor-message"
            placeholder="Ask about a statistical concept…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={1500}
            required
          />
          <Button
            disabled={busy || !input.trim()}
            aria-label="Send learning question"
          >
            <Send size={17} />
          </Button>
        </form>
      </Card>
    </>
  );
}
