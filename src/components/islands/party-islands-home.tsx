"use client";

import Link from "next/link";
import { PartyWidget } from "@/components/party/party-widget";
import { PARTY_ISLANDS } from "@/lib/islands/party-catalog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function PartyIslandsHome({
  userName,
  circleName,
  inviteCode,
  eventName,
  eventLocation,
  eventDate,
  confirmedCount,
  maybeCount,
  myTitle,
}: {
  userName: string;
  circleName: string;
  inviteCode: string | null;
  eventName: string | null;
  eventLocation: string | null;
  eventDate: string | null;
  confirmedCount: number;
  maybeCount: number;
  myTitle: string;
}) {
  return (
    <div className="relative min-h-[78vh]">
      <div className="relative z-10 mb-4 space-y-3 px-2 pt-2 text-white">
        <p className="font-island text-4xl font-extrabold tracking-tight md:text-5xl">
          🌀 Circle
        </p>
        <p className="max-w-xl text-white/75">
          Hey {userName} — {circleName} already started. Tap an island.
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge pulse className="bg-white/20 text-white">
            {myTitle}
          </Badge>
          {inviteCode ? (
            <Badge className="bg-white/10 text-white/80">invite {inviteCode}</Badge>
          ) : null}
        </div>
        <PartyWidget
          name={eventName ?? "Open hang"}
          emoji="🎉"
          startTs={eventDate}
          location={eventLocation ?? "Wherever the circle lands"}
          confirmedCount={confirmedCount}
          maybeCount={maybeCount}
        />
      </div>

      <div className="relative mx-auto mt-4 h-[560px] w-full max-w-5xl md:h-[640px]">
        {PARTY_ISLANDS.map((island, index) => (
          <Link
            key={island.href}
            href={island.href}
            className={cn(
              "party-island party-island-float absolute flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-white/30 bg-white/15 text-center shadow-[0_16px_40px_-18px_rgba(0,0,0,0.55)] backdrop-blur-xl transition hover:scale-110 hover:bg-white/25 active:scale-95 md:h-32 md:w-32"
            )}
            style={
              {
                left: `${island.x}%`,
                top: `${island.y}%`,
                ["--i" as string]: index,
                boxShadow: `0 18px 40px -16px ${island.accent}88`,
              } as React.CSSProperties
            }
          >
            <span className="text-3xl leading-none md:text-4xl">{island.emoji}</span>
            <span className="mt-1 px-2 font-island text-xs font-bold text-white md:text-sm">
              {island.title}
            </span>
          </Link>
        ))}
      </div>

      <p className="mt-6 text-center text-sm text-white/55">
        islands bob · glow on hover · tap to zoom into the feature
      </p>
    </div>
  );
}
