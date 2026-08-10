"use client";

import { useTransition } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { generateVibes, type VibeSuggestion } from "@/lib/fun/vibe";
import type { EventView } from "@/lib/types";
import { useCircleStore } from "@/lib/store/circle-store";
import { Badge } from "@/components/ui/badge";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion/reveal";
import { toast } from "@/lib/store/toast-store";
import { duration, easeOut } from "@/lib/motion";
import { Skeleton } from "@/components/ui/skeleton";

export function VibeGenerator({ events }: { events: EventView[] }) {
  const { vibeSuggestions, setVibeSuggestions } = useCircleStore();
  const [pending, startTransition] = useTransition();
  const reduced = useReducedMotion();

  function regenerate() {
    startTransition(() => {
      const next: VibeSuggestion[] = generateVibes(events, 3);
      setVibeSuggestions(next);
      toast("Fresh vibes", { description: "Reshuffled from your event tags.", tone: "info" });
    });
  }

  const items = vibeSuggestions.length > 0 ? vibeSuggestions : generateVibes(events, 3);

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl">Random Vibe Gen</h1>
            <p className="mt-2 max-w-xl text-[var(--ink-muted)]">
              Suggestions weighted by tags from your circle&apos;s past events.
            </p>
          </div>
          <Button onClick={regenerate} disabled={pending}>
            {pending ? "Shuffling…" : "New vibes"}
          </Button>
        </div>
      </FadeIn>

      {pending ? (
        <div className="space-y-6" role="status" aria-label="Loading vibes">
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-3 border-b border-[var(--line)] pb-6">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.ul
            key={items.map((i) => i.title).join("|")}
            className="space-y-6"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduced ? undefined : { opacity: 0 }}
            transition={{ duration: duration.fast, ease: easeOut }}
          >
            <Stagger className="contents">
              {items.map((item) => (
                <StaggerItem key={item.title}>
                  <li className="interactive-glow rounded-2xl border border-transparent border-b-[var(--line)] pb-6 hover:border-[var(--line)] hover:bg-[var(--bg-elevated)]/70 hover:px-4 hover:py-4 hover:backdrop-blur-sm">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <h2 className="text-xl font-medium">{item.title}</h2>
                      <Badge pulse>{Math.round(item.confidence * 100)}% fit</Badge>
                    </div>
                    <p className="mt-2 text-[var(--ink-muted)]">{item.blurb}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.matchedTags.length > 0 ? (
                        item.matchedTags.map((tag) => (
                          <Badge key={tag} className="bg-[var(--bg)] text-[var(--ink-muted)]">
                            matched: {tag}
                          </Badge>
                        ))
                      ) : (
                        <Badge className="bg-[var(--bg)] text-[var(--ink-muted)]">
                          fresh idea
                        </Badge>
                      )}
                    </div>
                  </li>
                </StaggerItem>
              ))}
            </Stagger>
          </motion.ul>
        </AnimatePresence>
      )}
    </div>
  );
}
