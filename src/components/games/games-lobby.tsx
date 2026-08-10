"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion/reveal";
import { playSound } from "@/lib/sound/sfx";
import { toast } from "@/lib/store/toast-store";
import type { GameSessionView, GameType } from "@/lib/types";

const CATALOG: Array<{
  type: GameType;
  title: string;
  blurb: string;
  emoji: string;
  accent: string;
}> = [
  {
    type: "mafia",
    title: "Mafia",
    blurb: "Social deduction. Accuse. Survive the night.",
    emoji: "🕵️",
    accent: "from-[#2a1414] to-[#5a2a2a]",
  },
  {
    type: "trivia",
    title: "Trivia",
    blurb: "Roast-level questions about your own circle.",
    emoji: "🧠",
    accent: "from-[#14242a] to-[#2a4a5a]",
  },
  {
    type: "prediction_league",
    title: "Prediction League",
    blurb: "Bet ₹ vibes on who ghosts / who shows.",
    emoji: "🎯",
    accent: "from-[#1a2414] to-[#3a5a2a]",
  },
  {
    type: "myth_buster",
    title: "Myth Buster",
    blurb: "Fact-check the wildest circle rumors live.",
    emoji: "💥",
    accent: "from-[#241a10] to-[#5a3a1a]",
  },
];

export function GamesLobby({ initialGames }: { initialGames: GameSessionView[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const reduced = useReducedMotion();

  function createGame(gameType: GameType) {
    startTransition(async () => {
      playSound("gameStart");
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
      playSound("wrong");
      toast("Couldn’t open lobby", { tone: "error" });
    });
  }

  return (
    <div className="space-y-8">
      <FadeIn>
        <div>
          <h1 className="font-display text-3xl">Game Night</h1>
          <p className="mt-2 text-[var(--ink-muted)]">
            Tap a card — lobbies pop with motion, haptics-feel taps, and chaos energy.
          </p>
        </div>
      </FadeIn>

      <Stagger className="grid gap-3 sm:grid-cols-2">
        {CATALOG.map((game, index) => (
          <StaggerItem key={game.type}>
            <motion.button
              type="button"
              disabled={pending}
              onClick={() => createGame(game.type)}
              className={`w-full rounded-[1.5rem] border border-white/30 bg-gradient-to-br ${game.accent} p-5 text-left text-white shadow-lg active:scale-[0.98]`}
              whileHover={reduced ? undefined : { y: -4, scale: 1.01 }}
              animate={
                reduced
                  ? undefined
                  : { y: [0, index % 2 === 0 ? -4 : 4, 0] }
              }
              transition={{
                y: { duration: 3.4 + index * 0.2, repeat: Infinity, ease: "easeInOut" },
              }}
            >
              <span className="text-3xl">{game.emoji}</span>
              <h2 className="mt-2 font-island text-2xl font-bold">{game.title}</h2>
              <p className="mt-1 text-sm text-white/80">{game.blurb}</p>
              <span className="mt-4 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wide">
                Open lobby →
              </span>
            </motion.button>
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
                  onClick={() => playSound("tap")}
                  className="interactive-glow flex min-h-12 items-center justify-between rounded-xl border border-transparent border-b-[var(--line)] py-3 hover:border-[var(--line)] hover:bg-[var(--bg-elevated)]/80 hover:px-3 hover:text-[var(--accent-deep)]"
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

      <div className="text-center">
        <Button asChild variant="secondary">
          <Link href="/fun/blackjack" onClick={() => playSound("clink")}>
            🃏 Quick Blackjack table
          </Link>
        </Button>
      </div>
    </div>
  );
}
