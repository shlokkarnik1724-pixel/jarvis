"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
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

export default function SimulatorClient() {
  const search = useSearchParams();
  const presetSkill = search.get("skill");
  const [skills, setSkills] = useState<SkillOption[]>([]);
  const [skillId, setSkillId] = useState(presetSkill || "all");
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/skills?status=approved")
      .then((r) => r.json())
      .then((d) => {
        setSkills(d.skills || []);
        if (presetSkill) setSkillId(presetSkill);
      })
      .catch(() => undefined);
  }, [presetSkill]);

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
          ? `Cited skill: ${data.skill.title} · ${data.skill.sourceRef || "source"}`
          : undefined,
      },
    ]);
  }

  const prompts = [
    "Can I offer this enterprise client a 15% discount without looping in my manager?",
    "A VIP customer says checkout is broken — should I escalate now?",
    "Enterprise customer wants a refund 45 days later after a P1 outage. Allowed?",
  ];

  return (
    <div>
      <h1 className="font-display text-3xl tracking-tight">Agent Simulator</h1>
      <p className="mt-1 text-sm text-[var(--ink-muted)] max-w-2xl">
        This is the investor “aha”: the agent answers using only approved skills
        and cites the source conversation.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[260px_1fr]">
        <div className="space-y-4">
          <div className="rounded-md border border-[var(--line)] bg-white p-4">
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
                Approve at least one skill in the library to unlock the
                playground.
              </p>
            )}
            <p className="mt-3 text-xs text-[var(--ink-muted)]">
              {skills.length} approved skill{skills.length === 1 ? "" : "s"}{" "}
              available
            </p>
          </div>
          <div className="rounded-md border border-[var(--line)] bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-[var(--ink-muted)] mb-2">
              Try these
            </p>
            <div className="space-y-2">
              {prompts.map((p) => (
                <button
                  key={p}
                  type="button"
                  className="block w-full text-left text-xs leading-relaxed text-[var(--accent-deep)] hover:underline"
                  onClick={() => setQuery(p)}
                >
                  “{p}”
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-md border border-[var(--line)] bg-white flex flex-col min-h-[520px]">
          <div className="flex-1 space-y-4 p-5 overflow-y-auto">
            {!messages.length && (
              <div className="text-sm text-[var(--ink-muted)]">
                Ask a question the way a support or sales agent would. Responses
                cite the approved skill ID, approval date, and source thread.
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[92%] rounded-md px-4 py-3 text-sm whitespace-pre-wrap ${
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
            {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
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
