"use client";

import { useEffect, useState, useTransition } from "react";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { labGet, labPost } from "@/lib/lab/client";
import { toast } from "@/lib/store/toast-store";
import type { CircleMemberView, MostLikelyPollView } from "@/lib/types";

type PollsPayload = {
  polls: MostLikelyPollView[];
  legends: Array<{ userId: string; name: string; score: number }>;
  members: CircleMemberView[];
};

export function MostLikelyClient() {
  const [data, setData] = useState<PollsPayload | null>(null);
  const [prompt, setPrompt] = useState("");
  const [pending, startTransition] = useTransition();

  function load() {
    startTransition(async () => {
      setData(await labGet<PollsPayload>("polls"));
    });
  }

  useEffect(() => {
    load();
  }, []);

  function create() {
    startTransition(async () => {
      try {
        await labPost({ feature: "polls", action: "create", prompt });
        setPrompt("");
        toast("Poll opened", { description: "Closes in 24 hours.", tone: "success" });
        setData(await labGet<PollsPayload>("polls"));
      } catch (error) {
        toast("Couldn’t create poll", {
          description: error instanceof Error ? error.message : undefined,
          tone: "error",
        });
      }
    });
  }

  function vote(pollId: string, votedForUserId: string) {
    startTransition(async () => {
      await labPost({ feature: "polls", action: "vote", pollId, votedForUserId });
      setData(await labGet<PollsPayload>("polls"));
    });
  }

  return (
    <div className="space-y-8">
      <FadeIn>
        <h1 className="font-display text-3xl">Who’s Most Likely To</h1>
        <p className="mt-2 text-[var(--ink-muted)]">
          Post a prompt, vote a member, rack Circle Legends wins.
        </p>
      </FadeIn>

      <FadeIn delay={0.04}>
        <section className="glass-panel flex flex-col gap-3 rounded-2xl border border-[var(--line)] p-5 sm:flex-row">
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="who’s most likely to no-show…"
          />
          <Button disabled={pending || !prompt.trim()} onClick={create}>
            Open 24h poll
          </Button>
        </section>
      </FadeIn>

      {!data ? (
        <Skeleton className="h-32 w-full" />
      ) : (
        <>
          <FadeIn delay={0.06}>
            <h2 className="mb-3 text-lg font-medium">Circle Legends</h2>
            <div className="flex flex-wrap gap-2">
              {data.legends.map((row, i) => (
                <Badge key={row.userId} pulse={i === 0}>
                  {row.name}: {row.score}
                </Badge>
              ))}
            </div>
          </FadeIn>

          <Stagger className="space-y-5">
            {data.polls.map((poll) => (
              <StaggerItem key={poll.id}>
                <article className="rounded-2xl border border-[var(--line)] bg-[var(--bg-elevated)]/70 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-medium">{poll.prompt}</h3>
                      <p className="mt-1 text-xs text-[var(--ink-muted)]">
                        by {poll.createdByName} ·{" "}
                        {poll.closed ? "closed" : `closes ${new Date(poll.closesAt).toLocaleString()}`}
                      </p>
                    </div>
                    {poll.closed && poll.winnerUserId ? (
                      <Badge pulse>
                        winner:{" "}
                        {poll.tallies.find((t) => t.userId === poll.winnerUserId)?.name}
                      </Badge>
                    ) : null}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {data.members.map((member) => {
                      const tally =
                        poll.tallies.find((t) => t.userId === member.userId)?.votes ?? 0;
                      const selected = poll.myVoteUserId === member.userId;
                      return (
                        <Button
                          key={member.userId}
                          size="sm"
                          variant={selected ? "default" : "secondary"}
                          disabled={pending || poll.closed}
                          onClick={() => vote(poll.id, member.userId)}
                        >
                          {member.nickname || member.name} ({tally})
                        </Button>
                      );
                    })}
                  </div>
                </article>
              </StaggerItem>
            ))}
          </Stagger>
        </>
      )}
    </div>
  );
}
