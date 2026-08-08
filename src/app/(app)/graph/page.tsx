"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui";
import { formatDate } from "@/lib/utils";

type Node = {
  id: string;
  label: string;
  status: string;
  category: string;
  validFrom: string;
  validTo: string | null;
  active: boolean;
};

type Edge = {
  from: string;
  to: string;
  relation: string;
};

export default function GraphPage() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [activeCount, setActiveCount] = useState(0);
  const [supersededCount, setSupersededCount] = useState(0);

  useEffect(() => {
    fetch("/api/graph")
      .then((r) => r.json())
      .then((d) => {
        setNodes(d.nodes || []);
        setEdges(d.edges || []);
        setActiveCount(d.activeCount || 0);
        setSupersededCount(d.supersededCount || 0);
      })
      .catch(() => undefined);
  }, []);

  return (
    <div>
      <div>
        <p className="text-xs uppercase tracking-wide text-[var(--ink-muted)]">
          Memory infrastructure
        </p>
        <h1 className="font-display text-3xl tracking-tight">
          Bi-Temporal Knowledge Graph
        </h1>
        <p className="mt-1 text-sm text-[var(--ink-muted)] max-w-2xl">
          Every skill carries <code>valid_from</code> / <code>valid_to</code>.
          When a new policy is approved, conflicting nodes are auto-invalidated
          instead of hallucinating parallel truths.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Badge tone="ok">{activeCount} active</Badge>
        <Badge tone="warn">{supersededCount} superseded / closed</Badge>
        <Badge tone="accent">hybrid: vector · BM25 · graph</Badge>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {nodes.map((n) => (
          <Link
            key={n.id}
            href={`/skills/${n.id}`}
            className={`rounded-md border p-5 transition hover:border-[var(--accent)] ${
              n.active
                ? "border-[var(--accent)]/40 bg-[var(--accent-soft)]/30"
                : "border-[var(--line)] bg-white opacity-80"
            }`}
          >
            <div className="flex flex-wrap gap-2">
              <Badge tone={n.active ? "ok" : "neutral"}>{n.status}</Badge>
              <Badge>{n.category}</Badge>
            </div>
            <h2 className="mt-2 font-display text-xl">{n.label}</h2>
            <p className="mt-2 text-xs text-[var(--ink-muted)]">
              Valid {formatDate(n.validFrom)}
              {n.validTo ? ` → ${formatDate(n.validTo)}` : " → present"}
            </p>
            {edges
              .filter((e) => e.to === n.id || e.from === n.id)
              .slice(0, 3)
              .map((e, i) => (
                <p key={i} className="mt-1 text-[10px] text-[var(--ink-muted)]">
                  {e.relation}: {e.from.slice(0, 12)}… → {e.to.slice(0, 12)}…
                </p>
              ))}
          </Link>
        ))}
      </div>

      {!nodes.length && (
        <p className="mt-8 text-sm text-[var(--ink-muted)]">
          No graph nodes yet. Extract and approve skills to populate temporal
          memory.
        </p>
      )}
    </div>
  );
}
