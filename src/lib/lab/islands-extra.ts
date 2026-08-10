import { randomUUID } from "crypto";
import { dayKey, shuffle } from "@/lib/lab/logic";
import { awardPoints, getLabState, labMembersExport } from "@/lib/lab/store-access";
import type {
  CircleStreakView,
  GifPinView,
  SnackCountView,
  SuperlativeView,
  TruthDareCard,
} from "@/lib/types";

export const DEFAULT_SNACKS = [
  "chips",
  "cookies",
  "instant noodles",
  "gummy bears",
  "frozen pizza",
  "energy drinks",
];

export const ROULETTE_DARES = [
  "Take a sip of water like it’s tequila",
  "Share your most unhinged playlist song",
  "Do 10 air high-fives with the group",
  "Confess your worst fashion era",
  "Send a voice note in a British accent",
  "Choose someone to invent a toast for",
  "Swap seats / swap Zoom backgrounds",
  "Show the last photo in your camera roll (safe ones only)",
  "Speak only in movie quotes for 2 minutes",
  "Name three people here with compliments only",
];

export const TRUTH_DARE_DECK: Array<Omit<TruthDareCard, "id" | "custom">> = [
  { kind: "truth", text: "What’s a circle rumor you accidentally started?" },
  { kind: "truth", text: "Who here would you trust with your phone unlocked?" },
  { kind: "dare", text: "Post a 3-word toast in the confession wall." },
  { kind: "dare", text: "Do your best impression of the designated mom friend." },
  { kind: "truth", text: "What’s your go-to excuse for being late?" },
  { kind: "dare", text: "Invent a new circle handshake in 30 seconds." },
  { kind: "truth", text: "Which Bar Bible drink is most you?" },
  { kind: "dare", text: "Give someone a Superlative right now." },
];

export const DEMO_GIFS = [
  {
    id: "demo-celebrate",
    url: "https://media.giphy.com/media/g9582DNuQVjV6/giphy.gif",
    title: "celebration",
  },
  {
    id: "demo-nod",
    url: "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",
    title: "yes",
  },
  {
    id: "demo-chaos",
    url: "https://media.giphy.com/media/3o7aCTPPm4OHgjwD8Y/giphy.gif",
    title: "chaos",
  },
  {
    id: "demo-sip",
    url: "https://media.giphy.com/media/3oEduSbSGpGaRX2Vri/giphy.gif",
    title: "sip",
  },
  {
    id: "demo-sleep",
    url: "https://media.giphy.com/media/fAnEC88LkhDkeqqMgI/giphy.gif",
    title: "exhausted",
  },
  {
    id: "demo-fire",
    url: "https://media.giphy.com/media/l41lGvinEgARjB2HC/giphy.gif",
    title: "fire",
  },
];

/** Ensure snack/gif/streak fields exist on older in-memory states. */
export function ensureExtraState(circleId: string) {
  const state = getLabState(circleId) as ReturnType<typeof getLabState> & {
    snacks?: SnackCountView[];
    gifs?: GifPinView[];
    streak?: { current: number; best: number; lastCheckInDay: string | null };
    truthDareCustom?: TruthDareCard[];
  };

  if (!state.snacks) {
    state.snacks = DEFAULT_SNACKS.map((snackName) => ({
      snackName,
      count: snackName === "chips" ? 4 : snackName === "cookies" ? 2 : 0,
      updatedAt: new Date().toISOString(),
    }));
  }
  if (!state.gifs) {
    state.gifs = DEMO_GIFS.slice(0, 3).map((gif) => ({
      id: randomUUID(),
      circleId,
      url: gif.url,
      title: gif.title,
      pinnedByName: "Jordan Lee",
      createdAt: new Date().toISOString(),
    }));
  }
  if (!state.streak) {
    state.streak = {
      current: 3,
      best: 7,
      lastCheckInDay: null,
    };
  }
  if (!state.truthDareCustom) {
    state.truthDareCustom = [];
  }
  return state;
}

export function listSnacks(circleId: string): SnackCountView[] {
  return [...ensureExtraState(circleId).snacks!].sort((a, b) => b.count - a.count);
}

export function bumpSnack(circleId: string, snackName: string): SnackCountView {
  const state = ensureExtraState(circleId);
  const existing = state.snacks!.find((s) => s.snackName === snackName);
  if (existing) {
    existing.count += 1;
    existing.updatedAt = new Date().toISOString();
    return existing;
  }
  const next: SnackCountView = {
    snackName,
    count: 1,
    updatedAt: new Date().toISOString(),
  };
  state.snacks!.push(next);
  return next;
}

export function listGifs(circleId: string): GifPinView[] {
  return [...ensureExtraState(circleId).gifs!].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function pinGif(input: {
  circleId: string;
  url: string;
  title: string;
  pinnedByName: string;
}): GifPinView {
  const entry: GifPinView = {
    id: randomUUID(),
    circleId: input.circleId,
    url: input.url,
    title: input.title,
    pinnedByName: input.pinnedByName,
    createdAt: new Date().toISOString(),
  };
  ensureExtraState(input.circleId).gifs!.unshift(entry);
  return entry;
}

export function getStreak(circleId: string): CircleStreakView {
  const state = ensureExtraState(circleId);
  const today = dayKey();
  return {
    current: state.streak!.current,
    best: state.streak!.best,
    lastCheckInDay: state.streak!.lastCheckInDay,
    checkedInToday: state.streak!.lastCheckInDay === today,
  };
}

export function checkInStreak(circleId: string, userId: string): CircleStreakView {
  const state = ensureExtraState(circleId);
  const today = dayKey();
  if (state.streak!.lastCheckInDay === today) {
    return getStreak(circleId);
  }

  const yesterday = dayKey(new Date(Date.now() - 86400000));
  if (state.streak!.lastCheckInDay === yesterday) {
    state.streak!.current += 1;
  } else {
    state.streak!.current = 1;
  }
  state.streak!.best = Math.max(state.streak!.best, state.streak!.current);
  state.streak!.lastCheckInDay = today;

  awardPoints({
    circleId,
    userId,
    delta: 2,
    reason: "Circle streak check-in",
    scoreType: "event_attendance",
  });

  return getStreak(circleId);
}

export function spinRoulette(): { dare: string; index: number } {
  const index = Math.floor(Math.random() * ROULETTE_DARES.length);
  return { dare: ROULETTE_DARES[index], index };
}

export function listTruthDare(circleId: string): TruthDareCard[] {
  const custom = ensureExtraState(circleId).truthDareCustom ?? [];
  const base = TRUTH_DARE_DECK.map((card) => ({
    ...card,
    id: `${card.kind}-${card.text.slice(0, 12)}`,
    custom: false,
  }));
  return [...custom, ...base];
}

export function addTruthDare(input: {
  circleId: string;
  kind: "truth" | "dare";
  text: string;
}): TruthDareCard {
  const card: TruthDareCard = {
    id: randomUUID(),
    kind: input.kind,
    text: input.text.trim(),
    custom: true,
  };
  ensureExtraState(input.circleId).truthDareCustom!.unshift(card);
  return card;
}

export function drawTruthDare(circleId: string): TruthDareCard {
  const deck = listTruthDare(circleId);
  return shuffle(deck)[0];
}

export function computeSuperlatives(circleId: string): SuperlativeView[] {
  const members = labMembersExport(circleId);
  const state = getLabState(circleId);
  const currency = Object.entries(state.pointTotals).map(([userId, value]) => ({
    userId,
    ...value,
  }));

  const byPoints = [...currency].sort((a, b) => b.total - a.total);
  const byVibe = [...currency].sort(
    (a, b) => (b.breakdown.vibe_check ?? 0) - (a.breakdown.vibe_check ?? 0)
  );
  const byPoll = [...currency].sort(
    (a, b) => (b.breakdown.poll_win ?? 0) - (a.breakdown.poll_win ?? 0)
  );
  const byHydration = [...currency].sort(
    (a, b) => (b.breakdown.hydration ?? 0) - (a.breakdown.hydration ?? 0)
  );

  function pick(
    emoji: string,
    title: string,
    row: (typeof byPoints)[0] | undefined,
    reason: string
  ): SuperlativeView | null {
    if (!row) return null;
    const member = members.find((m) => m.userId === row.userId);
    return {
      emoji,
      title,
      userId: row.userId,
      name: member?.nickname || member?.name || row.nickname || row.name,
      reason,
    };
  }

  return [
    pick("👑", "Chaos Coordinator", byPoints[0], "Top Circle Currency haul"),
    pick("👻", "Most Likely to Ghost the Tab", byPoll[0], "Poll legend energy"),
    pick("🌡️", "Main Character Mood", byVibe[0], "Most vibe checks logged"),
    pick("💧", "Hydration Hero", byHydration[0], "Water streak points"),
    pick(
      "🧾",
      "Tab Champion",
      byPoints[1] ?? byPoints[0],
      "Fast settle-up vibes (runner-up board)"
    ),
  ].filter((item): item is SuperlativeView => Boolean(item));
}

export async function searchGifs(query: string): Promise<
  Array<{ id: string; url: string; title: string }>
> {
  const key = process.env.NEXT_PUBLIC_GIPHY_KEY;
  if (!key) {
    const q = query.trim().toLowerCase();
    return DEMO_GIFS.filter(
      (gif) => !q || gif.title.includes(q) || gif.id.includes(q)
    );
  }

  const res = await fetch(
    `https://api.giphy.com/v1/gifs/search?api_key=${key}&q=${encodeURIComponent(query || "friends")}&limit=12&rating=pg-13`
  );
  if (!res.ok) {
    return DEMO_GIFS;
  }
  const json = (await res.json()) as {
    data: Array<{
      id: string;
      title: string;
      images: { fixed_height: { url: string } };
    }>;
  };
  return json.data.map((gif) => ({
    id: gif.id,
    url: gif.images.fixed_height.url,
    title: gif.title || "gif",
  }));
}
