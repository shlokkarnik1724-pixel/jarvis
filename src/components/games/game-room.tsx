"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { GameSessionView, GameType } from "@/lib/types";

const VALID: GameType[] = [
  "mafia",
  "trivia",
  "prediction_league",
  "myth_buster",
];

export function GameRoom({
  gameSlug,
  userId,
  userName,
}: {
  gameSlug: string;
  userId: string;
  userName: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gameId = searchParams.get("id");
  const [game, setGame] = useState<GameSessionView | null>(null);
  const [pending, startTransition] = useTransition();
  const [triviaPrompt, setTriviaPrompt] = useState("Who always claims the aux?");
  const [predictionPrompt, setPredictionPrompt] = useState(
    "Will it rain during the next hang?"
  );
  const [mythClaim, setMythClaim] = useState("Has never been late to brunch.");

  const gameType = VALID.includes(gameSlug as GameType)
    ? (gameSlug as GameType)
    : null;

  useEffect(() => {
    if (!gameId) return;
    startTransition(async () => {
      const response = await fetch("/api/games");
      const json = (await response.json()) as {
        success: boolean;
        data?: GameSessionView[];
      };
      if (json.success && json.data) {
        setGame(json.data.find((entry) => entry.id === gameId) ?? null);
      }
    });
  }, [gameId]);

  function act(type: string, payload?: Record<string, unknown>) {
    if (!gameId) return;
    startTransition(async () => {
      const response = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId, action: { type, payload } }),
      });
      const json = (await response.json()) as {
        success: boolean;
        data?: GameSessionView;
      };
      if (json.success && json.data) {
        setGame(json.data);
        router.refresh();
      }
    });
  }

  if (!gameType) {
    return <p className="text-[var(--danger)]">Unknown game type.</p>;
  }

  if (!gameId) {
    return <p className="text-[var(--ink-muted)]">Missing game id.</p>;
  }

  if (!game) {
    return <p className="text-[var(--ink-muted)]">Loading lobby…</p>;
  }

  const state = game.state;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl capitalize">
            {game.gameType.replaceAll("_", " ")}
          </h1>
          <p className="mt-2 text-sm text-[var(--ink-muted)]">Session {game.id.slice(0, 8)}</p>
        </div>
        <Badge>{game.status}</Badge>
      </div>

      {gameType === "mafia" ? (
        <div className="space-y-3">
          <p className="text-sm text-[var(--ink-muted)]">
            Phase: {String(state.phase ?? "lobby")}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              disabled={pending}
              onClick={() => act("join", { userId, name: userName })}
            >
              Join lobby
            </Button>
            <Button size="sm" disabled={pending} onClick={() => act("start")}>
              Start game
            </Button>
            <Button size="sm" variant="secondary" disabled={pending} onClick={() => act("resolve_night")}>
              Resolve night
            </Button>
            <Button size="sm" variant="secondary" disabled={pending} onClick={() => act("resolve_vote")}>
              Resolve vote
            </Button>
          </div>
          <ul className="space-y-1 text-sm text-[var(--ink-muted)]">
            {Array.isArray(state.log)
              ? (state.log as string[]).slice(-8).map((line) => (
                  <li key={line}>{line}</li>
                ))
              : null}
          </ul>
        </div>
      ) : null}

      {gameType === "trivia" ? (
        <div className="space-y-3">
          <Input
            value={triviaPrompt}
            onChange={(event) => setTriviaPrompt(event.target.value)}
          />
          <Button
            size="sm"
            disabled={pending}
            onClick={() =>
              act("load_questions", {
                questions: [
                  {
                    id: "q1",
                    prompt: triviaPrompt,
                    choices: ["Alex", "Jordan", "Sam", "All of them"],
                    answerIndex: 3,
                  },
                ],
              })
            }
          >
            Load question
          </Button>
          <div className="flex flex-wrap gap-2">
            {[0, 1, 2, 3].map((choice) => (
              <Button
                key={choice}
                size="sm"
                variant="secondary"
                disabled={pending}
                onClick={() =>
                  act("answer", { userId, choiceIndex: choice })
                }
              >
                Answer {choice + 1}
              </Button>
            ))}
            <Button size="sm" disabled={pending} onClick={() => act("reveal")}>
              Reveal
            </Button>
          </div>
          <pre className="overflow-auto rounded-xl bg-[var(--bg)] p-4 text-xs">
            {JSON.stringify(state.scores ?? {}, null, 2)}
          </pre>
        </div>
      ) : null}

      {gameType === "prediction_league" ? (
        <div className="space-y-3">
          <Input
            value={predictionPrompt}
            onChange={(event) => setPredictionPrompt(event.target.value)}
          />
          <Button
            size="sm"
            disabled={pending}
            onClick={() =>
              act("open", {
                prompt: predictionPrompt,
                options: ["Yes", "No"],
              })
            }
          >
            Open market
          </Button>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              disabled={pending}
              onClick={() => act("bet", { userId, optionIndex: 0, stake: 10 })}
            >
              Bet Yes (₹10)
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={pending}
              onClick={() => act("bet", { userId, optionIndex: 1, stake: 10 })}
            >
              Bet No (₹10)
            </Button>
            <Button size="sm" disabled={pending} onClick={() => act("settle", { resultIndex: 0 })}>
              Settle Yes
            </Button>
          </div>
          <pre className="overflow-auto rounded-xl bg-[var(--bg)] p-4 text-xs">
            {JSON.stringify(
              { bets: state.bets, payouts: state.payouts, phase: state.phase },
              null,
              2
            )}
          </pre>
        </div>
      ) : null}

      {gameType === "myth_buster" ? (
        <div className="space-y-3">
          <Input
            value={mythClaim}
            onChange={(event) => setMythClaim(event.target.value)}
          />
          <Button
            size="sm"
            disabled={pending}
            onClick={() =>
              act("set_claim", { subjectUserId: userId, claim: mythClaim })
            }
          >
            Post claim
          </Button>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              disabled={pending}
              onClick={() => act("vote", { userId, believesTrue: true })}
            >
              Believe
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={pending}
              onClick={() => act("vote", { userId, believesTrue: false })}
            >
              Bust
            </Button>
            <Button
              size="sm"
              disabled={pending}
              onClick={() => act("reveal", { truth: false })}
            >
              Reveal (false)
            </Button>
          </div>
          <pre className="overflow-auto rounded-xl bg-[var(--bg)] p-4 text-xs">
            {JSON.stringify(
              { claim: state.claim, votes: state.votes, scores: state.scores },
              null,
              2
            )}
          </pre>
        </div>
      ) : null}
    </div>
  );
}
