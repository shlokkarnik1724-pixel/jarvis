"use client";

import { useEffect, useState, useTransition } from "react";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { labGet, labPost } from "@/lib/lab/client";
import { toast } from "@/lib/store/toast-store";
import type { CircleMemberView, VibeCheckView } from "@/lib/types";
import { cn } from "@/lib/utils";

type VibePayload = {
  vibes: VibeCheckView[];
  presets: Array<{ emoji: string; label: string }>;
  members: CircleMemberView[];
};

export function VibeCheckClient() {
  const [data, setData] = useState<VibePayload | null>(null);
  const [pending, startTransition] = useTransition();

  function load() {
    startTransition(async () => {
      try {
        setData(await labGet<VibePayload>("vibes"));
      } catch (error) {
        toast("Couldn’t load vibes", {
          description: error instanceof Error ? error.message : undefined,
          tone: "error",
        });
      }
    });
  }

  useEffect(() => {
    load();
  }, []);

  function setVibe(emoji: string, label: string) {
    startTransition(async () => {
      try {
        await labPost({ feature: "vibes", action: "set", emoji, label });
        toast("Vibe set", { description: `${emoji} ${label}`, tone: "success" });
        setData(await labGet<VibePayload>("vibes"));
      } catch (error) {
        toast("Vibe failed", {
          description: error instanceof Error ? error.message : undefined,
          tone: "error",
        });
      }
    });
  }

  return (
    <div className="space-y-8">
      <FadeIn>
        <h1 className="font-display text-3xl">Vibe Check</h1>
        <p className="mt-2 max-w-xl text-[var(--ink-muted)]">
          One tap. Expires in 24 hours. Shows as an emoji ring on your circle
          avatar.
        </p>
      </FadeIn>

      {!data ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : (
        <>
          <FadeIn delay={0.04}>
            <div className="flex flex-wrap gap-2">
              {data.presets.map((preset) => (
                <Button
                  key={preset.label}
                  size="sm"
                  variant="secondary"
                  disabled={pending}
                  onClick={() => setVibe(preset.emoji, preset.label)}
                >
                  {preset.emoji} {preset.label}
                </Button>
              ))}
            </div>
          </FadeIn>

          <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.members.map((member) => {
              const vibe = data.vibes.find((v) => v.userId === member.userId);
              return (
                <StaggerItem key={member.userId}>
                  <div className="glass-panel flex items-center gap-4 rounded-2xl border border-[var(--line)] p-4">
                    <div
                      className={cn(
                        "relative flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent-soft)] text-lg font-semibold text-[var(--accent-deep)]",
                        vibe && "ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--bg)]"
                      )}
                    >
                      {(member.nickname || member.name).slice(0, 1)}
                      {vibe ? (
                        <span className="absolute -bottom-1 -right-1 text-xl leading-none">
                          {vibe.emoji}
                        </span>
                      ) : null}
                    </div>
                    <div>
                      <p className="font-medium">{member.nickname || member.name}</p>
                      <p className="text-sm text-[var(--ink-muted)]">
                        {vibe ? vibe.label : "no vibe yet"}
                      </p>
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </Stagger>
        </>
      )}
    </div>
  );
}
