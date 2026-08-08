"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Badge, Button, Input, Label, Select, Textarea } from "@/components/ui";
import type { SkillSchema } from "@/lib/types";

type Payload = {
  skill: {
    id: string;
    title: string;
    status: string;
    confidence: number;
    jsonSchema: SkillSchema;
    validFrom?: string;
    validTo?: string | null;
    supersededBy?: string | null;
  };
  conversation: {
    rawText: string;
    sourceRef: string;
  } | null;
  active?: boolean;
  sopMarkdown?: string;
  exports?: {
    json: SkillSchema;
    yaml: string;
    systemPrompt: string;
    sop?: string;
    langchain?: string;
    crewai?: string;
    autogen?: string;
    webhook?: string;
  };
  conflicts?: {
    id: string;
    title: string;
    action: string;
    status?: string;
  }[];
};

function highlightExcerpt(text: string, excerpt: string) {
  if (!excerpt || !text) return [{ t: text, h: false }];
  const needle = excerpt.slice(0, Math.min(60, excerpt.length));
  const idx = text.toLowerCase().indexOf(needle.toLowerCase());
  if (idx < 0) return [{ t: text, h: false }];
  const end = Math.min(
    text.length,
    idx + Math.max(excerpt.length, needle.length)
  );
  return [
    { t: text.slice(0, idx), h: false },
    { t: text.slice(idx, end), h: true },
    { t: text.slice(end), h: false },
  ];
}

function download(filename: string, content: string, type = "application/json") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function SkillReviewPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<Payload | null>(null);
  const [draft, setDraft] = useState<SkillSchema | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"skill" | "sop">("skill");
  const [copied, setCopied] = useState("");

  async function load() {
    const res = await fetch(`/api/skills/${params.id}/export`);
    const d = await res.json();
    if (!res.ok) {
      setError(d.error || "Failed to load skill");
      return;
    }
    setData(d);
    setDraft(d.skill?.jsonSchema || null);
  }

  useEffect(() => {
    load().catch(() => setError("Failed to load skill"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const parts = useMemo(() => {
    if (!data?.conversation || !draft) return [];
    return highlightExcerpt(
      data.conversation.rawText,
      draft.source_excerpt || ""
    );
  }, [data, draft]);

  async function review(action: "approve" | "reject" | "edit_approve") {
    if (!draft) return;
    setSaving(true);
    setError("");
    const res = await fetch(`/api/skills/${params.id}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        skill: action === "edit_approve" ? draft : undefined,
      }),
    });
    const json = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(json.error || "Action failed");
      return;
    }
    if (action === "reject") {
      router.push("/skills");
      router.refresh();
      return;
    }
    await load();
    router.refresh();
  }

  if (!data || !draft) {
    return (
      <div className="text-sm text-[var(--ink-muted)]">
        {error || "Loading skill…"}
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-[var(--ink-muted)]">
            Bi-directional verification · human-in-the-loop
          </p>
          <h1 className="font-display text-3xl tracking-tight mt-1">
            {draft.title}
          </h1>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge
              tone={
                data.skill.status === "approved"
                  ? "ok"
                  : data.skill.status === "rejected" ||
                      data.skill.status === "superseded"
                    ? "danger"
                    : "warn"
              }
            >
              {data.skill.status}
            </Badge>
            {data.active && <Badge tone="accent">graph-active</Badge>}
            <Badge tone="accent">
              Confidence {Math.round(draft.confidence * 100)}%
            </Badge>
            <Badge>{data.conversation?.sourceRef}</Badge>
          </div>
          <p className="mt-2 text-xs text-[var(--ink-muted)]">
            Bi-temporal: valid from {data.skill.validFrom || "—"}
            {data.skill.validTo ? ` → ${data.skill.validTo}` : " → present"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/simulator?skill=${data.skill.id}`}>
            <Button variant="secondary">Run sandbox</Button>
          </Link>
          <Link href="/graph">
            <Button variant="outline">View in graph</Button>
          </Link>
        </div>
      </div>

      {!!data.conflicts?.length && (
        <div className="mt-6 rounded-md border border-[var(--warn)]/40 bg-[var(--warn-soft)] px-4 py-3 text-sm text-[var(--warn)]">
          <p className="font-medium">
            Conflict / supersession candidates in the temporal graph
          </p>
          {data.conflicts.map((c) => (
            <p key={c.id} className="mt-1">
              <Link href={`/skills/${c.id}`} className="underline">
                {c.title}
              </Link>{" "}
              ({c.status || "approved"}): “{c.action}”
            </p>
          ))}
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-md border border-[var(--line)] bg-white p-5">
          <h2 className="font-display text-lg">Source conversation</h2>
          <p className="mt-1 text-xs text-[var(--ink-muted)]">
            Audit generated rules against the original excerpt before approval.
          </p>
          <pre className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-[var(--ink)]">
            {parts.length
              ? parts.map((p, i) =>
                  p.h ? (
                    <mark
                      key={i}
                      className="bg-[var(--accent-soft)] text-[var(--ink)] rounded px-0.5"
                    >
                      {p.t}
                    </mark>
                  ) : (
                    <span key={i}>{p.t}</span>
                  )
                )
              : data.conversation?.rawText}
          </pre>
        </div>

        <div className="rounded-md border border-[var(--line)] bg-white p-5 space-y-4">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={tab === "skill" ? "primary" : "outline"}
              onClick={() => setTab("skill")}
            >
              Agent JSON skill
            </Button>
            <Button
              size="sm"
              variant={tab === "sop" ? "primary" : "outline"}
              onClick={() => setTab("sop")}
            >
              Human SOP
            </Button>
          </div>

          {tab === "skill" ? (
            <>
              <div>
                <Label>Title</Label>
                <Input
                  value={draft.title}
                  onChange={(e) =>
                    setDraft({ ...draft, title: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Condition (IF)</Label>
                <Textarea
                  className="min-h-20"
                  value={draft.condition}
                  onChange={(e) =>
                    setDraft({ ...draft, condition: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Action (THEN)</Label>
                <Textarea
                  className="min-h-20"
                  value={draft.action}
                  onChange={(e) =>
                    setDraft({ ...draft, action: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select
                  value={draft.category}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      category: e.target.value as SkillSchema["category"],
                    })
                  }
                >
                  <option>Refunds</option>
                  <option>Escalation</option>
                  <option>Discounting</option>
                  <option>Incident Response</option>
                  <option>Other</option>
                </Select>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              {(draft.sop_steps || []).map((s) => (
                <div
                  key={s.step}
                  className="border-l-2 border-[var(--accent)] pl-3"
                >
                  <p className="text-sm font-medium">
                    {s.step}. {s.title}
                  </p>
                  <p className="text-xs text-[var(--ink-muted)] mt-1">
                    {s.detail}
                  </p>
                  {s.owner && (
                    <p className="text-[10px] text-[var(--accent-deep)] mt-1">
                      Owner: {s.owner}
                    </p>
                  )}
                </div>
              ))}
              {!draft.sop_steps?.length && (
                <p className="text-sm text-[var(--ink-muted)]">
                  SOP steps generate on extract/approve.
                </p>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  download(
                    `${data.skill.id}.sop.md`,
                    data.exports?.sop || data.sopMarkdown || "",
                    "text/markdown"
                  )
                }
              >
                Download SOP markdown
              </Button>
            </div>
          )}

          {draft.flagged_fields?.length > 0 && (
            <div className="rounded-md bg-[var(--warn-soft)] px-3 py-3 text-sm text-[var(--warn)] space-y-1">
              {draft.flagged_fields.map((f) => (
                <p key={f}>⚠️ Missing / confirm: {f}</p>
              ))}
            </div>
          )}

          {error && <p className="text-sm text-[var(--danger)]">{error}</p>}

          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              onClick={() => review("approve")}
              disabled={saving || data.skill.status === "approved"}
            >
              Approve
            </Button>
            <Button
              variant="secondary"
              onClick={() => review("edit_approve")}
              disabled={saving}
            >
              Edit & Approve
            </Button>
            <Button
              variant="danger"
              onClick={() => review("reject")}
              disabled={saving}
            >
              Reject
            </Button>
          </div>

          <div className="border-t border-[var(--line)] pt-4">
            <p className="text-xs uppercase tracking-wide text-[var(--ink-muted)] mb-2">
              Execution exports
            </p>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["JSON", data.exports?.json && JSON.stringify(data.exports.json, null, 2), "json"],
                  ["YAML", data.exports?.yaml, "yaml"],
                  ["SOP", data.exports?.sop, "md"],
                  ["LangChain", data.exports?.langchain, "langchain.json"],
                  ["CrewAI", data.exports?.crewai, "crewai.json"],
                  ["AutoGen", data.exports?.autogen, "autogen.json"],
                  ["Webhook", data.exports?.webhook, "webhook.json"],
                ] as const
              ).map(([label, content, ext]) =>
                content ? (
                  <Button
                    key={label}
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      download(
                        `${data.skill.id}.${ext}`,
                        typeof content === "string"
                          ? content
                          : JSON.stringify(content, null, 2),
                        ext.includes("yaml")
                          ? "text/yaml"
                          : ext.includes("md")
                            ? "text/markdown"
                            : "application/json"
                      )
                    }
                  >
                    {label}
                  </Button>
                ) : null
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={async () => {
                  await navigator.clipboard.writeText(
                    data.exports?.systemPrompt || ""
                  );
                  setCopied("prompt");
                  setTimeout(() => setCopied(""), 1200);
                }}
              >
                {copied === "prompt" ? "Copied" : "Copy prompt"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
