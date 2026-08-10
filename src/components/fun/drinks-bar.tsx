"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, Clock3, GlassWater, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion/reveal";
import {
  BACHELOR_DRINKS,
  DRINK_CATEGORIES,
  filterDrinks,
  type DrinkCategory,
  type DrinkRecipe,
} from "@/lib/fun/drinks";
import { duration, easeOut } from "@/lib/motion";
import { cn } from "@/lib/utils";

function RecipeCard({ drink }: { drink: DrinkRecipe }) {
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();

  return (
    <article className="interactive-glow overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--bg-elevated)]/70 backdrop-blur-sm">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-start justify-between gap-3 px-5 py-4 text-left transition active:scale-[0.99]"
        aria-expanded={open}
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-medium">{drink.name}</h2>
            <Badge className="bg-[var(--bg)] text-[var(--ink-muted)]">
              no gear
            </Badge>
          </div>
          <p className="mt-1 text-sm text-[var(--ink-muted)]">{drink.tagline}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[var(--ink-muted)]">
            <span className="inline-flex items-center gap-1">
              <Clock3 className="h-3.5 w-3.5" />
              {drink.minutes} min
            </span>
            <span>{drink.servings}</span>
          </div>
        </div>
        <span
          className={cn(
            "mt-1 rounded-lg border border-[var(--line)] bg-[var(--bg)]/80 p-1.5 transition-transform duration-200",
            open && "rotate-180"
          )}
        >
          <ChevronDown className="h-4 w-4" />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="body"
            initial={reduced ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduced ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: duration.base, ease: easeOut }}
            className="overflow-hidden"
          >
            <div className="space-y-5 border-t border-[var(--line)] px-5 py-5">
              <div>
                <h3 className="text-sm font-medium text-[var(--accent-deep)]">
                  Ingredients
                </h3>
                <ul className="mt-2 space-y-1.5 text-sm text-[var(--ink)]">
                  {drink.ingredients.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--accent)]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-medium text-[var(--accent-deep)]">
                  How to make it
                </h3>
                <ol className="mt-2 space-y-2.5 text-sm">
                  {drink.steps.map((step, index) => (
                    <li key={step} className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-xs font-semibold text-[var(--accent-deep)]">
                        {index + 1}
                      </span>
                      <span className="pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {drink.tips.length > 0 ? (
                <div className="rounded-xl bg-[var(--accent-soft)]/50 px-4 py-3">
                  <h3 className="text-sm font-medium text-[var(--accent-deep)]">
                    Bachelor tips
                  </h3>
                  <ul className="mt-2 space-y-1 text-sm text-[var(--ink-muted)]">
                    {drink.tips.map((tip) => (
                      <li key={tip}>{tip}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </article>
  );
}

export function DrinksBar() {
  const [category, setCategory] = useState<DrinkCategory | "all">("all");
  const [query, setQuery] = useState("");

  const drinks = useMemo(
    () => filterDrinks(category, query),
    [category, query]
  );

  return (
    <div className="space-y-8">
      <FadeIn>
        <div className="relative overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[linear-gradient(135deg,rgba(31,111,84,0.14),rgba(217,228,239,0.5)_50%,rgba(251,252,249,0.9))] px-6 py-8 shadow-[0_24px_50px_-36px_rgba(20,32,27,0.35)] md:px-10">
          <div className="pointer-events-none absolute -right-8 top-0 h-40 w-40 rounded-full bg-[radial-gradient(circle_at_center,rgba(31,111,84,0.2),transparent_70%)] blur-2xl" />
          <div className="relative max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 text-sm text-[var(--accent-deep)]">
              <GlassWater className="h-4 w-4" />
              Drinks Bar
            </div>
            <h1 className="font-display text-3xl tracking-tight md:text-4xl">
              Bachelor pours
            </h1>
            <p className="mt-3 text-[var(--ink-muted)]">
              Easy drinks you can build in a cup — no shaker, blender, or bar kit.
              Just ice, a spoon, and whatever&apos;s in the fridge.
            </p>
            <p className="mt-2 text-sm text-[var(--ink-muted)]">
              {BACHELOR_DRINKS.length} recipes · cup-only methods
            </p>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.05}>
        <div className="flex flex-col gap-4">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-muted)]" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search vodka, beer, zero-proof…"
              className="pl-10"
              aria-label="Search drinks"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {DRINK_CATEGORIES.map((item) => (
              <Button
                key={item.id}
                size="sm"
                variant={category === item.id ? "default" : "secondary"}
                onClick={() => setCategory(item.id)}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </div>
      </FadeIn>

      {drinks.length === 0 ? (
        <p className="text-[var(--ink-muted)]">
          No drinks match that filter. Try another category or clear the search.
        </p>
      ) : (
        <Stagger className="grid gap-4 lg:grid-cols-2">
          {drinks.map((drink) => (
            <StaggerItem key={drink.id}>
              <RecipeCard drink={drink} />
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </div>
  );
}
