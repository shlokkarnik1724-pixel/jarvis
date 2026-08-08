"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge, Button } from "@/components/ui";
import { formatRelativeTime } from "@/lib/utils";

type Connector = {
  id: string;
  provider: string;
  name: string;
  status: string;
  lastSyncedAt?: string | null;
  meta?: { blurb?: string; category?: string };
};

export default function ConnectorsPage() {
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState("");

  async function load() {
    const res = await fetch("/api/connectors");
    const data = await res.json();
    setConnectors(data.connectors || []);
  }

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  async function act(
    connectorId: string,
    action: "connect" | "disconnect" | "sync"
  ) {
    setBusy(connectorId);
    setNote("");
    const res = await fetch("/api/connectors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ connectorId, action }),
    });
    const data = await res.json();
    setBusy(null);
    if (!res.ok) {
      setNote(data.error || "Action failed");
      return;
    }
    if (action === "connect") {
      setNote(
        "Connected for MVP demo. Production OAuth (Slack/Teams/Zoom/Google/Zoho) plugs into this same connector model."
      );
    }
    await load();
  }

  const groups = useMemo(() => {
    const map = new Map<string, Connector[]>();
    for (const c of connectors) {
      const cat = c.meta?.category || "Other";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(c);
    }
    return [...map.entries()];
  }, [connectors]);

  const connected = connectors.filter((c) => c.status === "connected").length;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl tracking-tight">Connectors</h1>
          <p className="mt-1 text-sm text-[var(--ink-muted)] max-w-2xl">
            The company brain listens across Slack, Microsoft Teams, Google,
            Zoho, Sheets, Zoom, and more — then turns that into skills, answers,
            and routing.
          </p>
        </div>
        <Badge tone="accent">{connected} connected</Badge>
      </div>

      {note && (
        <p className="mt-4 text-sm rounded-md bg-[var(--accent-soft)] px-3 py-2 text-[var(--accent-deep)]">
          {note}
        </p>
      )}

      <div className="mt-6 rounded-md border border-[var(--line)] bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl">Universal ingest</h2>
            <p className="text-sm text-[var(--ink-muted)]">
              Works today without waiting on OAuth approvals — paste any thread
              or transcript.
            </p>
          </div>
          <Link href="/extract">
            <Button>Paste / upload conversation</Button>
          </Link>
        </div>
      </div>

      <div className="mt-10 space-y-10">
        {groups.map(([category, items]) => (
          <section key={category}>
            <h2 className="font-display text-xl">{category}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((c) => (
                <div
                  key={c.id}
                  className="rounded-md border border-[var(--line)] bg-white p-5 flex flex-col"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{c.name}</p>
                      <p className="mt-1 text-xs text-[var(--ink-muted)]">
                        {c.meta?.blurb}
                      </p>
                    </div>
                    <Badge
                      tone={
                        c.status === "connected"
                          ? "ok"
                          : c.status === "syncing"
                            ? "accent"
                            : "neutral"
                      }
                    >
                      {c.status.replace("_", " ")}
                    </Badge>
                  </div>
                  {c.lastSyncedAt && (
                    <p className="mt-3 text-[10px] text-[var(--ink-muted)]">
                      Synced {formatRelativeTime(c.lastSyncedAt)}
                    </p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-2 mt-auto pt-2">
                    {c.status === "connected" ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busy === c.id}
                          onClick={() => act(c.id, "sync")}
                        >
                          Sync now
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={busy === c.id || c.provider === "manual"}
                          onClick={() => act(c.id, "disconnect")}
                        >
                          Disconnect
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        disabled={busy === c.id}
                        onClick={() => act(c.id, "connect")}
                      >
                        Connect
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
