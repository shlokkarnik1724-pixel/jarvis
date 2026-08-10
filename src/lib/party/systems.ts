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
  smokes: Record<string, { cigarettes: number; greens: number }>;
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
      smokes: {},
    };
  }
  if (!state.party.smokes) state.party.smokes = {};
  return state.party;
}

export function getBrokeTitle(balance: number): string {
  if (balance > 500) return "🤑 Top G";
  if (balance > 0) return "💰 Certified Baller";
  if (balance === 0) return "😐 Even Steven";
  if (balance > -300) return "🥲 Lowkey Broke";
  return "💀 Certified Broke Menace";
}

export function cigTitle(count: number): string {
  if (count <= 0) return "🌬️ Clean lungs (for now)";
  if (count <= 2) return "😌 Social puff";
  if (count <= 5) return "🚬 Suttebaaz-in-training";
  if (count <= 10) return "🔥 Certified Suttebaaz";
  if (count <= 18) return "💨 Chain-smoking menace";
  return "☠️ Full Suttebaaz Mode";
}

export function greenTitle(count: number): string {
  if (count <= 0) return "🧊 Straight-edge tonight";
  if (count <= 1) return "🌿 Occasional explorer";
  if (count <= 3) return "☁️ Cloud merchant";
  return "🛸 High Council member";
}

export function listSmokes(circleId: string) {
  const party = partyBucket(circleId);
  const members = getDemoMembers();
  const seedDefaults: Record<string, { cigarettes: number; greens: number }> = {};
  // Seed quirky demo counts once so the board isn't empty.
  for (const m of members) {
    if (!party.smokes[m.userId]) {
      seedDefaults[m.userId] = { cigarettes: 0, greens: 0 };
    }
  }
  if (Object.keys(party.smokes).length === 0 && members.length > 0) {
    const presets = [4, 11, 2, 7, 1, 0, 3];
    const greenPresets = [0, 2, 0, 1, 0, 0, 1];
    members.forEach((m, i) => {
      party.smokes[m.userId] = {
        cigarettes: presets[i % presets.length] ?? 0,
        greens: greenPresets[i % greenPresets.length] ?? 0,
      };
    });
  }

  return members
    .map((m) => {
      const row = party.smokes[m.userId] ?? seedDefaults[m.userId] ?? {
        cigarettes: 0,
        greens: 0,
      };
      return {
        userId: m.userId,
        name: m.name,
        nickname: m.nickname,
        cigarettes: row.cigarettes,
        greens: row.greens,
        cigTitle: cigTitle(row.cigarettes),
        greenTitle: greenTitle(row.greens),
      };
    })
    .sort((a, b) => b.cigarettes - a.cigarettes || b.greens - a.greens);
}

export function bumpSmoke(input: {
  circleId: string;
  userId: string;
  kind: "cigarettes" | "greens";
  delta?: number;
}) {
  const party = partyBucket(input.circleId);
  const current = party.smokes[input.userId] ?? { cigarettes: 0, greens: 0 };
  const delta = input.delta ?? 1;
  if (input.kind === "cigarettes") {
    current.cigarettes = Math.max(0, current.cigarettes + delta);
  } else {
    current.greens = Math.max(0, current.greens + delta);
  }
  party.smokes[input.userId] = current;
  return listSmokes(input.circleId);
}

export function getSmokeForUser(circleId: string, userId: string) {
  const row = listSmokes(circleId).find((r) => r.userId === userId);
  return (
    row ?? {
      userId,
      name: "Friend",
      nickname: null,
      cigarettes: 0,
      greens: 0,
      cigTitle: cigTitle(0),
      greenTitle: greenTitle(0),
    }
  );
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
