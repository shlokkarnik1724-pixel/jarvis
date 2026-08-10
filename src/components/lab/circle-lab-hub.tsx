"use client";

import Link from "next/link";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { IslandCard } from "@/components/islands/island-card";
import { ISLAND_CATALOG } from "@/lib/islands/catalog";

export function CircleLabHub({
  myTitle,
  vibeCount,
  openPolls,
}: {
  myTitle: string;
  vibeCount: number;
  openPolls: number;
}) {
  return (
    <div className="space-y-8">
      <FadeIn>
        <IslandCard emoji="🌀" title="Circle Lab" floatDuration={4.6} pulse>
          <p className="text-sm text-[var(--ink-muted)]">
            Quirky islands for the group chat energy — vibes, polls, snacks, gifs, and
            morning-after recovery.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge pulse>Your title: {myTitle}</Badge>
            <Badge className="bg-white/50 text-[var(--ink-muted)]">
              {vibeCount} vibes today
            </Badge>
            <Badge className="bg-white/50 text-[var(--ink-muted)]">
              {openPolls} open polls
            </Badge>
          </div>
        </IslandCard>
      </FadeIn>

      <Stagger className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {ISLAND_CATALOG.filter((island) => island.href !== "/fun").map((feature, index) => (
          <StaggerItem key={feature.href}>
            <IslandCard
              href={feature.href}
              emoji={feature.emoji}
              title={feature.title}
              accent={feature.accent}
              delay={0.03 * (index % 5)}
              floatDuration={4 + (index % 4) * 0.4}
            >
              <p className="text-sm text-[var(--ink-muted)]">{feature.blurb}</p>
            </IslandCard>
          </StaggerItem>
        ))}
      </Stagger>

      <p className="text-sm text-[var(--ink-muted)]">
        Prefer the classic list?{" "}
        <Link href="/dashboard" className="text-[var(--accent-deep)] underline">
          Back to Islands home
        </Link>
      </p>
    </div>
  );
}
