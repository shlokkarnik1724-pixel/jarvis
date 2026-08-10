"use client";

import { useEffect, useState, useTransition } from "react";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { labGet, labPost } from "@/lib/lab/client";
import { toast } from "@/lib/store/toast-store";
import type { ConfessionView } from "@/lib/types";

export function ConfessionsClient() {
  const [items, setItems] = useState<ConfessionView[] | null>(null);
  const [text, setText] = useState("");
  const [pending, startTransition] = useTransition();

  function load() {
    startTransition(async () => {
      setItems(await labGet<ConfessionView[]>("confessions"));
    });
  }

  useEffect(() => {
    load();
  }, []);

  function submit() {
    startTransition(async () => {
      try {
        await labPost({ feature: "confessions", action: "add", text });
        setText("");
        toast("Posted anonymously", { tone: "success" });
        setItems(await labGet<ConfessionView[]>("confessions"));
      } catch (error) {
        toast("Couldn’t post", {
          description: error instanceof Error ? error.message : undefined,
          tone: "error",
        });
      }
    });
  }

  function react(confessionId: string, reaction: "fire" | "skull") {
    startTransition(async () => {
      const updated = await labPost<ConfessionView>({
        feature: "confessions",
        action: "react",
        confessionId,
        reaction,
      });
      setItems((prev) =>
        prev ? prev.map((item) => (item.id === updated.id ? updated : item)) : prev
      );
    });
  }

  return (
    <div className="space-y-8">
      <FadeIn>
        <h1 className="font-display text-3xl">Confession Wall</h1>
        <p className="mt-2 max-w-xl text-[var(--ink-muted)]">
          Anonymous inside the group. Author identity is not stored on the post —
          rate limits use a separate cooldown.
        </p>
      </FadeIn>

      <FadeIn delay={0.04}>
        <section className="glass-panel space-y-3 rounded-2xl border border-[var(--line)] p-5">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Say the quiet part out loud…"
          />
          <Button disabled={pending || !text.trim()} onClick={submit}>
            Post anonymously
          </Button>
        </section>
      </FadeIn>

      {!items ? (
        <Skeleton className="h-28 w-full" />
      ) : (
        <Stagger className="space-y-4">
          {items.map((item) => (
            <StaggerItem key={item.id}>
              <article className="rounded-2xl border border-[var(--line)] bg-[var(--bg-elevated)]/70 p-5">
                <p className="text-lg">{item.text}</p>
                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    variant={item.myReaction === "fire" ? "default" : "secondary"}
                    disabled={pending}
                    onClick={() => react(item.id, "fire")}
                  >
                    🔥 {item.reactions.fire}
                  </Button>
                  <Button
                    size="sm"
                    variant={item.myReaction === "skull" ? "default" : "secondary"}
                    disabled={pending}
                    onClick={() => react(item.id, "skull")}
                  >
                    💀 {item.reactions.skull}
                  </Button>
                </div>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </div>
  );
}
