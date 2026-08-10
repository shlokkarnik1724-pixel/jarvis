"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { PartyWidget } from "@/components/party/party-widget";
import { Badge } from "@/components/ui/badge";
import { PARTY_ISLANDS, circleLayout } from "@/lib/islands/party-catalog";
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
  const reduceMotion = useReducedMotion();
  const layout = circleLayout(PARTY_ISLANDS.length);

  return (
    <div className="relative min-h-[82vh]">
      <div className="relative z-20 mb-2 space-y-3 px-2 pt-2">
        <p className="font-island text-4xl font-extrabold tracking-tight text-white drop-shadow-[0_3px_12px_rgba(0,0,0,0.85)] md:text-5xl">
          🌀 Circle
        </p>
        <p className="max-w-xl text-base font-medium text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] md:text-lg">
          Hey {userName} — {circleName} already started. Tap a room on the circle.
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge pulse className="border border-white/30 bg-black/45 text-white shadow-lg">
            {myTitle}
          </Badge>
          {inviteCode ? (
            <Badge className="border border-white/25 bg-black/40 text-white/90">
              invite {inviteCode}
            </Badge>
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

      <div className="relative mx-auto mt-2 h-[min(78vw,36rem)] w-full max-w-5xl md:h-[40rem]">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-[min(68%,28rem)] w-[min(68%,28rem)] rounded-full border border-white/30 shadow-[0_0_80px_rgba(255,255,255,0.08)]" />
          <div className="absolute h-[min(42%,17rem)] w-[min(42%,17rem)] rounded-full border border-dashed border-white/20" />
        </div>

        <motion.div
          className="absolute left-1/2 top-1/2 z-20 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border-2 border-amber-200/50 bg-black/65 text-center shadow-[0_0_40px_rgba(245,158,11,0.35)] backdrop-blur-md md:h-32 md:w-32"
          animate={
            reduceMotion
              ? undefined
              : {
                  scale: [1, 1.05, 1],
                  boxShadow: [
                    "0 0 28px rgba(245,158,11,0.28)",
                    "0 0 48px rgba(245,158,11,0.48)",
                    "0 0 28px rgba(245,158,11,0.28)",
                  ],
                }
          }
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="font-island text-xl text-amber-100 md:text-2xl">Circle</span>
          <span className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-amber-100/90 md:text-[10px]">
            pick a room
          </span>
        </motion.div>

        {PARTY_ISLANDS.map((island, index) => {
          const pos = layout[index] ?? { x: 50, y: 50 };
          return (
            <motion.div
              key={island.href}
              className="absolute z-10"
              style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: "translate(-50%, -50%)" }}
              initial={reduceMotion ? false : { opacity: 0, scale: 0.75 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 * index, type: "spring", stiffness: 220, damping: 18 }}
            >
              <Link href={island.href} className="group block focus-visible:outline-none">
                <motion.div
                  className={cn(
                    "relative flex h-[5.75rem] w-[5.75rem] flex-col items-center justify-center overflow-hidden rounded-full border-2 border-white/45 text-center shadow-[0_16px_40px_rgba(0,0,0,0.5)] backdrop-blur-md md:h-28 md:w-28",
                    `room-chip-${island.theme}`
                  )}
                  style={{
                    boxShadow: `0 18px 40px -14px ${island.accent}aa, 0 0 0 1px rgba(255,255,255,0.25)`,
                  }}
                  whileHover={reduceMotion ? undefined : { y: -8, scale: 1.08 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.96 }}
                  animate={
                    reduceMotion
                      ? undefined
                      : {
                          y: [0, -8, 0, 5, 0],
                          rotate: [island.tilt * 0.35, island.tilt * -0.25, island.tilt * 0.35],
                        }
                  }
                  transition={{
                    duration: 4 + (index % 4) * 0.35,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.1,
                  }}
                >
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/45" />
                  <span className="relative text-2xl leading-none drop-shadow md:text-3xl">
                    {island.emoji}
                  </span>
                  <span className="relative mt-1 max-w-[5.2rem] px-1 font-island text-[10px] font-bold leading-tight text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] md:text-xs">
                    {island.title}
                  </span>
                </motion.div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <p className="mt-4 text-center text-sm font-medium text-white/90 drop-shadow-[0_2px_6px_rgba(0,0,0,0.75)]">
        rooms float on the circle · each one is its own quirky environment · tap to enter
      </p>
    </div>
  );
}
