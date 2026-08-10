"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { IslandCard } from "@/components/islands/island-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { labPost } from "@/lib/lab/client";
import { toast } from "@/lib/store/toast-store";
import type { TruthDareCard } from "@/lib/types";

export function TruthDareClient() {
  const [card, setCard] = useState<TruthDareCard | null>(null);
  const [kind, setKind] = useState<"truth" | "dare">("dare");
  const [text, setText] = useState("");
  const [pending, startTransition] = useTransition();
  const reduced = useReducedMotion();

  function draw() {
    startTransition(async () => {
      const next = await labPost<TruthDareCard>({
        feature: "truthdare",
        action: "draw",
      });
      setCard(next);
    });
  }

  function add() {
    startTransition(async () => {
      await labPost({ feature: "truthdare", action: "add", kind, text });
      setText("");
      toast("Card added to the deck", { tone: "success" });
    });
  }

  return (
    <div className="space-y-6">
      <IslandCard emoji="🃏" title="Truth or Dare" accent="rgba(154, 103, 0, 0.3)">
        <p className="text-sm text-[var(--ink-muted)]">
          Swipe energy in button form. Add custom dares for your circle.
        </p>
      </IslandCard>

      <div className="flex justify-center">
        <AnimatePresence mode="wait">
          {card ? (
            <motion.div
              key={card.id}
              initial={reduced ? false : { opacity: 0, rotate: -4, y: 12 }}
              animate={{ opacity: 1, rotate: 0, y: 0 }}
              exit={reduced ? undefined : { opacity: 0, rotate: 6, y: -12 }}
              className="w-full max-w-md rounded-[1.75rem] border border-white/40 bg-white/40 p-8 text-center shadow-xl backdrop-blur-xl"
            >
              <p className="text-sm uppercase tracking-wide text-[var(--ink-muted)]">
                {card.kind}
                {card.custom ? " · custom" : ""}
              </p>
              <p className="mt-4 font-island text-2xl font-bold">{card.text}</p>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              className="w-full max-w-md rounded-[1.75rem] border border-dashed border-white/50 bg-white/20 p-8 text-center backdrop-blur"
            >
              <p className="text-[var(--ink-muted)]">Draw a card to start.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex justify-center">
        <Button size="lg" disabled={pending} onClick={draw}>
          Draw card
        </Button>
      </div>

      <section className="glass-panel mx-auto max-w-lg space-y-3 rounded-2xl border border-white/40 p-5">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={kind === "truth" ? "default" : "secondary"}
            onClick={() => setKind("truth")}
          >
            Truth
          </Button>
          <Button
            size="sm"
            variant={kind === "dare" ? "default" : "secondary"}
            onClick={() => setKind("dare")}
          >
            Dare
          </Button>
        </div>
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a custom prompt…"
        />
        <Button disabled={pending || !text.trim()} onClick={add}>
          Add to deck
        </Button>
      </section>
    </div>
  );
}
