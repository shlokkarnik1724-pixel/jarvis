"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion/reveal";
import { toast } from "@/lib/store/toast-store";
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
        toast("Lobby opened", {
          description: `${gameType.replaceAll("_", " ")} is ready.`,
          tone: "success",
        });
        router.push(`/games/${json.data.gameType}?id=${json.data.id}`);
        router.refresh();
        return;
      }
      toast("Couldn’t open lobby", { tone: "error" });
    });
  }

  return (
    <div className="space-y-8">
      <FadeIn>
        <div>
          <h1 className="font-display text-3xl">Games</h1>
          <p className="mt-2 text-[var(--ink-muted)]">
            Real-time lobbies driven by a shared JSON state machine.
          </p>
        </div>
      </FadeIn>

      <Stagger className="grid gap-4 md:grid-cols-2">
        {CATALOG.map((game) => (
          <StaggerItem key={game.type}>
            <div className="interactive-glow rounded-2xl border border-[var(--line)] bg-[var(--bg-elevated)]/60 p-5 backdrop-blur-sm">
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
          </StaggerItem>
        ))}
      </Stagger>

      <FadeIn delay={0.1}>
        <section>
          <h2 className="mb-3 text-lg font-medium">Open sessions</h2>
          <ul className="space-y-3">
            {initialGames.map((game) => (
              <li key={game.id}>
                <Link
                  href={`/games/${game.gameType}?id=${game.id}`}
                  className="interactive-glow flex items-center justify-between rounded-xl border border-transparent border-b-[var(--line)] py-3 hover:border-[var(--line)] hover:bg-[var(--bg-elevated)]/80 hover:px-3 hover:text-[var(--accent-deep)]"
                >
                  <span className="capitalize">
                    {game.gameType.replaceAll("_", " ")}
                  </span>
                  <Badge pulse={game.status === "active" || game.status === "lobby"}>
                    {game.status}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </FadeIn>
    </div>
  );
}
