"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { IslandCard } from "@/components/islands/island-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DEMO_GIFS, GIF_PACK_FILTERS } from "@/lib/lab/islands-extra";
import { labGet, labPost } from "@/lib/lab/client";
import { toast } from "@/lib/store/toast-store";
import type { GifPinView } from "@/lib/types";
import { cn } from "@/lib/utils";

type GifResult = { id: string; url: string; title: string; tags?: string[] };

type GifPayload = {
  pins: GifPinView[];
  results: GifResult[];
};

export function GifWallClient() {
  const [data, setData] = useState<GifPayload | null>(null);
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<string>("all");
  const [pending, startTransition] = useTransition();

  const pack = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DEMO_GIFS.filter((gif) => {
      const tagOk = tag === "all" || gif.tags.includes(tag as never);
      if (!tagOk) return false;
      if (!q) return true;
      return [gif.title, gif.id, ...gif.tags].join(" ").toLowerCase().includes(q);
    });
  }, [query, tag]);

  function loadPins() {
    startTransition(async () => {
      const payload = await labGet<GifPayload>("gifs");
      setData(payload);
    });
  }

  useEffect(() => {
    loadPins();
    startTransition(async () => {
      const results = await labPost<GifResult[]>({
        feature: "gifs",
        action: "search",
        q: "",
        tag: "all",
      });
      setData((prev) => ({ pins: prev?.pins ?? [], results }));
    });
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
      const results = await labPost<GifResult[]>({
        feature: "gifs",
        action: "search",
        q: query,
        tag,
      });
      setData((prev) => (prev ? { ...prev, results } : { pins: [], results }));
    });
  }

  return (
    <div className="space-y-6">
      <IslandCard emoji="🎥" title="GIF Wall" accent="rgba(125, 90, 160, 0.28)" pulse>
        <p className="text-sm text-[var(--ink-muted)]">
          Funny adult hangout pack — party, tipsy, hangover, flirty, roasts, and
          unhinged reactions. PG-13 comedy, pin whatever fits the night.
        </p>
        <Badge className="mt-3 bg-white/50 text-[var(--ink-muted)]">
          {DEMO_GIFS.length} curated gifs loaded
        </Badge>
      </IslandCard>

      <div className="flex flex-wrap gap-2">
        {GIF_PACK_FILTERS.map((filter) => (
          <Button
            key={filter.id}
            size="sm"
            variant={tag === filter.id ? "default" : "secondary"}
            onClick={() => setTag(filter.id)}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      <div className="flex max-w-lg gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tipsy, hangover, roast…"
          onKeyDown={(e) => {
            if (e.key === "Enter") search();
          }}
        />
        <Button disabled={pending} onClick={search}>
          Search
        </Button>
      </div>

      <section>
        <h2 className="mb-3 font-island text-lg font-bold">
          Funny adult pack ({pack.length})
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {pack.map((gif) => (
            <button
              key={gif.id}
              type="button"
              disabled={pending}
              onClick={() => pin(gif)}
              className={cn(
                "overflow-hidden rounded-2xl border border-white/40 bg-white/25 p-2 text-left backdrop-blur-xl transition active:scale-95",
                "hover:border-[var(--accent)] hover:shadow-[0_12px_28px_-18px_rgba(31,111,84,0.45)]"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={gif.url}
                alt={gif.title}
                className="h-40 w-full rounded-xl object-cover"
                loading="lazy"
              />
              <p className="mt-2 truncate px-1 text-xs font-medium">{gif.title}</p>
              <p className="truncate px-1 text-[10px] text-[var(--ink-muted)]">
                {gif.tags.join(" · ")}
              </p>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-island text-lg font-bold">Pinned corkboard</h2>
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

      {(data?.results?.length ?? 0) > 0 ? (
        <section>
          <h2 className="mb-3 font-island text-lg font-bold">Search results</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data!.results.map((gif) => (
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
                  loading="lazy"
                />
                <p className="mt-2 truncate px-1 text-xs">{gif.title}</p>
              </button>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
