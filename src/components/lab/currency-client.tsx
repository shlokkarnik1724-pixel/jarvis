"use client";

import { useEffect, useState, useTransition } from "react";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { labGet } from "@/lib/lab/client";
import type { LeaderboardRow, PointsLedgerEntry } from "@/lib/types";

type CurrencyPayload = {
  rows: LeaderboardRow[];
  ledger: PointsLedgerEntry[];
  titles: Array<{ userId: string; name: string; title: string; totalPoints: number }>;
};

export function CurrencyClient() {
  const [data, setData] = useState<CurrencyPayload | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      setData(await labGet<CurrencyPayload>("currency"));
    });
  }, []);

  return (
    <div className="space-y-8">
      <FadeIn>
        <h1 className="font-display text-3xl">Circle Currency</h1>
        <p className="mt-2 max-w-xl text-[var(--ink-muted)]">
          One points ledger for vibe checks, polls, bingo, hydration streaks, and
          more — redeemable as silly titles.
        </p>
      </FadeIn>

      {!data ? (
        <Skeleton className="h-40 w-full" />
      ) : (
        <>
          <Stagger className="space-y-3">
            {data.rows.map((row, index) => (
              <StaggerItem key={row.userId}>
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-[var(--bg-elevated)]/70 px-4 py-4">
                  <div className="flex items-center gap-3">
                    <span className="font-display text-2xl text-[var(--accent-deep)]">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium">{row.nickname || row.name}</p>
                      <p className="text-sm text-[var(--ink-muted)]">
                        {row.title ?? "New Orbit"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {Object.entries(row.breakdown).map(([type, pts]) => (
                      <Badge key={type} className="bg-[var(--bg)] text-[var(--ink-muted)]">
                        {type.replaceAll("_", " ")}: {pts}
                      </Badge>
                    ))}
                    <span className="font-semibold">{row.totalPoints} pts</span>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>

          <FadeIn delay={0.08}>
            <h2 className="mb-3 text-lg font-medium">Recent ledger</h2>
            <ul className="space-y-2">
              {data.ledger.map((entry) => (
                <li
                  key={entry.id}
                  className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] py-2 text-sm"
                >
                  <span>{entry.reason}</span>
                  <span className="font-medium text-[var(--accent-deep)]">
                    +{entry.delta}
                  </span>
                </li>
              ))}
              {data.ledger.length === 0 ? (
                <li className="text-sm text-[var(--ink-muted)]">
                  No ledger events yet — tap a vibe or bump a joke.
                </li>
              ) : null}
            </ul>
          </FadeIn>
        </>
      )}
    </div>
  );
}
