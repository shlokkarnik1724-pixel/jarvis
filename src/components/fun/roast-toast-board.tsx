"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion/reveal";
import { toast } from "@/lib/store/toast-store";
import { duration, easeOut } from "@/lib/motion";
import type { RoastToastView } from "@/lib/types";

export function RoastToastBoard({
  initialItems,
}: {
  initialItems: RoastToastView[];
}) {
  const [items, setItems] = useState(initialItems);
  const [kind, setKind] = useState<"roast" | "toast">("toast");
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();
  const reduced = useReducedMotion();

  function submit() {
    startTransition(async () => {
      const response = await fetch("/api/roast-toast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, body }),
      });
      const json = (await response.json()) as {
        success: boolean;
        data?: RoastToastView;
      };
      if (json.success && json.data) {
        setItems((prev) => [json.data!, ...prev]);
        setBody("");
        toast(kind === "toast" ? "Toast posted" : "Roast posted", {
          description: "Submitted anonymously.",
          tone: "success",
        });
        return;
      }
      toast("Couldn’t post", { tone: "error" });
    });
  }

  function vote(id: string, value: number) {
    startTransition(async () => {
      const response = await fetch("/api/roast-toast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, vote: value }),
      });
      const json = (await response.json()) as {
        success: boolean;
        data?: RoastToastView;
      };
      if (json.success && json.data) {
        setItems((prev) => prev.map((item) => (item.id === id ? json.data! : item)));
      }
    });
  }

  return (
    <div className="space-y-8">
      <FadeIn>
        <div>
          <h1 className="font-display text-3xl">Roast & Toast</h1>
          <p className="mt-2 max-w-xl text-[var(--ink-muted)]">
            Anonymous submissions — author identity is stripped before persistence.
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={0.05}>
        <section className="glass-panel space-y-3 rounded-2xl border border-[var(--line)] p-5">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={kind === "toast" ? "default" : "secondary"}
              onClick={() => setKind("toast")}
            >
              Toast
            </Button>
            <Button
              size="sm"
              variant={kind === "roast" ? "default" : "secondary"}
              onClick={() => setKind("roast")}
            >
              Roast
            </Button>
          </div>
          <Textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder={
              kind === "toast"
                ? "Raise a glass to someone in the circle…"
                : "Keep it playful. Keep it kind-adjacent…"
            }
          />
          <Button onClick={submit} disabled={pending || !body.trim()}>
            Submit anonymously
          </Button>
        </section>
      </FadeIn>

      <Stagger className="space-y-5">
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <StaggerItem key={item.id}>
              <motion.li
                layout={!reduced}
                initial={reduced ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? undefined : { opacity: 0, y: -6 }}
                transition={{ duration: duration.fast, ease: easeOut }}
                className="interactive-glow list-none rounded-2xl border border-transparent border-b-[var(--line)] pb-5 hover:border-[var(--line)] hover:bg-[var(--bg-elevated)]/70 hover:px-4 hover:py-4"
              >
                <div className="mb-2 flex items-center gap-2">
                  <Badge
                    pulse
                    className={
                      item.kind === "toast"
                        ? "bg-[var(--ok-soft)] text-[var(--ok)]"
                        : "bg-[var(--warn-soft)] text-[var(--warn)]"
                    }
                  >
                    {item.kind}
                  </Badge>
                  <span className="text-sm text-[var(--ink-muted)]">
                    {item.voteScore} votes
                  </span>
                </div>
                <p className="text-lg">{item.body}</p>
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={pending}
                    onClick={() => vote(item.id, 1)}
                  >
                    Up
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={pending}
                    onClick={() => vote(item.id, -1)}
                  >
                    Down
                  </Button>
                </div>
              </motion.li>
            </StaggerItem>
          ))}
        </AnimatePresence>
      </Stagger>
    </div>
  );
}
