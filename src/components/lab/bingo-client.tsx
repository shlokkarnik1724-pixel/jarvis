"use client";

import { useEffect, useState, useTransition } from "react";
import { FadeIn } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { labGet, labPost } from "@/lib/lab/client";
import { toast } from "@/lib/store/toast-store";
import type { BingoCardView, EventView } from "@/lib/types";
import { cn } from "@/lib/utils";

type BingoPayload = {
  cards: BingoCardView[];
  events: EventView[];
};

export function BingoClient() {
  const [data, setData] = useState<BingoPayload | null>(null);
  const [card, setCard] = useState<BingoCardView | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const payload = await labGet<BingoPayload>("bingo");
      setData(payload);
      setCard(payload.cards[0] ?? null);
    });
  }, []);

  function deal(eventId: string) {
    startTransition(async () => {
      try {
        const next = await labPost<BingoCardView>({
          feature: "bingo",
          action: "deal",
          eventId,
        });
        setCard(next);
        toast("Card dealt", { description: next.eventTitle, tone: "success" });
      } catch (error) {
        toast("Deal failed", {
          description: error instanceof Error ? error.message : undefined,
          tone: "error",
        });
      }
    });
  }

  function mark(index: number) {
    if (!card) return;
    startTransition(async () => {
      const next = await labPost<BingoCardView>({
        feature: "bingo",
        action: "mark",
        cardId: card.id,
        index,
      });
      setCard(next);
      if (next.hasBingo) {
        toast("BINGO", { description: "+15 Circle Currency", tone: "success" });
      }
    });
  }

  return (
    <div className="space-y-8">
      <FadeIn>
        <h1 className="font-display text-3xl">Blackout Bingo</h1>
        <p className="mt-2 max-w-xl text-[var(--ink-muted)]">
          5×5 predicted chaos for an event. Mark squares live — first bingo wins
          a badge (and points).
        </p>
      </FadeIn>

      {!data ? (
        <Skeleton className="h-40 w-full" />
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {data.events.map((event) => (
              <Button
                key={event.id}
                size="sm"
                variant="secondary"
                disabled={pending}
                onClick={() => deal(event.id)}
              >
                Deal for {event.title}
              </Button>
            ))}
          </div>

          {card ? (
            <FadeIn>
              <div className="mb-3 flex items-center gap-2">
                <h2 className="text-lg font-medium">{card.eventTitle}</h2>
                {card.hasBingo ? <Badge pulse>BINGO</Badge> : null}
              </div>
              <div className="grid max-w-3xl grid-cols-5 gap-2">
                {card.grid.map((cell, index) => (
                  <button
                    key={`${card.id}-${index}`}
                    type="button"
                    disabled={pending || index === 12}
                    onClick={() => mark(index)}
                    className={cn(
                      "min-h-24 rounded-xl border p-2 text-left text-xs transition active:scale-95 sm:text-sm",
                      card.marked[index]
                        ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-deep)]"
                        : "border-[var(--line)] bg-[var(--bg-elevated)]/80 hover:border-[var(--accent)]"
                    )}
                  >
                    {cell}
                  </button>
                ))}
              </div>
            </FadeIn>
          ) : (
            <p className="text-[var(--ink-muted)]">Deal a card for an upcoming event.</p>
          )}
        </>
      )}
    </div>
  );
}
