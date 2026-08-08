"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge, Button } from "@/components/ui";
import { formatRelativeTime } from "@/lib/utils";

type DashboardData = {
  stats: {
    extracted: number;
    pending: number;
    approved: number;
    rejected: number;
    dataSources: number;
  };
  activities: { id: string; message: string; createdAt: string }[];
  organization?: { name: string; inviteCode: string };
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData)
      .catch(() => undefined);
  }, []);

  const stats = [
    { label: "Skills extracted", value: data?.stats.extracted ?? "—", href: "/skills" },
    { label: "Pending review", value: data?.stats.pending ?? "—", href: "/skills?status=pending" },
    { label: "Approved & active", value: data?.stats.approved ?? "—", href: "/skills?status=approved" },
    { label: "Data sources", value: data?.stats.dataSources ?? "—", href: "/sources" },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-[var(--ink-muted)]">
            {data?.organization?.name || "Workspace"}
          </p>
          <h1 className="font-display text-3xl tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-[var(--ink-muted)]">
            Your company brain — extract, approve, then prove agents can use it.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/extract">
            <Button>+ Extract New Skill</Button>
          </Link>
          <Link href="/simulator">
            <Button variant="outline">Open Simulator</Button>
          </Link>
        </div>
      </div>

      <div className="mt-6 rounded-md border border-[var(--accent)]/25 bg-[var(--accent-soft)]/50 px-4 py-4 text-sm">
        <p className="font-medium text-[var(--accent-deep)]">
          Company brain walkthrough (90 seconds)
        </p>
        <ol className="mt-2 list-decimal pl-5 space-y-1 text-[var(--ink)]">
          <li>
            Start with the{" "}
            <Link href="/tour" className="underline">
              thesis tour
            </Link>{" "}
            → then the{" "}
            <Link href="/map" className="underline">
              living operating map
            </Link>
            .
          </li>
          <li>
            Approve a{" "}
            <Link href="/skills?status=pending" className="underline">
              pending skill
            </Link>{" "}
            (split-screen source vs executable rule).
          </li>
          <li>
            Prove it in the{" "}
            <Link href="/simulator" className="underline">
              sandbox
            </Link>{" "}
            or download the full skills pack from the map.
          </li>
        </ol>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-md border border-[var(--line)] bg-white/90 px-4 py-5 hover:border-[var(--accent)] transition"
          >
            <p className="text-xs uppercase tracking-wide text-[var(--ink-muted)]">
              {s.label}
            </p>
            <p className="mt-2 font-display text-3xl">{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl">Recent activity</h2>
          <Badge tone="accent">Live</Badge>
        </div>
        <div className="mt-4 divide-y divide-[var(--line)] rounded-md border border-[var(--line)] bg-white">
          {(data?.activities.length ? data.activities : []).map((a) => (
            <div
              key={a.id}
              className="flex items-start justify-between gap-4 px-4 py-3 text-sm"
            >
              <p>{a.message}</p>
              <span className="shrink-0 text-[var(--ink-muted)] text-xs">
                {formatRelativeTime(a.createdAt)}
              </span>
            </div>
          ))}
          {!data?.activities?.length && (
            <div className="px-4 py-8 text-sm text-[var(--ink-muted)]">
              No activity yet.{" "}
              <Link href="/extract" className="text-[var(--accent)]">
                Extract your first skill
              </Link>
              .
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
