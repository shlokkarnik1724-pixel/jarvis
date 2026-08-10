"use client";

import { useEffect, useState, useTransition } from "react";
import { IslandCard, ConfettiBurst } from "@/components/islands/island-card";
import { Button } from "@/components/ui/button";
import { partyGet, partyPost } from "@/lib/party/client";
import { toast } from "@/lib/store/toast-store";

type Card = { rank: string; suit: string };

export function BlackjackClient() {
  const [player, setPlayer] = useState<Card[]>([]);
  const [dealer, setDealer] = useState<Card[]>([]);
  const [dealerHidden, setDealerHidden] = useState<Card[]>([]);
  const [playerValue, setPlayerValue] = useState(0);
  const [dealerValue, setDealerValue] = useState<number | null>(null);
  const [wins, setWins] = useState(0);
  const [outcome, setOutcome] = useState<string | null>(null);
  const [burst, setBurst] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const data = await partyGet<{ wins: number }>("blackjack");
      setWins(data.wins);
    });
  }, []);

  function deal() {
    startTransition(async () => {
      const data = await partyPost<{
        player: Card[];
        dealer: Card[];
        dealerHidden: Card[];
        playerValue: number;
        wins: number;
      }>({ feature: "blackjack", action: "deal" });
      setPlayer(data.player);
      setDealer(data.dealer);
      setDealerHidden(data.dealerHidden);
      setPlayerValue(data.playerValue);
      setDealerValue(null);
      setOutcome(null);
      setWins(data.wins);
    });
  }

  function hit() {
    startTransition(async () => {
      const data = await partyPost<{
        player: Card[];
        playerValue: number;
        bust: boolean;
      }>({ feature: "blackjack", action: "hit", player });
      setPlayer(data.player);
      setPlayerValue(data.playerValue);
      if (data.bust) {
        setOutcome("lose");
        toast("Bust", { tone: "error" });
      }
    });
  }

  function stand() {
    startTransition(async () => {
      const data = await partyPost<{
        dealer: Card[];
        playerValue: number;
        dealerValue: number;
        outcome: "win" | "lose" | "push";
        wins: number;
      }>({
        feature: "blackjack",
        action: "stand",
        player,
        dealerHidden,
      });
      setDealer(data.dealer);
      setPlayerValue(data.playerValue);
      setDealerValue(data.dealerValue);
      setOutcome(data.outcome);
      setWins(data.wins);
      if (data.outcome === "win") {
        setBurst(true);
        window.setTimeout(() => setBurst(false), 1200);
        toast("You win", { tone: "success" });
      }
    });
  }

  return (
    <div className="space-y-6">
      <ConfettiBurst show={burst} />
      <IslandCard emoji="🃏" title="Virtual Blackjack" accent="rgba(31,111,84,0.4)">
        <p className="text-sm text-[var(--ink-muted)]">
          Hit / stand mini-game. Wins feed your Circle game tally.
        </p>
        <p className="mt-2 text-sm">Your blackjack wins: <strong>{wins}</strong></p>
      </IslandCard>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/40 bg-white/70 p-4">
          <p className="text-sm text-[var(--ink-muted)]">Dealer {dealerValue ?? ""}</p>
          <p className="mt-2 font-island text-2xl">
            {dealer.map((c) => `${c.rank}${c.suit}`).join("  ")}
          </p>
        </div>
        <div className="rounded-2xl border border-white/40 bg-white/70 p-4">
          <p className="text-sm text-[var(--ink-muted)]">You ({playerValue})</p>
          <p className="mt-2 font-island text-2xl">
            {player.map((c) => `${c.rank}${c.suit}`).join("  ")}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button disabled={pending} onClick={deal}>
          Deal
        </Button>
        <Button
          variant="secondary"
          disabled={pending || player.length === 0 || Boolean(outcome)}
          onClick={hit}
        >
          Hit
        </Button>
        <Button
          variant="secondary"
          disabled={pending || player.length === 0 || Boolean(outcome)}
          onClick={stand}
        >
          Stand
        </Button>
      </div>
      {outcome ? (
        <p className="font-island text-xl font-bold capitalize">{outcome}</p>
      ) : null}
    </div>
  );
}
