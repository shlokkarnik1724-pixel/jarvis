"use client";

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
  };
  conversation: {
    rawText: string;
    sourceRef: string;
  } | null;
};

function highlightExcerpt(text: string, excerpt: string) {
  if (!excerpt) return [{ t: text, h: false }];
  const idx = text.toLowerCase().indexOf(excerpt.toLowerCase().slice(0, 40));
  if (idx < 0) {
    // try first meaningful line
    return [{ t: text, h: false }];
  }
  const end = Math.min(text.length, idx + Math.max(excerpt.length, 40));
  return [
    { t: text.slice(0, idx), h: false },
    { t: text.slice(idx, end), h: true },
    { t: text.slice(end), h: false },
  ];
}

export default function SkillReviewPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<Payload | null>(null);
  const [draft, setDraft] = useState<SkillSchema | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/skills/${params.id}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setDraft(d.skill?.jsonSchema || null);
      })
      .catch(() => setError("Failed to load skill"));
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
    } else {
      router.push("/simulator");
    }
    router.refresh();
  }

  if (!data || !draft) {
    return (
      <div className="text-sm text-[var(--ink-muted)]">Loading skill…</div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-[var(--ink-muted)]">
            Skill review
          </p>
          <h1 className="font-display text-3xl tracking-tight mt-1">
            {draft.title}
          </h1>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge
              tone={
                data.skill.status === "approved"
                  ? "ok"
                  : data.skill.status === "rejected"
                    ? "danger"
                    : "warn"
              }
            >
              {data.skill.status}
            </Badge>
            <Badge tone="accent">
              Confidence {Math.round(draft.confidence * 100)}%
            </Badge>
            <Badge>{data.conversation?.sourceRef}</Badge>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-md border border-[var(--line)] bg-white p-5">
          <h2 className="font-display text-lg">Source conversation</h2>
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
          <h2 className="font-display text-lg">Structured skill</h2>
          <div>
            <Label>Title</Label>
            <Input
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
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
              onChange={(e) => setDraft({ ...draft, action: e.target.value })}
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
        </div>
      </div>
    </div>
  );
}
