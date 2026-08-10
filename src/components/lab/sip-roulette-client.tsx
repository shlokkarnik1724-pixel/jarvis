"use client";

import { useState, useTransition } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { IslandCard, ConfettiBurst } from "@/components/islands/island-card";
import { Button } from "@/components/ui/button";
import { labPost } from "@/lib/lab/client";
import { toast } from "@/lib/store/toast-store";
import { ROULETTE_DARES } from "@/lib/lab/islands-extra";

export function SipRouletteClient() {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [burst, setBurst] = useState(false);
  const [pending, startTransition] = useTransition();
  const reduced = useReducedMotion();

  function spin() {
    startTransition(async () => {
      setSpinning(true);
      const payload = await labPost<{ dare: string; index: number }>({
        feature: "roulette",
        action: "spin",
      });
      const turns = 4 + Math.random() * 2;
      const slice = 360 / ROULETTE_DARES.length;
      setRotation((prev) => prev + turns * 360 + payload.index * slice);
      window.setTimeout(() => {
        setResult(payload.dare);
        setSpinning(false);
        setBurst(true);
        toast("Sip Wheel landed", { description: payload.dare, tone: "success" });
        window.setTimeout(() => setBurst(false), 1200);
      }, reduced ? 0 : 1800);
    });
  }

  return (
    <div className="space-y-6">
      <ConfettiBurst show={burst} />
      <IslandCard emoji="🎰" title="Sip Wheel" accent="rgba(163, 59, 43, 0.32)">
        <p className="text-sm text-[var(--ink-muted)]">
          Spin for the next dare. Water sips count — chaos optional.
        </p>
      </IslandCard>

      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="absolute left-1/2 top-0 z-10 h-0 w-0 -translate-x-1/2 border-l-8 border-r-8 border-t-[14px] border-l-transparent border-r-transparent border-t-[var(--accent-deep)]" />
          <motion.div
            className="flex h-64 w-64 items-center justify-center rounded-full border-8 border-white/50 bg-[conic-gradient(from_0deg,#1f6f54,#7eb8c9,#f0c27a,#a33b2b,#1f6f54)] shadow-xl"
            animate={{ rotate: rotation }}
            transition={{ duration: reduced ? 0 : 1.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/85 text-center text-sm font-bold backdrop-blur">
              SPIN
            </div>
          </motion.div>
        </div>
        <Button size="lg" disabled={pending || spinning} onClick={spin}>
          {spinning ? "Spinning…" : "Spin the Sip Wheel"}
        </Button>
        {result ? (
          <p className="max-w-md text-center font-island text-xl font-bold">{result}</p>
        ) : null}
      </div>
    </div>
  );
}
