"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { generateVibes, type VibeSuggestion } from "@/lib/fun/vibe";
import type { EventView } from "@/lib/types";
import { useCircleStore } from "@/lib/store/circle-store";
import { Badge } from "@/components/ui/badge";

export function VibeGenerator({ events }: { events: EventView[] }) {
  const { vibeSuggestions, setVibeSuggestions } = useCircleStore();
  const [pending, startTransition] = useTransition();

  function regenerate() {
    startTransition(() => {
      const next: VibeSuggestion[] = generateVibes(events, 3);
      setVibeSuggestions(next);
    });
  }

  const items = vibeSuggestions.length > 0 ? vibeSuggestions : generateVibes(events, 3);

  return (
    <div className="space-y-6">
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

      <ul className="space-y-6">
        {items.map((item) => (
          <li key={item.title} className="border-b border-[var(--line)] pb-6 animate-fade-up">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h2 className="text-xl font-medium">{item.title}</h2>
              <Badge>{Math.round(item.confidence * 100)}% fit</Badge>
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
                <Badge className="bg-[var(--bg)] text-[var(--ink-muted)]">fresh idea</Badge>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
