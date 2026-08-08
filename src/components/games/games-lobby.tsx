"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { GameSessionView, GameType } from "@/lib/types";

const CATALOG: Array<{ type: GameType; title: string; blurb: string }> = [
  {
    type: "mafia",
    title: "Mafia",
    blurb: "Social deduction with hidden roles and night/day cycles.",
  },
  {
    type: "trivia",
    title: "Trivia",
    blurb: "Custom quiz rounds powered by friend history questions.",
  },
  {
    type: "prediction_league",
    title: "Prediction League",
    blurb: "Bet on everyday outcomes and settle the ledger live.",
  },
  {
    type: "myth_buster",
    title: "Myth Buster",
    blurb: "Fact-check claims about people in the circle.",
  },
];

export function GamesLobby({ initialGames }: { initialGames: GameSessionView[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function createGame(gameType: GameType) {
    startTransition(async () => {
      const response = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameType }),
      });
      const json = (await response.json()) as {
        success: boolean;
        data?: GameSessionView;
      };
      if (json.success && json.data) {
        router.push(`/games/${json.data.gameType}?id=${json.data.id}`);
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl">Games</h1>
        <p className="mt-2 text-[var(--ink-muted)]">
          Real-time lobbies driven by a shared JSON state machine.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        {CATALOG.map((game) => (
          <div key={game.type} className="border-b border-[var(--line)] pb-5">
            <h2 className="text-xl font-medium">{game.title}</h2>
            <p className="mt-2 text-sm text-[var(--ink-muted)]">{game.blurb}</p>
            <Button
              className="mt-4"
              size="sm"
              disabled={pending}
              onClick={() => createGame(game.type)}
            >
              Open lobby
            </Button>
          </div>
        ))}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-medium">Open sessions</h2>
        <ul className="space-y-3">
          {initialGames.map((game) => (
            <li key={game.id}>
              <Link
                href={`/games/${game.gameType}?id=${game.id}`}
                className="flex items-center justify-between border-b border-[var(--line)] py-3 hover:text-[var(--accent-deep)]"
              >
                <span className="capitalize">{game.gameType.replaceAll("_", " ")}</span>
                <Badge>{game.status}</Badge>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
