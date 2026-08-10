"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { PartyWidget } from "@/components/party/party-widget";
import { Badge } from "@/components/ui/badge";
import { PARTY_ISLANDS, circleLayout } from "@/lib/islands/party-catalog";
import { playSound } from "@/lib/sound/sfx";
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
  const layout = circleLayout(PARTY_ISLANDS.length, 40);

  return (
    <div className="relative min-h-[70dvh]">
      <div className="relative z-20 mb-3 space-y-2.5 px-1 pt-1">
        <p className="font-island text-3xl font-extrabold tracking-tight text-white drop-shadow-[0_3px_12px_rgba(0,0,0,0.85)] sm:text-4xl md:text-5xl">
          🌀 Circle
        </p>
        <p className="max-w-xl text-sm font-medium text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] sm:text-base md:text-lg">
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

      {/* True circle stage — square box so it never becomes an oval on phones */}
      <div className="relative z-10 mx-auto mt-2 w-[min(100%,22rem)] aspect-square sm:w-[min(100%,28rem)] md:w-[min(100%,34rem)]">
        <motion.div
          className="absolute inset-0"
          animate={reduceMotion ? undefined : { rotate: 360 }}
          transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
        >
          <div className="pointer-events-none absolute inset-[8%] rounded-full border border-white/30 shadow-[0_0_80px_rgba(255,255,255,0.08)]" />
          <div className="pointer-events-none absolute inset-[28%] rounded-full border border-dashed border-white/20" />

          {PARTY_ISLANDS.map((island, index) => {
            const pos = layout[index] ?? { x: 50, y: 50 };
            return (
              <div
                key={island.href}
                className="absolute z-10"
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {/* Counter-rotate so labels stay upright while the ring spins */}
                <motion.div
                  animate={reduceMotion ? undefined : { rotate: -360 }}
                  transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
                >
                  <Link
                    href={island.href}
                    onClick={() => playSound("tap")}
                    className="group block focus-visible:outline-none"
                  >
                    <motion.div
                      className={cn(
                        "relative flex h-[3.6rem] w-[3.6rem] flex-col items-center justify-center overflow-hidden rounded-full border-2 border-white/45 text-center shadow-[0_16px_40px_rgba(0,0,0,0.5)] backdrop-blur-md sm:h-[4.5rem] sm:w-[4.5rem] md:h-24 md:w-24",
                        `room-chip-${island.theme}`
                      )}
                      style={{
                        boxShadow: `0 18px 40px -14px ${island.accent}aa, 0 0 0 1px rgba(255,255,255,0.25)`,
                      }}
                      whileTap={reduceMotion ? undefined : { scale: 0.94 }}
                      animate={
                        reduceMotion
                          ? undefined
                          : {
                              y: [0, -5, 0, 4, 0],
                            }
                      }
                      transition={{
                        duration: 3.6 + (index % 4) * 0.3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: index * 0.08,
                      }}
                    >
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/45" />
                      <span className="relative text-lg leading-none drop-shadow sm:text-xl md:text-2xl">
                        {island.emoji}
                      </span>
                      <span className="relative mt-0.5 max-w-[3.2rem] px-0.5 font-island text-[8px] font-bold leading-tight text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] sm:max-w-[4rem] sm:text-[9px] md:text-[11px]">
                        {island.title}
                      </span>
                    </motion.div>
                  </Link>
                </motion.div>
              </div>
            );
          })}
        </motion.div>

        <motion.div
          className="absolute left-1/2 top-1/2 z-20 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border-2 border-amber-200/50 bg-black/70 text-center shadow-[0_0_40px_rgba(245,158,11,0.35)] backdrop-blur-md sm:h-20 sm:w-20 md:h-28 md:w-28"
          animate={
            reduceMotion
              ? undefined
              : {
                  scale: [1, 1.05, 1],
                }
          }
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="font-island text-sm text-amber-100 sm:text-base md:text-xl">Circle</span>
          <span className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.14em] text-amber-100/90 sm:text-[9px]">
            spin · tap
          </span>
        </motion.div>
      </div>

      <p className="mt-4 px-2 text-center text-xs font-medium text-white/90 drop-shadow-[0_2px_6px_rgba(0,0,0,0.75)] sm:text-sm">
        true circle · rooms keep spinning · tap a bubble to enter
      </p>
    </div>
  );
}
