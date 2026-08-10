"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { labGet, labPost } from "@/lib/lab/client";
import { toast } from "@/lib/store/toast-store";
import type { InsideJokeView } from "@/lib/types";

export function JokesClient() {
  const [jokes, setJokes] = useState<InsideJokeView[] | null>(null);
  const [term, setTerm] = useState("");
  const [definition, setDefinition] = useState("");
  const [query, setQuery] = useState("");
  const [pending, startTransition] = useTransition();

  function load() {
    startTransition(async () => {
      setJokes(await labGet<InsideJokeView[]>("jokes"));
    });
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!jokes) return [];
    const q = query.trim().toLowerCase();
    if (!q) return jokes;
    return jokes.filter(
      (j) =>
        j.term.toLowerCase().includes(q) ||
        j.definition.toLowerCase().includes(q)
    );
  }, [jokes, query]);

  function add() {
    startTransition(async () => {
      try {
        await labPost({ feature: "jokes", action: "add", term, definition });
        setTerm("");
        setDefinition("");
        toast("Joke logged", { tone: "success" });
        setJokes(await labGet<InsideJokeView[]>("jokes"));
      } catch (error) {
        toast("Couldn’t add joke", {
          description: error instanceof Error ? error.message : undefined,
          tone: "error",
        });
      }
    });
  }

  function bump(jokeId: string) {
    startTransition(async () => {
      const updated = await labPost<InsideJokeView>({
        feature: "jokes",
        action: "bump",
        jokeId,
      });
      setJokes((prev) =>
        prev
          ? [...prev.map((j) => (j.id === updated.id ? updated : j))].sort(
              (a, b) => b.usageCount - a.usageCount
            )
          : prev
      );
    });
  }

  return (
    <div className="space-y-8">
      <FadeIn>
        <h1 className="font-display text-3xl">Inside Joke Dictionary</h1>
        <p className="mt-2 text-[var(--ink-muted)]">
          Circle slang, searchable. Tap “same 😂” to bump usage.
        </p>
      </FadeIn>

      <FadeIn delay={0.04}>
        <section className="glass-panel space-y-3 rounded-2xl border border-[var(--line)] p-5">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <Label htmlFor="term">Term</Label>
              <Input
                id="term"
                className="mt-1"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="orbit protocol"
              />
            </div>
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                className="mt-1"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter dictionary…"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="definition">Definition</Label>
            <Textarea
              id="definition"
              className="mt-1"
              value={definition}
              onChange={(e) => setDefinition(e.target.value)}
              placeholder="What does it mean in this circle?"
            />
          </div>
          <Button disabled={pending || !term.trim() || !definition.trim()} onClick={add}>
            Add to dictionary
          </Button>
        </section>
      </FadeIn>

      {!jokes ? (
        <Skeleton className="h-24 w-full" />
      ) : (
        <Stagger className="space-y-4">
          {filtered.map((joke, index) => (
            <StaggerItem key={joke.id}>
              <article className="interactive-glow rounded-2xl border border-[var(--line)] bg-[var(--bg-elevated)]/70 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-medium">{joke.term}</h2>
                    <p className="mt-1 text-[var(--ink-muted)]">{joke.definition}</p>
                    <p className="mt-2 text-xs text-[var(--ink-muted)]">
                      added by {joke.addedByName}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {index < 5 ? <Badge pulse>Top slang</Badge> : null}
                    <Badge className="bg-[var(--bg)] text-[var(--ink-muted)]">
                      {joke.usageCount} uses
                    </Badge>
                    <Button size="sm" variant="secondary" disabled={pending} onClick={() => bump(joke.id)}>
                      same 😂
                    </Button>
                  </div>
                </div>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </div>
  );
}
