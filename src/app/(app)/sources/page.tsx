"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge, Button, Textarea } from "@/components/ui";

type Source = {
  id: string;
  type: string;
  name: string;
  status: string;
};

const SAMPLE = `Priya (Support): Customer #4821 is asking for a full refund 45 days after purchase — our window is 30 days, but they're Enterprise and had a 2-day outage.
Marcus (CS Lead): For Enterprise accounts impacted by a P1 outage, we can approve a full refund even outside the 30-day window. Document it as an exception and CC finance.
Priya: Perfect — I'll process the refund and note the P1 exception.`;

export default function SourcesPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => setSources(d.dataSources || []))
      .catch(() => undefined);
  }, []);

  async function analyze() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/extract-skill", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        category: "Refunds",
        sourceRef: "Manual paste · Support thread",
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Analysis failed");
      return;
    }
    window.location.href = `/skills/${data.skillId}`;
  }

  return (
    <div>
      <h1 className="font-display text-3xl tracking-tight">
        Connect a data source
      </h1>
      <p className="mt-1 text-sm text-[var(--ink-muted)] max-w-2xl">
        Passive knowledge mining starts here. Live OAuth integrations ship in
        v1 — paste a real thread below to run the extraction engine end-to-end.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(sources.length
          ? sources.filter((s) => s.type !== "manual")
          : [
              { id: "1", type: "slack", name: "Slack", status: "coming_soon" },
              {
                id: "2",
                type: "zendesk",
                name: "Zendesk",
                status: "coming_soon",
              },
              {
                id: "3",
                type: "email",
                name: "Gmail / Outlook",
                status: "coming_soon",
              },
              {
                id: "4",
                type: "fireflies",
                name: "Fireflies / Gong",
                status: "coming_soon",
              },
            ]
        ).map((s) => (
          <div
            key={s.id}
            className="rounded-md border border-[var(--line)] bg-white p-5"
          >
            <div className="flex items-center justify-between">
              <p className="font-medium">{s.name}</p>
              <Badge tone={s.status === "connected" ? "ok" : "neutral"}>
                {s.status === "coming_soon" ? "Coming soon" : s.status}
              </Badge>
            </div>
            <Button
              className="mt-4"
              variant="outline"
              disabled={s.status !== "connected"}
              title="Live integrations coming in v1"
            >
              Connect
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-md border border-[var(--accent)]/30 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl">Paste a Conversation</h2>
            <p className="text-sm text-[var(--ink-muted)]">
              The working MVP path — same pipeline every integration will use.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setText(SAMPLE)}
            type="button"
          >
            Load sample thread
          </Button>
        </div>
        <Textarea
          className="mt-4 min-h-48 font-mono text-xs"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste a Slack/email thread containing a decision…"
        />
        {error && (
          <p className="mt-2 text-sm text-[var(--danger)]">{error}</p>
        )}
        <div className="mt-4 flex flex-wrap gap-3">
          <Button onClick={analyze} disabled={loading || text.length < 20}>
            {loading ? "Analyzing…" : "Analyze"}
          </Button>
          <Link href="/extract">
            <Button variant="ghost">Open full extract screen</Button>
          </Link>
        </div>
        <p className="mt-4 text-xs text-[var(--ink-muted)]">
          MVP note: live integrations coming in v1 — paste a real Slack/email
          thread above to see the extraction engine work end-to-end.
        </p>
      </div>
    </div>
  );
}
