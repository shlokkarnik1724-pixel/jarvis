"use client";

import Link from "next/link";
import {
  BookOpen,
  Dice5,
  Flame,
  HeartPulse,
  MessageSquareQuote,
  MessageCircleQuestion,
  Smile,
  Sparkles,
  Coins,
} from "lucide-react";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";

const FEATURES = [
  {
    href: "/fun/vibe-check",
    title: "Vibe Check",
    blurb: "One-tap daily mood ring for the whole circle.",
    icon: Smile,
  },
  {
    href: "/fun/jokes",
    title: "Inside Joke Dictionary",
    blurb: "Crowd-sourced slang with a ‘same 😂’ counter.",
    icon: BookOpen,
  },
  {
    href: "/fun/currency",
    title: "Circle Currency",
    blurb: "Unified points + silly titles from real circle actions.",
    icon: Coins,
  },
  {
    href: "/fun/most-likely",
    title: "Who’s Most Likely To",
    blurb: "24h polls that feed the Circle Legends board.",
    icon: MessageCircleQuestion,
  },
  {
    href: "/fun/confessions",
    title: "Confession Wall",
    blurb: "Anonymous posts — no authorId on the wall itself.",
    icon: Flame,
  },
  {
    href: "/fun/bingo",
    title: "Blackout Bingo",
    blurb: "5×5 chaos predictions for event nights.",
    icon: Dice5,
  },
  {
    href: "/fun/recovery",
    title: "Hangover Recovery",
    blurb: "Checklist, remedies, wellness SOS, hydration, kit list.",
    icon: HeartPulse,
  },
  {
    href: "/fun/drinks",
    title: "Drinks Bar",
    blurb: "No-equipment bachelor pours.",
    icon: Sparkles,
  },
  {
    href: "/fun/roast-toast",
    title: "Roast & Toast",
    blurb: "Anonymous roast energy, toast energy.",
    icon: MessageSquareQuote,
  },
];

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
        <section className="relative overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[linear-gradient(135deg,rgba(31,111,84,0.14),rgba(217,228,239,0.5)_50%,rgba(251,252,249,0.9))] px-6 py-8 md:px-10">
          <p className="text-sm text-[var(--accent-deep)]">Circle Lab</p>
          <h1 className="mt-2 font-display text-3xl tracking-tight md:text-4xl">
            Quirky tools for the group chat energy
          </h1>
          <p className="mt-3 max-w-2xl text-[var(--ink-muted)]">
            Vibes, polls, bingo, confessions, and morning-after recovery — all
            feeding one shared points ledger.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Badge pulse>Your title: {myTitle}</Badge>
            <Badge className="bg-[var(--bg)] text-[var(--ink-muted)]">
              {vibeCount} vibes today
            </Badge>
            <Badge className="bg-[var(--bg)] text-[var(--ink-muted)]">
              {openPolls} open polls
            </Badge>
          </div>
        </section>
      </FadeIn>

      <Stagger className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <StaggerItem key={feature.href}>
              <Link
                href={feature.href}
                className="interactive-glow block rounded-2xl border border-[var(--line)] bg-[var(--bg-elevated)]/75 p-5 backdrop-blur-sm"
              >
                <Icon className="h-5 w-5 text-[var(--accent)]" />
                <h2 className="mt-3 text-lg font-medium">{feature.title}</h2>
                <p className="mt-1 text-sm text-[var(--ink-muted)]">{feature.blurb}</p>
              </Link>
            </StaggerItem>
          );
        })}
      </Stagger>
    </div>
  );
}
