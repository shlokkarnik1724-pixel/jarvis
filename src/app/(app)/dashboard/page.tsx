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
    { label: "Skills extracted", value: data?.stats.extracted ?? "—" },
    { label: "Pending review", value: data?.stats.pending ?? "—" },
    { label: "Approved & active", value: data?.stats.approved ?? "—" },
    { label: "Data sources", value: data?.stats.dataSources ?? "—" },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-[var(--ink-muted)]">
            Your company brain at a glance.
          </p>
        </div>
        <Link href="/extract">
          <Button>+ Extract New Skill</Button>
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-md border border-[var(--line)] bg-white/90 px-4 py-5"
          >
            <p className="text-xs uppercase tracking-wide text-[var(--ink-muted)]">
              {s.label}
            </p>
            <p className="mt-2 font-display text-3xl">{s.value}</p>
          </div>
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
              </Link>{" "}
              to wake this feed up.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
