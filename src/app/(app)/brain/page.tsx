"use client";

import { FormEvent, useEffect, useState } from "react";
import { Badge, Button, Textarea } from "@/components/ui";

type Citation = { skillId?: string; title: string; sourceRef?: string };
type Msg = {
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
};

export default function BrainPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/brain/ask")
      .then((r) => r.json())
      .then((d) => {
        if (d.messages?.length) {
          setMessages(
            d.messages.map(
              (m: {
                role: "user" | "assistant";
                content: string;
                citations?: Citation[];
              }) => ({
                role: m.role,
                content: m.content,
                citations: m.citations,
              })
            )
          );
        }
      })
      .catch(() => undefined);
  }, []);

  async function ask(e?: FormEvent) {
    e?.preventDefault();
    if (!question.trim()) return;
    const q = question.trim();
    setQuestion("");
    setMessages((m) => [...m, { role: "user", content: q }]);
    setLoading(true);
    setError("");
    const res = await fetch("/api/brain/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: q }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Could not answer");
      return;
    }
    setMessages((m) => [
      ...m,
      {
        role: "assistant",
        content: data.answer,
        citations: data.citations,
      },
    ]);
  }

  const suggestions = [
    "What’s our Enterprise discount policy?",
    "Who should handle a VIP checkout outage?",
    "Can we refund an Enterprise customer after 45 days if there was a P1?",
    "Summarize what Zoom QBR said about our knowledge gaps",
  ];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-[var(--ink-muted)]">
            Company brain
          </p>
          <h1 className="font-display text-3xl tracking-tight">Ask Tactix</h1>
          <p className="mt-1 text-sm text-[var(--ink-muted)] max-w-2xl">
            One brain across Slack, Teams, Zoho, Sheets, Zoom, and more —
            answers with approved skills and routes work to the right person.
          </p>
        </div>
        <Badge tone="accent">Live knowledge</Badge>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_240px]">
        <div className="rounded-md border border-[var(--line)] bg-white flex flex-col min-h-[560px]">
          <div className="flex-1 space-y-4 p-5 overflow-y-auto">
            {!messages.length && (
              <div className="text-sm text-[var(--ink-muted)] space-y-2">
                <p>
                  Ask anything your company already decided in chat, tickets,
                  sheets, or meetings.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className="rounded-md border border-[var(--line)] px-3 py-1.5 text-xs text-left hover:border-[var(--accent)]"
                      onClick={() => setQuestion(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[92%] rounded-md px-4 py-3 text-sm whitespace-pre-wrap ${
                  m.role === "user"
                    ? "ml-auto bg-[var(--ink)] text-white"
                    : "bg-[var(--bg)]"
                }`}
              >
                {m.content}
                {!!m.citations?.length && (
                  <div className="mt-3 pt-2 border-t border-[var(--line)] space-y-1">
                    {m.citations.map((c, idx) => (
                      <p
                        key={idx}
                        className="text-xs text-[var(--ink-muted)]"
                      >
                        Cited: {c.title}
                        {c.sourceRef ? ` · ${c.sourceRef}` : ""}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <p className="text-sm text-[var(--ink-muted)]">
                Consulting connected systems…
              </p>
            )}
          </div>
          <form
            onSubmit={ask}
            className="border-t border-[var(--line)] p-4 space-y-3"
          >
            {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
            <Textarea
              className="min-h-20"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask the company brain…"
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                Ask
              </Button>
            </div>
          </form>
        </div>

        <aside className="space-y-4">
          <div className="rounded-md border border-[var(--line)] bg-white p-4 text-sm">
            <p className="font-medium">What the brain does</p>
            <ul className="mt-2 space-y-2 text-[var(--ink-muted)] text-xs leading-relaxed">
              <li>Arranges decisions from every connected tool</li>
              <li>Answers with approved, versioned skills</li>
              <li>Suggests who should act next (Inbox)</li>
              <li>Keeps a trace back to Slack / Teams / Zoom / Zoho</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
