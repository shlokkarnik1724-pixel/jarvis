import { randomUUID } from "crypto";
import { getLabState } from "@/lib/lab/store";
import { getDemoMembers } from "@/lib/demo/store";

export const DRINK_TIERS = [
  { key: "sober", label: "🧢 Sober Cap", level: 0 },
  { key: "day_drink", label: "☀️ Day Drinking", level: 1 },
  { key: "buzzed", label: "🐝 Buzzed", level: 2 },
  { key: "tipsy", label: "🍸 Tipsy Tipsy", level: 3 },
  { key: "slosh", label: "🌊 Slösh", level: 4 },
  { key: "blackout", label: "🕳️ Blackout Run", level: 5 },
  { key: "gone", label: "👻 Slöst (fully gone)", level: 6 },
] as const;

export type DrinkTierKey = (typeof DRINK_TIERS)[number]["key"];

export const FLAG_TYPES = [
  "🚩 texted an ex",
  "🚩 disappeared for an hour",
  "🚩 spilled a drink on purpose",
  "🚩 aux cord tyranny",
  "🟢 green flag: bought a round",
  "🟢 green flag: designated driver",
  "🟢 green flag: hydrated a friend",
] as const;

type PartyState = {
  drinkTiers: Record<string, { tierKey: DrinkTierKey; ts: string; name: string }>;
  flags: Array<{
    id: string;
    targetName: string;
    targetId: string;
    flaggerName: string;
    flagType: string;
    ts: string;
  }>;
  regrets: Array<{
    id: string;
    userId: string;
    name: string;
    score: number;
    label: string;
    ts: string;
  }>;
  vibeVotes: Array<{ userId: string; name: string; score: number; ts: string }>;
  attendance: Array<{
    id: string;
    userId: string;
    name: string;
    action: "in" | "out";
    photoDataUrl: string | null;
    ts: string;
  }>;
  ddUserId: string | null;
  blackjackWins: Record<string, number>;
};

function partyBucket(circleId: string): PartyState {
  const state = getLabState(circleId) as ReturnType<typeof getLabState> & {
    party?: PartyState;
  };
  if (!state.party) {
    state.party = {
      drinkTiers: {},
      flags: [],
      regrets: [],
      vibeVotes: [],
      attendance: [],
      ddUserId: null,
      blackjackWins: {},
    };
  }
  return state.party;
}

export function getBrokeTitle(balance: number): string {
  if (balance > 500) return "🤑 Top G";
  if (balance > 0) return "💰 Certified Baller";
  if (balance === 0) return "😐 Even Steven";
  if (balance > -300) return "🥲 Lowkey Broke";
  return "💀 Certified Broke Menace";
}

export function regretLabel(score: number): string {
  if (score <= 20) return "no regrets";
  if (score <= 40) return "mild cringe";
  if (score <= 60) return "send help";
  if (score <= 80) return "delete the night";
  return "witness protection";
}

export function listDrinkTiers(circleId: string) {
  const party = partyBucket(circleId);
  const members = getDemoMembers();
  return members.map((m) => {
    const tier = party.drinkTiers[m.userId];
    const meta = DRINK_TIERS.find((t) => t.key === tier?.tierKey) ?? DRINK_TIERS[0];
    return {
      userId: m.userId,
      name: m.nickname || m.name,
      tierKey: meta.key,
      label: meta.label,
      level: meta.level,
      isDD: party.ddUserId === m.userId,
    };
  });
}

export function setDrinkTier(input: {
  circleId: string;
  userId: string;
  name: string;
  tierKey: DrinkTierKey;
}) {
  const party = partyBucket(input.circleId);
  if (party.ddUserId === input.userId && input.tierKey !== "sober") {
    return { error: "Designated drivers stay on 🧢 Sober Cap tonight." };
  }
  party.drinkTiers[input.userId] = {
    tierKey: input.tierKey,
    ts: new Date().toISOString(),
    name: input.name,
  };
  return { tiers: listDrinkTiers(input.circleId) };
}

export function setDesignatedDriver(circleId: string, userId: string | null) {
  const party = partyBucket(circleId);
  party.ddUserId = userId;
  if (userId) {
    party.drinkTiers[userId] = {
      tierKey: "sober",
      ts: new Date().toISOString(),
      name: getDemoMembers().find((m) => m.userId === userId)?.name ?? "DD",
    };
  }
  return listDrinkTiers(circleId);
}

export function hydrationNags(circleId: string): string[] {
  return listDrinkTiers(circleId)
    .filter((t) => t.level >= 4 && !t.isDD)
    .map((t) => `someone hydrate @${t.name} 💧`);
}

export function listFlags(circleId: string) {
  return [...partyBucket(circleId).flags].sort(
    (a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime()
  );
}

export function addFlag(input: {
  circleId: string;
  targetId: string;
  targetName: string;
  flaggerName: string;
  flagType: string;
}) {
  const party = partyBucket(input.circleId);
  const recent = party.flags.filter(
    (f) =>
      f.flaggerName === input.flaggerName &&
      Date.now() - new Date(f.ts).getTime() < 30_000
  );
  if (recent.length >= 3) {
    return { error: "Slow down — max 3 flags per 30s." };
  }
  const entry = {
    id: randomUUID(),
    targetId: input.targetId,
    targetName: input.targetName,
    flaggerName: input.flaggerName,
    flagType: input.flagType,
    ts: new Date().toISOString(),
  };
  party.flags.unshift(entry);
  return { flag: entry, flags: listFlags(input.circleId) };
}

export function listRegrets(circleId: string) {
  return [...partyBucket(circleId).regrets].sort((a, b) => b.score - a.score);
}

export function setRegret(input: {
  circleId: string;
  userId: string;
  name: string;
  score: number;
}) {
  const party = partyBucket(input.circleId);
  party.regrets = party.regrets.filter((r) => r.userId !== input.userId);
  const entry = {
    id: randomUUID(),
    userId: input.userId,
    name: input.name,
    score: input.score,
    label: regretLabel(input.score),
    ts: new Date().toISOString(),
  };
  party.regrets.unshift(entry);
  return { entry, regrets: listRegrets(input.circleId) };
}

export function listVibePoll(circleId: string) {
  const votes = partyBucket(circleId).vibeVotes;
  const buckets = Array.from({ length: 10 }, (_, i) => ({
    score: i + 1,
    count: votes.filter((v) => v.score === i + 1).length,
  }));
  const avg =
    votes.length === 0
      ? 0
      : votes.reduce((sum, v) => sum + v.score, 0) / votes.length;
  return { votes, buckets, avg: Math.round(avg * 10) / 10, total: votes.length };
}

export function voteVibePoll(input: {
  circleId: string;
  userId: string;
  name: string;
  score: number;
}) {
  const party = partyBucket(input.circleId);
  party.vibeVotes = party.vibeVotes.filter((v) => v.userId !== input.userId);
  party.vibeVotes.push({
    userId: input.userId,
    name: input.name,
    score: Math.min(10, Math.max(1, input.score)),
    ts: new Date().toISOString(),
  });
  return listVibePoll(input.circleId);
}

export function listAttendance(circleId: string) {
  return [...partyBucket(circleId).attendance].sort(
    (a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime()
  );
}

export function clockAttendance(input: {
  circleId: string;
  userId: string;
  name: string;
  action: "in" | "out";
  photoDataUrl: string | null;
}) {
  if (!input.photoDataUrl) {
    return { error: "Selfie required to lock in/out." };
  }
  const entry = {
    id: randomUUID(),
    userId: input.userId,
    name: input.name,
    action: input.action,
    photoDataUrl: input.photoDataUrl,
    ts: new Date().toISOString(),
  };
  partyBucket(input.circleId).attendance.unshift(entry);
  return { entry, attendance: listAttendance(input.circleId) };
}

export function recordBlackjackWin(circleId: string, userId: string) {
  const party = partyBucket(circleId);
  party.blackjackWins[userId] = (party.blackjackWins[userId] ?? 0) + 1;
  return party.blackjackWins[userId];
}

export function getBlackjackWins(circleId: string, userId: string) {
  return partyBucket(circleId).blackjackWins[userId] ?? 0;
}

export function dealCard() {
  const suits = ["♠", "♥", "♦", "♣"] as const;
  const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"] as const;
  return {
    rank: ranks[Math.floor(Math.random() * ranks.length)],
    suit: suits[Math.floor(Math.random() * suits.length)],
  };
}

export function handValue(
  hand: Array<{ rank: string; suit: string }>
): number {
  let value = 0;
  let aces = 0;
  for (const card of hand) {
    if (card.rank === "A") {
      value += 11;
      aces += 1;
    } else if (["K", "Q", "J"].includes(card.rank)) {
      value += 10;
    } else {
      value += Number.parseInt(card.rank, 10);
    }
  }
  while (value > 21 && aces > 0) {
    value -= 10;
    aces -= 1;
  }
  return value;
}
