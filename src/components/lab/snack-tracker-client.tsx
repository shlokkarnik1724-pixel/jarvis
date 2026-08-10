"use client";

import { useEffect, useState, useTransition } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { IslandCard, ConfettiBurst } from "@/components/islands/island-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { labGet, labPost } from "@/lib/lab/client";
import { toast } from "@/lib/store/toast-store";
import type { SnackCountView } from "@/lib/types";

export function SnackTrackerClient() {
  const [snacks, setSnacks] = useState<SnackCountView[] | null>(null);
  const [custom, setCustom] = useState("");
  const [burst, setBurst] = useState(false);
  const [pending, startTransition] = useTransition();
  const reduced = useReducedMotion();

  useEffect(() => {
    startTransition(async () => {
      setSnacks(await labGet<SnackCountView[]>("snacks"));
    });
  }, []);

  function bump(snackName: string) {
    startTransition(async () => {
      const updated = await labPost<SnackCountView>({
        feature: "snacks",
        action: "bump",
        snackName,
      });
      setSnacks((prev) => {
        const next = prev ? [...prev] : [];
        const idx = next.findIndex((s) => s.snackName === updated.snackName);
        if (idx >= 0) next[idx] = updated;
        else next.push(updated);
        return next.sort((a, b) => b.count - a.count);
      });
      if (!reduced) {
        setBurst(true);
        window.setTimeout(() => setBurst(false), 1200);
      }
      toast("Snack logged", { description: snackName, tone: "success" });
    });
  }

  return (
    <div className="space-y-6">
      <ConfettiBurst show={burst} />
      <IslandCard emoji="🍿" title="Snack Tracker" floatDuration={4.8}>
        <p className="text-sm text-[var(--ink-muted)]">
          Tap to bump the munch pile. Live counter energy for the whole circle.
        </p>
      </IslandCard>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(snacks ?? []).map((snack, i) => (
          <motion.button
            key={snack.snackName}
            type="button"
            disabled={pending}
            onClick={() => bump(snack.snackName)}
            className="island-card rounded-[1.5rem] border border-white/40 bg-white/30 p-5 text-left backdrop-blur-xl active:scale-95"
            whileTap={reduced ? undefined : { scale: 0.96 }}
            animate={reduced ? undefined : { y: [0, -4, 0] }}
            transition={{
              y: { duration: 4 + i * 0.2, repeat: Infinity, ease: "easeInOut" },
            }}
          >
            <p className="font-island text-xl font-bold capitalize">{snack.snackName}</p>
            <p className="mt-2 text-3xl font-extrabold text-[var(--accent-deep)]">
              {snack.count}
            </p>
          </motion.button>
        ))}
      </div>

      <div className="flex max-w-md gap-2">
        <Input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder="Add a snack…"
        />
        <Button
          disabled={pending || !custom.trim()}
          onClick={() => {
            bump(custom.trim().toLowerCase());
            setCustom("");
          }}
        >
          Add
        </Button>
      </div>
    </div>
  );
}
