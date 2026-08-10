"use client";

import { useEffect, useState, useTransition } from "react";
import { IslandCard } from "@/components/islands/island-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { labGet, labPost } from "@/lib/lab/client";
import { toast } from "@/lib/store/toast-store";
import type { CircleStreakView } from "@/lib/types";

export function StreaksClient() {
  const [streak, setStreak] = useState<CircleStreakView | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      setStreak(await labGet<CircleStreakView>("streaks"));
    });
  }, []);

  function checkIn() {
    startTransition(async () => {
      const next = await labPost<CircleStreakView>({
        feature: "streaks",
        action: "checkin",
      });
      setStreak(next);
      toast("Streak secured", {
        description: `${next.current} day streak`,
        tone: "success",
      });
    });
  }

  return (
    <div className="space-y-6">
      <IslandCard emoji="🔥" title="Streaks" accent="rgba(163, 59, 43, 0.35)" pulse>
        <p className="text-sm text-[var(--ink-muted)]">
          Snapchat-style days the circle actually showed up. Check in once a day.
        </p>
      </IslandCard>

      {streak ? (
        <div className="grid max-w-lg gap-4 sm:grid-cols-2">
          <div className="rounded-[1.5rem] border border-white/40 bg-white/30 p-6 backdrop-blur-xl">
            <p className="text-sm text-[var(--ink-muted)]">Current</p>
            <p className="font-island text-5xl font-extrabold text-[var(--accent-deep)]">
              {streak.current}
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-white/40 bg-white/30 p-6 backdrop-blur-xl">
            <p className="text-sm text-[var(--ink-muted)]">Best</p>
            <p className="font-island text-5xl font-extrabold">{streak.best}</p>
          </div>
          <div className="sm:col-span-2">
            <Button
              disabled={pending || streak.checkedInToday}
              onClick={checkIn}
              className="w-full"
            >
              {streak.checkedInToday ? "Already checked in today" : "Check in for the circle"}
            </Button>
            {streak.checkedInToday ? (
              <Badge className="mt-3" pulse>
                streak protected
              </Badge>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
