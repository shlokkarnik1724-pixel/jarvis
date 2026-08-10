"use client";

import { useEffect, useMemo, useState } from "react";
import { IslandCard } from "@/components/islands/island-card";
import { ISLAND_CATALOG } from "@/lib/islands/catalog";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/motion/reveal";

function Countdown({ targetIso }: { targetIso: string | null }) {
  const target = useMemo(
    () => (targetIso ? new Date(targetIso).getTime() : null),
    [targetIso]
  );
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!target) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [target]);

  if (!target) {
    return <p className="text-sm text-[var(--ink-muted)]">No upcoming event yet.</p>;
  }

  const diff = Math.max(0, target - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);

  return (
    <div className="grid grid-cols-4 gap-2 text-center">
      {[
        ["d", days],
        ["h", hours],
        ["m", mins],
        ["s", secs],
      ].map(([label, value]) => (
        <div
          key={label as string}
          className="rounded-2xl bg-white/50 px-2 py-3 shadow-inner"
        >
          <p className="font-island text-xl font-bold">{value}</p>
          <p className="text-[10px] uppercase tracking-wide text-[var(--ink-muted)]">
            {label}
          </p>
        </div>
      ))}
    </div>
  );
}

export function IslandsDashboard({
  userName,
  circleName,
  inviteCode,
  upcomingTitle,
  upcomingDate,
  vibeCount,
  openPolls,
  myTitle,
}: {
  userName: string;
  circleName: string;
  inviteCode: string | null;
  upcomingTitle: string | null;
  upcomingDate: string | null;
  vibeCount: number;
  openPolls: number;
  myTitle: string;
}) {
  return (
    <div className="space-y-8">
      <FadeIn>
        <section className="max-w-2xl">
          <p className="font-island text-5xl tracking-tight md:text-6xl">🌀 Circle</p>
          <p className="mt-3 text-lg text-[var(--ink-muted)]">
            Hey {userName} — {circleName} is floating. Tap an island.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge pulse>{myTitle}</Badge>
            <Badge className="bg-white/50 text-[var(--ink-muted)]">
              {vibeCount} vibes live
            </Badge>
            <Badge className="bg-white/50 text-[var(--ink-muted)]">
              {openPolls} open polls
            </Badge>
            {inviteCode ? (
              <Badge className="bg-white/50 text-[var(--ink-muted)]">
                invite {inviteCode}
              </Badge>
            ) : null}
          </div>
        </section>
      </FadeIn>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <IslandCard
          emoji="⏳"
          title="Countdown"
          accent="rgba(126, 184, 201, 0.45)"
          floatDuration={4.5}
          className="sm:col-span-2 xl:col-span-1"
        >
          <p className="mb-3 text-sm text-[var(--ink-muted)]">
            {upcomingTitle ?? "Nothing scheduled"}
          </p>
          <Countdown targetIso={upcomingDate} />
        </IslandCard>

        {ISLAND_CATALOG.map((island, index) => (
          <IslandCard
            key={island.href}
            href={island.href}
            emoji={island.emoji}
            title={island.title}
            accent={island.accent}
            delay={0.04 * (index % 6)}
            floatDuration={4.2 + (index % 5) * 0.35}
            pulse={island.href === "/fun/vibe-check" && vibeCount > 0}
          >
            <p className="text-sm text-[var(--ink-muted)]">{island.blurb}</p>
          </IslandCard>
        ))}
      </div>
    </div>
  );
}
