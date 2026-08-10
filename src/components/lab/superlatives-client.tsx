"use client";

import { useEffect, useState, useTransition } from "react";
import { IslandCard } from "@/components/islands/island-card";
import { labGet } from "@/lib/lab/client";
import type { SuperlativeView } from "@/lib/types";

export function SuperlativesClient() {
  const [items, setItems] = useState<SuperlativeView[] | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      setItems(await labGet<SuperlativeView[]>("superlatives"));
    });
  }, []);

  return (
    <div className="space-y-6">
      <IslandCard emoji="👑" title="Superlatives" accent="rgba(240, 194, 122, 0.4)">
        <p className="text-sm text-[var(--ink-muted)]">
          End-of-event style awards auto-generated from Circle Currency activity.
        </p>
      </IslandCard>

      <div className="grid gap-4 md:grid-cols-2">
        {(items ?? []).map((item) => (
          <article
            key={`${item.title}-${item.userId}`}
            className="rounded-[1.5rem] border border-white/40 bg-white/30 p-5 backdrop-blur-xl"
          >
            <p className="text-3xl">{item.emoji}</p>
            <h2 className="mt-2 font-island text-xl font-bold">{item.title}</h2>
            <p className="mt-1 text-lg font-medium text-[var(--accent-deep)]">{item.name}</p>
            <p className="mt-2 text-sm text-[var(--ink-muted)]">{item.reason}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
