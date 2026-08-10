"use client";

import { useEffect, useState, useTransition } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { IslandCard } from "@/components/islands/island-card";
import { Button } from "@/components/ui/button";
import { partyGet, partyPost } from "@/lib/party/client";
import { playSound } from "@/lib/sound/sfx";
import { toast } from "@/lib/store/toast-store";

type Poll = {
  buckets: Array<{
    score: number;
    slangId: string;
    label: string;
    emoji: string;
    count: number;
  }>;
  avg: number;
  total: number;
  topLabel: string | null;
};

export function VibePollClient() {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [pending, startTransition] = useTransition();
  const reduced = useReducedMotion();

  function load() {
    startTransition(async () => {
      setPoll(await partyGet<Poll>("vibe-poll"));
    });
  }

  useEffect(() => {
    load();
  }, []);

  const max = Math.max(1, ...(poll?.buckets.map((b) => b.count) ?? [1]));

  return (
    <div className="space-y-6">
      <IslandCard emoji="🔮" title="Vibe Poll" accent="rgba(91,216,168,0.4)" pulse>
        <p className="text-sm text-[var(--ink-muted)]">
          Drop a Gen Z slang vote — not boring 1–10 vibes. Live bars bounce with the room.
        </p>
        {poll ? (
          <p className="mt-2 text-sm">
            energy <strong>{poll.avg || "—"}</strong>/10 · {poll.total} votes
            {poll.topLabel ? ` · leading: “${poll.topLabel}”` : ""}
          </p>
        ) : null}
      </IslandCard>

      <div className="grid gap-2 sm:grid-cols-2">
        {(poll?.buckets ?? []).map((bucket) => (
          <Button
            key={bucket.slangId}
            disabled={pending}
            className="h-auto min-h-12 justify-start whitespace-normal px-3 py-3 text-left"
            variant="secondary"
            onClick={() =>
              startTransition(async () => {
                playSound("vote");
                const next = await partyPost<Poll>({
                  feature: "vibe-poll",
                  action: "vote",
                  slangId: bucket.slangId,
                  score: bucket.score,
                });
                setPoll(next);
                toast("Vibe logged", { description: bucket.label, tone: "success" });
              })
            }
          >
            <span className="mr-2 text-lg">{bucket.emoji}</span>
            <span className="text-sm font-semibold">{bucket.label}</span>
          </Button>
        ))}
      </div>

      <div className="space-y-3 rounded-2xl border border-white/40 bg-white/70 p-4">
        {(poll?.buckets ?? []).map((bucket) => (
          <div key={`bar-${bucket.slangId}`}>
            <div className="mb-1 flex items-center justify-between gap-2 text-xs">
              <span className="font-medium">
                {bucket.emoji} {bucket.label}
              </span>
              <span className="text-[var(--ink-muted)]">{bucket.count}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-black/10">
              <motion.div
                className="h-full rounded-full bg-[var(--accent)]"
                animate={{ width: `${(bucket.count / max) * 100}%` }}
                transition={
                  reduced
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 180, damping: 18 }
                }
                style={{ minWidth: bucket.count > 0 ? 8 : 0 }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
