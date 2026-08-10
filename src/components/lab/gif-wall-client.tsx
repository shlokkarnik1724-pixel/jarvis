"use client";

import { useEffect, useState, useTransition } from "react";
import { IslandCard } from "@/components/islands/island-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { labGet, labPost } from "@/lib/lab/client";
import { toast } from "@/lib/store/toast-store";
import type { GifPinView } from "@/lib/types";

type GifPayload = {
  pins: GifPinView[];
  results: Array<{ id: string; url: string; title: string }>;
};

export function GifWallClient() {
  const [data, setData] = useState<GifPayload | null>(null);
  const [query, setQuery] = useState("friends");
  const [pending, startTransition] = useTransition();

  function loadPins() {
    startTransition(async () => {
      const payload = await labGet<GifPayload>("gifs");
      setData(payload);
    });
  }

  useEffect(() => {
    loadPins();
  }, []);

  function pin(gif: { url: string; title: string }) {
    startTransition(async () => {
      await labPost({ feature: "gifs", action: "pin", url: gif.url, title: gif.title });
      toast("Pinned to GIF Wall", { tone: "success" });
      loadPins();
    });
  }

  function search() {
    startTransition(async () => {
      const results = await labPost<Array<{ id: string; url: string; title: string }>>({
        feature: "gifs",
        action: "search",
        q: query,
      });
      setData((prev) => (prev ? { ...prev, results } : { pins: [], results }));
    });
  }

  return (
    <div className="space-y-6">
      <IslandCard emoji="🎥" title="GIF Wall" accent="rgba(125, 90, 160, 0.28)">
        <p className="text-sm text-[var(--ink-muted)]">
          Search GIPHY (or demo pack) and pin reaction GIFs like a corkboard.
        </p>
      </IslandCard>

      <div className="flex max-w-lg gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search GIFs…"
        />
        <Button disabled={pending} onClick={search}>
          Search
        </Button>
      </div>

      <section>
        <h2 className="mb-3 font-island text-lg font-bold">Pinned</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(data?.pins ?? []).map((pinItem) => (
            <figure
              key={pinItem.id}
              className="overflow-hidden rounded-2xl border border-white/40 bg-white/25 p-2 backdrop-blur-xl"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={pinItem.url}
                alt={pinItem.title}
                className="h-40 w-full rounded-xl object-cover"
              />
              <figcaption className="mt-2 px-1 text-xs text-[var(--ink-muted)]">
                {pinItem.title} · {pinItem.pinnedByName}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-island text-lg font-bold">Search results</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(data?.results ?? []).map((gif) => (
            <button
              key={gif.id}
              type="button"
              disabled={pending}
              onClick={() => pin(gif)}
              className="overflow-hidden rounded-2xl border border-white/40 bg-white/25 p-2 text-left backdrop-blur-xl transition active:scale-95"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={gif.url}
                alt={gif.title}
                className="h-40 w-full rounded-xl object-cover"
              />
              <p className="mt-2 truncate px-1 text-xs">{gif.title}</p>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
