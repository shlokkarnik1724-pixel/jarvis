"use client";

import { useEffect, useState } from "react";
import { Badge, Button } from "@/components/ui";
import { formatRelativeTime } from "@/lib/utils";

type Item = {
  id: string;
  title: string;
  summary: string;
  suggestedOwner: string;
  channel: string;
  priority: string;
  status: string;
  sourceRef: string;
  createdAt: string;
};

export default function InboxPage() {
  const [items, setItems] = useState<Item[]>([]);

  async function load() {
    const res = await fetch("/api/inbox");
    const data = await res.json();
    setItems(data.items || []);
  }

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  async function setStatus(id: string, status: "open" | "routed" | "done") {
    await fetch("/api/inbox", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    await load();
  }

  return (
    <div>
      <h1 className="font-display text-3xl tracking-tight">Routing Inbox</h1>
      <p className="mt-1 text-sm text-[var(--ink-muted)] max-w-2xl">
        The brain doesn’t just store knowledge — it delivers the right
        information to the right person across Slack, Teams, Zoho, and more.
      </p>

      <div className="mt-8 space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-md border border-[var(--line)] bg-white p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    tone={
                      item.priority === "urgent" || item.priority === "high"
                        ? "danger"
                        : "neutral"
                    }
                  >
                    {item.priority}
                  </Badge>
                  <Badge
                    tone={
                      item.status === "done"
                        ? "ok"
                        : item.status === "routed"
                          ? "accent"
                          : "warn"
                    }
                  >
                    {item.status}
                  </Badge>
                  <Badge>{item.channel}</Badge>
                </div>
                <h2 className="mt-2 font-display text-xl">{item.title}</h2>
                <p className="mt-2 text-sm text-[var(--ink-muted)] leading-relaxed">
                  {item.summary}
                </p>
                <p className="mt-3 text-sm">
                  <span className="text-[var(--ink-muted)]">Route to:</span>{" "}
                  <strong>{item.suggestedOwner}</strong>
                </p>
                <p className="mt-1 text-xs text-[var(--ink-muted)]">
                  {item.sourceRef} · {formatRelativeTime(item.createdAt)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() => setStatus(item.id, "routed")}
                  disabled={item.status === "routed"}
                >
                  Route
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setStatus(item.id, "done")}
                >
                  Mark done
                </Button>
              </div>
            </div>
          </div>
        ))}
        {!items.length && (
          <p className="text-sm text-[var(--ink-muted)]">
            No routing items yet. Connect sources or launch the demo workspace.
          </p>
        )}
      </div>
    </div>
  );
}
