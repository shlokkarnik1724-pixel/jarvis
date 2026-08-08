"use client";

import { FormEvent, useEffect, useState } from "react";
import { Badge, Button, Select, Textarea } from "@/components/ui";

type SkillOption = {
  id: string;
  title: string;
  status: string;
};

type Message = {
  role: "user" | "assistant";
  content: string;
  meta?: string;
};

export default function SimulatorPage() {
  const [skills, setSkills] = useState<SkillOption[]>([]);
  const [skillId, setSkillId] = useState("all");
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/skills?status=approved")
      .then((r) => r.json())
      .then((d) => setSkills(d.skills || []))
      .catch(() => undefined);
  }, []);

  async function send(e?: FormEvent) {
    e?.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    const userMsg = query.trim();
    setMessages((m) => [...m, { role: "user", content: userMsg }]);
    setQuery("");

    const res = await fetch("/api/simulate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: userMsg, skillId }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Simulation failed");
      return;
    }

    setMessages((m) => [
      ...m,
      {
        role: "assistant",
        content: data.response,
        meta: data.skill
          ? `Skill: ${data.skill.title} · ${data.skill.sourceRef || "source"}`
          : undefined,
      },
    ]);
  }

  return (
    <div>
      <h1 className="font-display text-3xl tracking-tight">Agent Simulator</h1>
      <p className="mt-1 text-sm text-[var(--ink-muted)] max-w-2xl">
        Ask a question the way a customer or agent would. Responses cite the
        approved skill and its source conversation.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[240px_1fr]">
        <div className="rounded-md border border-[var(--line)] bg-white p-4 h-fit">
          <p className="text-xs uppercase tracking-wide text-[var(--ink-muted)]">
            Skill context
          </p>
          <Select
            className="mt-3"
            value={skillId}
            onChange={(e) => setSkillId(e.target.value)}
          >
            <option value="all">All approved skills</option>
            {skills.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </Select>
          {!skills.length && (
            <p className="mt-3 text-xs text-[var(--warn)]">
              Approve a skill first to unlock the playground.
            </p>
          )}
        </div>

        <div className="rounded-md border border-[var(--line)] bg-white flex flex-col min-h-[480px]">
          <div className="flex-1 space-y-4 p-5 overflow-y-auto">
            {!messages.length && (
              <div className="text-sm text-[var(--ink-muted)]">
                Try:{" "}
                <button
                  type="button"
                  className="text-[var(--accent)]"
                  onClick={() =>
                    setQuery(
                      "Can I offer this enterprise client a 15% discount without looping in my manager?"
                    )
                  }
                >
                  “Can I offer this enterprise client a discount?”
                </button>
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[90%] rounded-md px-4 py-3 text-sm whitespace-pre-wrap ${
                  m.role === "user"
                    ? "ml-auto bg-[var(--ink)] text-white"
                    : "bg-[var(--bg)] text-[var(--ink)]"
                }`}
              >
                {m.content}
                {m.meta && (
                  <p className="mt-3 pt-2 border-t border-[var(--line)] text-xs text-[var(--ink-muted)]">
                    {m.meta}
                  </p>
                )}
              </div>
            ))}
            {loading && (
              <div className="text-sm text-[var(--ink-muted)]">Thinking…</div>
            )}
          </div>

          <form
            onSubmit={send}
            className="border-t border-[var(--line)] p-4 space-y-3"
          >
            {error && (
              <p className="text-sm text-[var(--danger)]">{error}</p>
            )}
            <Textarea
              className="min-h-20"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask the agent…"
            />
            <div className="flex items-center justify-between gap-3">
              <Badge tone="neutral">Traceable · governed · cited</Badge>
              <Button type="submit" disabled={loading || !skills.length}>
                Send
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
