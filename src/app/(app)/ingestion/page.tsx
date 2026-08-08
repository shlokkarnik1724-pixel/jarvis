"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge, Button } from "@/components/ui";
import { formatRelativeTime } from "@/lib/utils";

type Event = {
  id: string;
  source: string;
  channel: string;
  summary: string;
  rawSnippet: string;
  decisionDetected: boolean;
  skillId?: string | null;
  createdAt: string;
};

export default function IngestionPage() {
  const [listeners, setListeners] = useState<
    { source: string; status: string }[]
  >([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [busy, setBusy] = useState(false);
  const [desc, setDesc] = useState("");

  async function load() {
    const res = await fetch("/api/ingestion");
    const data = await res.json();
    setListeners(data.listeners || []);
    setEvents(data.events || []);
    setDesc(data.description || "");
  }

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  async function tick() {
    setBusy(true);
    await fetch("/api/ingestion", { method: "POST" });
    await load();
    setBusy(false);
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-[var(--ink-muted)]">
            Ingestion layer
          </p>
          <h1 className="font-display text-3xl tracking-tight">
            Zero-Touch Passive Mining
          </h1>
          <p className="mt-1 text-sm text-[var(--ink-muted)] max-w-2xl">
            {desc ||
              "Background listeners monitor Slack, Email, Zendesk, and Gong — extracting raw decisions without manual documentation."}
          </p>
        </div>
        <Button onClick={tick} disabled={busy}>
          {busy ? "Listening…" : "Simulate passive tick"}
        </Button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {listeners.map((l) => (
          <div
            key={l.source}
            className="rounded-md border border-[var(--line)] bg-white px-4 py-4"
          >
            <p className="font-medium capitalize">{l.source.replace("_", " ")}</p>
            <Badge tone="ok" className="mt-2">
              {l.status}
            </Badge>
          </div>
        ))}
      </div>

      <h2 className="mt-10 font-display text-xl">Ingestion stream</h2>
      <div className="mt-4 space-y-3">
        {events.map((e) => (
          <div
            key={e.id}
            className="rounded-md border border-[var(--line)] bg-white p-4"
          >
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="accent">{e.source}</Badge>
              <Badge>{e.channel}</Badge>
              <Badge tone={e.decisionDetected ? "ok" : "neutral"}>
                {e.decisionDetected ? "decision detected" : "noise filtered"}
              </Badge>
              <span className="text-xs text-[var(--ink-muted)] ml-auto">
                {formatRelativeTime(e.createdAt)}
              </span>
            </div>
            <p className="mt-2 text-sm font-medium">{e.summary}</p>
            <pre className="mt-2 text-xs text-[var(--ink-muted)] whitespace-pre-wrap">
              {e.rawSnippet}
            </pre>
            {e.skillId && (
              <Link
                href={`/skills/${e.skillId}`}
                className="mt-2 inline-block text-xs text-[var(--accent)]"
              >
                Open linked skill →
              </Link>
            )}
          </div>
        ))}
        {!events.length && (
          <p className="text-sm text-[var(--ink-muted)]">
            No events yet — launch the demo workspace or simulate a passive tick.
          </p>
        )}
      </div>
    </div>
  );
}
