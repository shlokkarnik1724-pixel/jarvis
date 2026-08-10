"use client";

import { useEffect, useState, useTransition } from "react";
import { motion } from "framer-motion";
import { IslandCard } from "@/components/islands/island-card";
import { Button } from "@/components/ui/button";
import { partyGet, partyPost } from "@/lib/party/client";
import { toast } from "@/lib/store/toast-store";

type Poll = {
  buckets: Array<{ score: number; count: number }>;
  avg: number;
  total: number;
};

export function VibePollClient() {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [pending, startTransition] = useTransition();

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
      <IslandCard emoji="🔮" title="Vibe Check Poll" accent="rgba(91,216,168,0.4)" pulse>
        <p className="text-sm text-[var(--ink-muted)]">
          Rate the vibe rn 1–10. Live bouncing bars for the whole circle.
        </p>
        {poll ? (
          <p className="mt-2 text-sm">
            avg <strong>{poll.avg || "—"}</strong> · {poll.total} votes
          </p>
        ) : null}
      </IslandCard>

      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((score) => (
          <Button
            key={score}
            size="sm"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const next = await partyPost<Poll>({
                  feature: "vibe-poll",
                  action: "vote",
                  score,
                });
                setPoll(next);
                toast("Vibe logged", { description: `${score}/10`, tone: "success" });
              })
            }
          >
            {score}
          </Button>
        ))}
      </div>

      <div className="flex h-48 items-end gap-2 rounded-2xl border border-white/40 bg-white/70 p-4">
        {(poll?.buckets ?? []).map((bucket) => (
          <div key={bucket.score} className="flex flex-1 flex-col items-center gap-2">
            <motion.div
              className="w-full rounded-t-lg bg-[var(--accent)]"
              animate={{ height: `${(bucket.count / max) * 100}%` }}
              transition={{ type: "spring", stiffness: 220, damping: 18 }}
              style={{ minHeight: bucket.count > 0 ? 8 : 2 }}
            />
            <span className="text-xs text-[var(--ink-muted)]">{bucket.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
