"use client";

import { useEffect, useState, useTransition } from "react";
import { FadeIn } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { SYMPTOM_REMEDIES } from "@/lib/lab/logic";
import { labGet, labPost } from "@/lib/lab/client";
import { toast } from "@/lib/store/toast-store";
import type { EventView, RecoveryPlanView, WellnessStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

type RecoveryPayload = {
  plans: RecoveryPlanView[];
  events: EventView[];
};

export function RecoveryClient() {
  const [data, setData] = useState<RecoveryPayload | null>(null);
  const [plan, setPlan] = useState<RecoveryPlanView | null>(null);
  const [drinkCount, setDrinkCount] = useState("5");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const payload = await labGet<RecoveryPayload>("recovery");
      setData(payload);
      setPlan(payload.plans[0] ?? null);
    });
  }, []);

  function start(eventId: string) {
    startTransition(async () => {
      const next = await labPost<RecoveryPlanView>({
        feature: "recovery",
        action: "start",
        eventId,
        drinkCount: Number(drinkCount) || 5,
      });
      setPlan(next);
      toast("Recovery plan ready", {
        description: `${next.severity} night protocol`,
        tone: "info",
      });
    });
  }

  function update(payload: Record<string, unknown>) {
    if (!plan) return;
    startTransition(async () => {
      const result = await labPost<{ plan: RecoveryPlanView; alert?: string }>({
        feature: "recovery",
        action: "update",
        planId: plan.id,
        ...payload,
      });
      setPlan(result.plan);
      if (result.alert) {
        toast("SOS sent", { description: result.alert, tone: "info" });
      }
    });
  }

  function toggleSymptom(symptom: string) {
    if (!plan) return;
    const next = plan.symptoms.includes(symptom)
      ? plan.symptoms.filter((s) => s !== symptom)
      : [...plan.symptoms, symptom];
    update({ symptoms: next });
  }

  return (
    <div className="space-y-8">
      <FadeIn>
        <h1 className="font-display text-3xl">Hangover Recovery Planner</h1>
        <p className="mt-2 max-w-2xl text-[var(--ink-muted)]">
          Morning-after checklist, symptom remedies, wellness SOS, hydration
          streaks, and a shared recovery kit list.
        </p>
      </FadeIn>

      {!data ? (
        <Skeleton className="h-40 w-full" />
      ) : (
        <>
          <section className="glass-panel space-y-3 rounded-2xl border border-[var(--line)] p-5">
            <div className="max-w-xs">
              <Label htmlFor="drinks">Rough drink count (severity scaler)</Label>
              <Input
                id="drinks"
                className="mt-1"
                inputMode="numeric"
                value={drinkCount}
                onChange={(e) => setDrinkCount(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {data.events.map((event) => (
                <Button
                  key={event.id}
                  size="sm"
                  variant="secondary"
                  disabled={pending}
                  onClick={() => start(event.id)}
                >
                  Plan for {event.title}
                </Button>
              ))}
            </div>
            <Button
              size="sm"
              variant="ghost"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await labPost({ feature: "recovery", action: "mom" });
                  toast("You’re the mom friend now", { tone: "success" });
                })
              }
            >
              Opt in as mom friend
            </Button>
          </section>

          {plan ? (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-medium">{plan.eventTitle}</h2>
                <Badge pulse>{plan.severity}</Badge>
                <Badge className="bg-[var(--bg)] text-[var(--ink-muted)]">
                  drinks≈{plan.drinkCount}
                </Badge>
              </div>

              <section className="space-y-3">
                <h3 className="font-medium">Recovery checklist</h3>
                {plan.tasks.map((task, index) => (
                  <button
                    key={task.text}
                    type="button"
                    disabled={pending}
                    onClick={() => update({ taskIndex: index })}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition active:scale-[0.99]",
                      task.done
                        ? "border-[var(--ok)]/30 bg-[var(--ok-soft)]/70"
                        : "border-[var(--line)] bg-[var(--bg-elevated)]/70"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-md border text-xs",
                        task.done
                          ? "border-[var(--ok)] bg-[var(--ok)] text-white"
                          : "border-[var(--line)]"
                      )}
                    >
                      {task.done ? "✓" : ""}
                    </span>
                    {task.text}
                  </button>
                ))}
              </section>

              <section className="space-y-3">
                <h3 className="font-medium">Symptom → remedy</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(SYMPTOM_REMEDIES).map((symptom) => (
                    <Button
                      key={symptom}
                      size="sm"
                      variant={plan.symptoms.includes(symptom) ? "default" : "secondary"}
                      disabled={pending}
                      onClick={() => toggleSymptom(symptom)}
                    >
                      {symptom}
                    </Button>
                  ))}
                </div>
                <ul className="space-y-2 text-sm text-[var(--ink-muted)]">
                  {plan.remedies.map((tip) => (
                    <li key={tip}>• {tip}</li>
                  ))}
                </ul>
              </section>

              <section className="space-y-3">
                <h3 className="font-medium">Wellness check-in</h3>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      ["fine", "Fine"],
                      ["rough", "Rough"],
                      ["help", "Need help"],
                    ] as Array<[WellnessStatus, string]>
                  ).map(([status, label]) => (
                    <Button
                      key={status}
                      size="sm"
                      variant={plan.wellness === status ? "default" : "secondary"}
                      disabled={pending}
                      onClick={() => update({ wellness: status })}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="font-medium">Hydration streak</h3>
                <p className="text-sm text-[var(--ink-muted)]">
                  {plan.hydrationGlasses} glasses · streak {plan.hydrationStreak}
                  {" "}(every 6 glasses = Hydration Hero points)
                </p>
                <Button size="sm" disabled={pending} onClick={() => update({ logWater: true })}>
                  Log a glass
                </Button>
              </section>

              <section className="space-y-3">
                <h3 className="font-medium">Recovery kit grocery list</h3>
                {plan.kit.map((item, index) => (
                  <button
                    key={item.name}
                    type="button"
                    disabled={pending}
                    onClick={() => update({ kitIndex: index })}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm",
                      item.bought
                        ? "border-[var(--ok)]/30 bg-[var(--ok-soft)]/60"
                        : "border-[var(--line)]"
                    )}
                  >
                    <span>
                      {item.name} × {item.qty}
                    </span>
                    <span>{item.bought ? "bought" : "need"}</span>
                  </button>
                ))}
              </section>
            </div>
          ) : (
            <p className="text-[var(--ink-muted)]">
              Start a plan from an event to unlock the morning-after toolkit.
            </p>
          )}
        </>
      )}
    </div>
  );
}
