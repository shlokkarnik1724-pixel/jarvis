"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
      }
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
      <div>
        <h1 className="font-display text-3xl">Roast & Toast</h1>
        <p className="mt-2 max-w-xl text-[var(--ink-muted)]">
          Anonymous submissions — author identity is stripped before persistence.
        </p>
      </div>

      <section className="space-y-3 border-y border-[var(--line)] py-6">
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

      <ul className="space-y-5">
        {items.map((item) => (
          <li key={item.id} className="border-b border-[var(--line)] pb-5">
            <div className="mb-2 flex items-center gap-2">
              <Badge
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
          </li>
        ))}
      </ul>
    </div>
  );
}
