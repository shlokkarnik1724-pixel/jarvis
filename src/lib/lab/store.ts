import { randomUUID } from "crypto";
import {
  buildRecoveryKit,
  checkBingo,
  dayKey,
  DEFAULT_BINGO_PROMPTS,
  generateRecoveryTasks,
  getRemedies,
  severityFromDrinks,
  shuffle,
  titleForPoints,
  VIBE_PRESETS,
} from "@/lib/lab/logic";
import {
  getDemoEvents,
  getDemoLeaderboard,
  getDemoMembers,
  getDemoStore,
} from "@/lib/demo/store";
import type {
  BingoCardView,
  CircleMemberView,
  ConfessionView,
  EventView,
  InsideJokeView,
  MostLikelyPollView,
  PointsLedgerEntry,
  RecoveryPlanView,
  ScoreType,
  VibeCheckView,
  WellnessStatus,
} from "@/lib/types";

interface LabCircleState {
  members: CircleMemberView[];
  events: EventView[];
  vibes: VibeCheckView[];
  jokes: InsideJokeView[];
  ledger: PointsLedgerEntry[];
  polls: MostLikelyPollView[];
  pollVotes: Array<{ pollId: string; voterId: string; votedForUserId: string }>;
  confessions: ConfessionView[];
  confessionCooldowns: Record<string, string>;
  bingoCards: BingoCardView[];
  recoveryPlans: RecoveryPlanView[];
  mostLikelyScores: Record<string, number>;
  pointTotals: Record<string, { total: number; breakdown: Partial<Record<ScoreType, number>>; name: string; nickname: string | null }>;
  momFriendUserId: string | null;
}

const globalLab = globalThis as unknown as {
  __circleLab?: Map<string, LabCircleState>;
};

function labMap(): Map<string, LabCircleState> {
  if (!globalLab.__circleLab) {
    globalLab.__circleLab = new Map();
  }
  return globalLab.__circleLab;
}

function emptyState(): LabCircleState {
  return {
    members: [],
    events: [],
    vibes: [],
    jokes: [],
    ledger: [],
    polls: [],
    pollVotes: [],
    confessions: [],
    confessionCooldowns: {},
    bingoCards: [],
    recoveryPlans: [],
    mostLikelyScores: {},
    pointTotals: {},
    momFriendUserId: null,
  };
}

function seedState(circleId: string): LabCircleState {
  const state = emptyState();
  const members = getDemoMembers();
  const now = new Date().toISOString();
  state.members = members;
  state.events = getDemoEvents();

  state.jokes = [
    {
      id: randomUUID(),
      circleId,
      term: "suttebaaz protocol",
      definition: "When Meet says one more and somehow the pack vanishes.",
      addedByName: "Meet Shinde",
      usageCount: 9,
      createdAt: now,
    },
    {
      id: randomUUID(),
      circleId,
      term: "fashionably next-day",
      definition: "Arriving so late it becomes brunch with Darshan.",
      addedByName: "Aryan Revankar",
      usageCount: 4,
      createdAt: now,
    },
  ];

  state.confessions = [
    {
      id: randomUUID(),
      circleId,
      text: "I once hid the aux cord so nobody could play that one song again.",
      createdAt: now,
      reactions: { fire: 3, skull: 1 },
      myReaction: null,
    },
  ];

  state.momFriendUserId = members[0]?.userId ?? null;

  for (const row of getDemoLeaderboard()) {
    state.mostLikelyScores[row.userId] = Math.floor(row.totalPoints / 10);
    state.pointTotals[row.userId] = {
      total: row.totalPoints,
      breakdown: { ...row.breakdown },
      name: row.name,
      nickname: row.nickname,
    };
  }

  return state;
}

export function getLabState(circleId: string): LabCircleState {
  const map = labMap();
  if (!map.has(circleId)) {
    map.set(circleId, seedState(circleId));
  }
  return map.get(circleId)!;
}

export function syncLabContext(
  circleId: string,
  members: CircleMemberView[],
  events: EventView[]
): void {
  const state = getLabState(circleId);
  if (members.length > 0) state.members = members;
  if (events.length > 0) state.events = events;
  for (const member of state.members) {
    if (!state.pointTotals[member.userId]) {
      state.pointTotals[member.userId] = {
        total: 0,
        breakdown: {},
        name: member.name,
        nickname: member.nickname,
      };
    }
  }
}

function labMembers(circleId: string): CircleMemberView[] {
  const members = getLabState(circleId).members;
  return members.length > 0 ? members : getDemoMembers();
}

export function getLabMembers(circleId: string): CircleMemberView[] {
  return labMembers(circleId);
}

function labEvents(circleId: string): EventView[] {
  const events = getLabState(circleId).events;
  return events.length > 0 ? events : getDemoEvents();
}

function memberName(circleId: string, userId: string): string {
  const member = labMembers(circleId).find((m) => m.userId === userId);
  return member?.nickname || member?.name || "Member";
}

export function listActiveVibes(circleId: string): VibeCheckView[] {
  const state = getLabState(circleId);
  const today = dayKey();
  const now = Date.now();
  state.vibes = state.vibes.filter(
    (v) => v.dayKey === today && new Date(v.expiresAt).getTime() > now
  );
  return state.vibes;
}

export function setVibeCheck(input: {
  circleId: string;
  userId: string;
  emoji: string;
  label: string;
}): VibeCheckView {
  const state = getLabState(input.circleId);
  const today = dayKey();
  const expires = new Date();
  expires.setHours(expires.getHours() + 24);
  const next: VibeCheckView = {
    userId: input.userId,
    circleId: input.circleId,
    emoji: input.emoji,
    label: input.label,
    dayKey: today,
    expiresAt: expires.toISOString(),
    displayName: memberName(input.circleId, input.userId),
  };
  state.vibes = state.vibes.filter(
    (v) => !(v.userId === input.userId && v.dayKey === today)
  );
  state.vibes.push(next);
  awardPoints({
    circleId: input.circleId,
    userId: input.userId,
    delta: 1,
    reason: "Daily vibe check",
    scoreType: "vibe_check",
  });
  return next;
}

export function listJokes(circleId: string): InsideJokeView[] {
  return [...getLabState(circleId).jokes].sort((a, b) => b.usageCount - a.usageCount);
}

export function addJoke(input: {
  circleId: string;
  term: string;
  definition: string;
  addedByName: string;
}): InsideJokeView {
  const entry: InsideJokeView = {
    id: randomUUID(),
    circleId: input.circleId,
    term: input.term.trim(),
    definition: input.definition.trim(),
    addedByName: input.addedByName,
    usageCount: 1,
    createdAt: new Date().toISOString(),
  };
  getLabState(input.circleId).jokes.unshift(entry);
  return entry;
}

export function bumpJoke(circleId: string, jokeId: string, userId: string): InsideJokeView | null {
  const joke = getLabState(circleId).jokes.find((j) => j.id === jokeId);
  if (!joke) return null;
  joke.usageCount += 1;
  awardPoints({
    circleId,
    userId,
    delta: 1,
    reason: `Same 😂 — ${joke.term}`,
    scoreType: "joke_bump",
  });
  return joke;
}

export function awardPoints(input: {
  circleId: string;
  userId: string;
  delta: number;
  reason: string;
  scoreType: ScoreType;
}): PointsLedgerEntry {
  const entry: PointsLedgerEntry = {
    id: randomUUID(),
    userId: input.userId,
    circleId: input.circleId,
    delta: input.delta,
    reason: input.reason,
    scoreType: input.scoreType,
    createdAt: new Date().toISOString(),
  };
  getLabState(input.circleId).ledger.unshift(entry);

  const state = getLabState(input.circleId);
  const member = labMembers(input.circleId).find((m) => m.userId === input.userId);
  const current = state.pointTotals[input.userId] ?? {
    total: 0,
    breakdown: {},
    name: member?.name ?? "Member",
    nickname: member?.nickname ?? null,
  };
  current.total += input.delta;
  current.breakdown[input.scoreType] =
    (current.breakdown[input.scoreType] ?? 0) + input.delta;
  state.pointTotals[input.userId] = current;

  const row = getDemoStore().leaderboard.find((l) => l.userId === input.userId);
  if (row) {
    row.totalPoints += input.delta;
    row.breakdown[input.scoreType] = (row.breakdown[input.scoreType] ?? 0) + input.delta;
    row.title = titleForPoints(row.totalPoints);
  }
  return entry;
}

export function listLedger(circleId: string): PointsLedgerEntry[] {
  return getLabState(circleId).ledger;
}

export function getCurrencySnapshot(circleId: string) {
  const state = getLabState(circleId);
  const rows = labMembers(circleId)
    .map((member) => {
      const points = state.pointTotals[member.userId] ?? {
        total: 0,
        breakdown: {},
        name: member.name,
        nickname: member.nickname,
      };
      return {
        userId: member.userId,
        name: points.name,
        nickname: points.nickname,
        totalPoints: points.total,
        breakdown: points.breakdown,
        title: titleForPoints(points.total),
      };
    })
    .sort((a, b) => b.totalPoints - a.totalPoints);

  return {
    rows,
    ledger: listLedger(circleId).slice(0, 20),
    titles: rows.map((r) => ({
      userId: r.userId,
      name: r.nickname || r.name,
      title: r.title,
      totalPoints: r.totalPoints,
    })),
  };
}

function refreshPoll(poll: MostLikelyPollView, state: LabCircleState): MostLikelyPollView {
  const now = Date.now();
  if (!poll.closed && new Date(poll.closesAt).getTime() <= now) {
    poll.closed = true;
    const winner = [...poll.tallies].sort((a, b) => b.votes - a.votes)[0];
    if (winner && winner.votes > 0) {
      poll.winnerUserId = winner.userId;
      state.mostLikelyScores[winner.userId] =
        (state.mostLikelyScores[winner.userId] ?? 0) + 1;
      awardPoints({
        circleId: poll.circleId,
        userId: winner.userId,
        delta: 8,
        reason: `Most likely: ${poll.prompt}`,
        scoreType: "poll_win",
      });
    }
  }

  const tallies = labMembers(poll.circleId).map((m) => ({
    userId: m.userId,
    name: m.nickname || m.name,
    votes: state.pollVotes.filter(
      (v) => v.pollId === poll.id && v.votedForUserId === m.userId
    ).length,
  }));
  poll.tallies = tallies.sort((a, b) => b.votes - a.votes);
  return poll;
}

export function listPolls(circleId: string, viewerId: string): MostLikelyPollView[] {
  const state = getLabState(circleId);
  return state.polls.map((poll) => {
    const refreshed = refreshPoll({ ...poll }, state);
    const mine = state.pollVotes.find(
      (v) => v.pollId === poll.id && v.voterId === viewerId
    );
    refreshed.myVoteUserId = mine?.votedForUserId ?? null;
    Object.assign(poll, refreshed);
    return { ...poll, myVoteUserId: refreshed.myVoteUserId };
  });
}

export function createPoll(input: {
  circleId: string;
  prompt: string;
  createdByName: string;
}): MostLikelyPollView {
  const createdAt = new Date();
  const closesAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);
  const poll: MostLikelyPollView = {
    id: randomUUID(),
    circleId: input.circleId,
    prompt: input.prompt.trim(),
    createdByName: input.createdByName,
    createdAt: createdAt.toISOString(),
    closesAt: closesAt.toISOString(),
    closed: false,
    myVoteUserId: null,
    tallies: labMembers(input.circleId).map((m) => ({
      userId: m.userId,
      name: m.nickname || m.name,
      votes: 0,
    })),
    winnerUserId: null,
  };
  getLabState(input.circleId).polls.unshift(poll);
  return poll;
}

export function votePoll(input: {
  circleId: string;
  pollId: string;
  voterId: string;
  votedForUserId: string;
}): MostLikelyPollView | null {
  const state = getLabState(input.circleId);
  const poll = state.polls.find((p) => p.id === input.pollId);
  if (!poll) return null;
  refreshPoll(poll, state);
  if (poll.closed) return poll;

  state.pollVotes = state.pollVotes.filter(
    (v) => !(v.pollId === input.pollId && v.voterId === input.voterId)
  );
  state.pollVotes.push({
    pollId: input.pollId,
    voterId: input.voterId,
    votedForUserId: input.votedForUserId,
  });
  return listPolls(input.circleId, input.voterId).find((p) => p.id === input.pollId) ?? null;
}

export function mostLikelyLeaderboard(circleId: string) {
  const state = getLabState(circleId);
  return labMembers(circleId)
    .map((m) => ({
      userId: m.userId,
      name: m.nickname || m.name,
      score: state.mostLikelyScores[m.userId] ?? 0,
    }))
    .sort((a, b) => b.score - a.score);
}

export function listConfessions(circleId: string): ConfessionView[] {
  return [...getLabState(circleId).confessions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function addConfession(input: {
  circleId: string;
  userId: string;
  text: string;
}): ConfessionView | { error: string } {
  const state = getLabState(input.circleId);
  const last = state.confessionCooldowns[input.userId];
  if (last && Date.now() - new Date(last).getTime() < 60_000) {
    return { error: "Slow down — wait a minute between anonymous posts." };
  }
  const entry: ConfessionView = {
    id: randomUUID(),
    circleId: input.circleId,
    text: input.text.trim(),
    createdAt: new Date().toISOString(),
    reactions: { fire: 0, skull: 0 },
    myReaction: null,
  };
  // Intentionally no authorId on the confession doc.
  state.confessionCooldowns[input.userId] = entry.createdAt;
  state.confessions.unshift(entry);
  return entry;
}

export function reactConfession(input: {
  circleId: string;
  confessionId: string;
  reaction: "fire" | "skull";
}): ConfessionView | null {
  const entry = getLabState(input.circleId).confessions.find(
    (c) => c.id === input.confessionId
  );
  if (!entry) return null;
  if (entry.myReaction === input.reaction) return entry;
  if (entry.myReaction) {
    entry.reactions[entry.myReaction] = Math.max(0, entry.reactions[entry.myReaction] - 1);
  }
  entry.myReaction = input.reaction;
  entry.reactions[input.reaction] += 1;
  return entry;
}

export function getOrCreateBingoCard(input: {
  circleId: string;
  eventId: string;
  userId: string;
}): BingoCardView | null {
  const state = getLabState(input.circleId);
  const existing = state.bingoCards.find(
    (c) => c.eventId === input.eventId && c.userId === input.userId
  );
  if (existing) return existing;

  const event = labEvents(input.circleId).find((e) => e.id === input.eventId);
  if (!event) return null;

  const grid = shuffle(DEFAULT_BINGO_PROMPTS).slice(0, 25);
  grid[12] = "FREE SPACE — chaos already underway";
  const marked = Array.from({ length: 25 }, (_, i) => i === 12);
  const card: BingoCardView = {
    id: randomUUID(),
    eventId: input.eventId,
    eventTitle: event.title,
    userId: input.userId,
    grid,
    marked,
    hasBingo: checkBingo(marked),
    createdAt: new Date().toISOString(),
  };
  state.bingoCards.unshift(card);
  return card;
}

export function markBingoCell(input: {
  circleId: string;
  cardId: string;
  index: number;
  userId: string;
}): BingoCardView | null {
  const card = getLabState(input.circleId).bingoCards.find((c) => c.id === input.cardId);
  if (!card || card.userId !== input.userId) return null;
  if (input.index < 0 || input.index >= 25) return null;
  card.marked[input.index] = !card.marked[input.index];
  // Keep free space marked
  card.marked[12] = true;
  const won = checkBingo(card.marked);
  if (won && !card.hasBingo) {
    card.hasBingo = true;
    awardPoints({
      circleId: input.circleId,
      userId: input.userId,
      delta: 15,
      reason: `Blackout Bingo — ${card.eventTitle}`,
      scoreType: "bingo_win",
    });
  } else {
    card.hasBingo = won;
  }
  return card;
}

export function listBingoCards(circleId: string, userId: string): BingoCardView[] {
  return getLabState(circleId).bingoCards.filter((c) => c.userId === userId);
}

export function getOrCreateRecoveryPlan(input: {
  circleId: string;
  userId: string;
  eventId: string;
  drinkCount?: number;
}): RecoveryPlanView | null {
  const state = getLabState(input.circleId);
  const existing = state.recoveryPlans.find(
    (p) => p.eventId === input.eventId && p.userId === input.userId
  );
  if (existing) return existing;

  const event = labEvents(input.circleId).find((e) => e.id === input.eventId);
  if (!event) return null;

  const drinkCount = input.drinkCount ?? 5;
  const severity = severityFromDrinks(drinkCount);
  const plan: RecoveryPlanView = {
    id: randomUUID(),
    userId: input.userId,
    eventId: input.eventId,
    eventTitle: event.title,
    severity,
    drinkCount,
    tasks: generateRecoveryTasks(severity),
    symptoms: [],
    remedies: [],
    wellness: null,
    hydrationGlasses: 0,
    hydrationStreak: 0,
    kit: buildRecoveryKit(labMembers(input.circleId).length, severity),
    createdAt: new Date().toISOString(),
  };
  state.recoveryPlans.unshift(plan);
  return plan;
}

export function listRecoveryPlans(circleId: string, userId: string): RecoveryPlanView[] {
  return getLabState(circleId).recoveryPlans.filter((p) => p.userId === userId);
}

export function updateRecoveryPlan(input: {
  circleId: string;
  planId: string;
  userId: string;
  taskIndex?: number;
  symptoms?: string[];
  wellness?: WellnessStatus;
  logWater?: boolean;
  kitIndex?: number;
}): RecoveryPlanView | { error: string; plan?: RecoveryPlanView; alert?: string } {
  const state = getLabState(input.circleId);
  const plan = state.recoveryPlans.find((p) => p.id === input.planId);
  if (!plan || plan.userId !== input.userId) {
    return { error: "Recovery plan not found" };
  }

  if (typeof input.taskIndex === "number" && plan.tasks[input.taskIndex]) {
    plan.tasks[input.taskIndex].done = !plan.tasks[input.taskIndex].done;
  }

  if (input.symptoms) {
    plan.symptoms = input.symptoms;
    plan.remedies = getRemedies(input.symptoms);
  }

  let alert: string | undefined;
  if (input.wellness) {
    plan.wellness = input.wellness;
    if (input.wellness === "help") {
      const contactId = state.momFriendUserId;
      const contact = labMembers(input.circleId).find((m) => m.userId === contactId);
      alert = contact
        ? `Pinged ${contact.nickname || contact.name} — your designated mom friend.`
        : "Help signal logged for the circle.";
    }
  }

  if (input.logWater) {
    plan.hydrationGlasses += 1;
    if (plan.hydrationGlasses > 0 && plan.hydrationGlasses % 6 === 0) {
      plan.hydrationStreak += 1;
      awardPoints({
        circleId: input.circleId,
        userId: input.userId,
        delta: 5,
        reason: "Hydration Hero streak",
        scoreType: "hydration",
      });
    }
  }

  if (typeof input.kitIndex === "number" && plan.kit[input.kitIndex]) {
    plan.kit[input.kitIndex].bought = !plan.kit[input.kitIndex].bought;
  }

  return alert ? { error: "", plan, alert } : plan;
}

export function vibePresets() {
  return VIBE_PRESETS;
}

export function setMomFriend(circleId: string, userId: string) {
  getLabState(circleId).momFriendUserId = userId;
}

export function getLabHubSummary(circleId: string, userId: string) {
  const vibes = listActiveVibes(circleId);
  const jokes = listJokes(circleId).slice(0, 3);
  const polls = listPolls(circleId, userId).filter((p) => !p.closed).length;
  const currency = getCurrencySnapshot(circleId);
  return {
    vibeCount: vibes.length,
    topJokes: jokes,
    openPolls: polls,
    myTitle:
      currency.titles.find((t) => t.userId === userId)?.title ?? titleForPoints(0),
    presets: VIBE_PRESETS,
  };
}
