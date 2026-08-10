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
  // Party / cheers
  { id: "adult-cheers", url: "https://media.giphy.com/media/g9582DNuQVjV6/giphy.gif", title: "cheers we made it", tags: ["party", "cheers"] },
  { id: "adult-pour", url: "https://media.giphy.com/media/3oEduSbSGpGaRX2Vri/giphy.gif", title: "keep pouring", tags: ["party", "drinks"] },
  { id: "adult-shot", url: "https://media.giphy.com/media/l0MYC0LajbaPoEA2k/giphy.gif", title: "shot o'clock", tags: ["party", "drinks"] },
  { id: "adult-dance", url: "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif", title: "main character dance", tags: ["party", "dance"] },
  { id: "adult-disco", url: "https://media.giphy.com/media/3o7TKMoy3ZQ8SnY2cM/giphy.gif", title: "disco mode unlocked", tags: ["party", "dance"] },
  { id: "adult-crowd", url: "https://media.giphy.com/media/l0MYwONBGDcdVu8mA/giphy.gif", title: "the night is young", tags: ["party"] },
  { id: "adult-toast", url: "https://media.giphy.com/media/26tPplGWjN0xLybiU/giphy.gif", title: "group toast energy", tags: ["party", "cheers"] },
  { id: "adult-club", url: "https://media.giphy.com/media/3oriO7A7bt1wgFzBhK/giphy.gif", title: "club kid chaos", tags: ["party", "dance"] },

  // Drunk / tipsy comedy
  { id: "adult-wobble", url: "https://media.giphy.com/media/3o7aCTPPm4OHgjwD8Y/giphy.gif", title: "tipsy wobble", tags: ["drunk", "chaos"] },
  { id: "adult-spill", url: "https://media.giphy.com/media/3o6Zt481isNVuQI1l6/giphy.gif", title: "i meant to do that", tags: ["drunk", "chaos"] },
  { id: "adult-blur", url: "https://media.giphy.com/media/xT0xeJpnrWC4XWblEk/giphy.gif", title: "vision: 480p", tags: ["drunk"] },
  { id: "adult-slur", url: "https://media.giphy.com/media/3o6Zt8zb1Pp2p4kq5a/giphy.gif", title: "i'm fine (lying)", tags: ["drunk"] },
  { id: "adult-oops", url: "https://media.giphy.com/media/3oriO0OEd9QIDdllqo/giphy.gif", title: "bad decision incoming", tags: ["drunk", "chaos"] },
  { id: "adult-spin", url: "https://media.giphy.com/media/l3q2K5jinAlChoCLS/giphy.gif", title: "room is spinning", tags: ["drunk", "hangover"] },
  { id: "adult-laugh", url: "https://media.giphy.com/media/5VYbHYIu3HwmI/giphy.gif", title: "unhinged laughter", tags: ["drunk", "chaos"] },
  { id: "adult-point", url: "https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif", title: "that's so you", tags: ["drunk", "roast"] },

  // Hangover / morning after
  { id: "adult-dead", url: "https://media.giphy.com/media/fAnEC88LkhDkeqqMgI/giphy.gif", title: "emotionally offline", tags: ["hangover"] },
  { id: "adult-headache", url: "https://media.giphy.com/media/l41lGvinEgARjB2HC/giphy.gif", title: "brain on fire", tags: ["hangover"] },
  { id: "adult-bed", url: "https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif", title: "never leaving bed", tags: ["hangover"] },
  { id: "adult-coffee", url: "https://media.giphy.com/media/3o6Zt6ML6BklcajjsA/giphy.gif", title: "coffee IV drip", tags: ["hangover"] },
  { id: "adult-regret", url: "https://media.giphy.com/media/d2lcHJTG5Tscg/giphy.gif", title: "why did i say that", tags: ["hangover", "cringe"] },
  { id: "adult-walk", url: "https://media.giphy.com/media/l0HlvtIPzPdt2usKs/giphy.gif", title: "walk of mild shame", tags: ["hangover"] },
  { id: "adult-sun", url: "https://media.giphy.com/media/xUA7aM09ByyR1Q5KGM/giphy.gif", title: "sunlight is illegal", tags: ["hangover"] },
  { id: "adult-water", url: "https://media.giphy.com/media/3orieXHZX2Eb5mq1YI/giphy.gif", title: "hydrate or die-drate", tags: ["hangover"] },

  // Flirty / dating-app adult humor (PG-13)
  { id: "adult-wink", url: "https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif", title: "subtle (not subtle)", tags: ["flirty"] },
  { id: "adult-heart", url: "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif", title: "down bad detected", tags: ["flirty"] },
  { id: "adult-blush", url: "https://media.giphy.com/media/3o7TKQwP4hG5m2kY5W/giphy.gif", title: "caught catching feelings", tags: ["flirty"] },
  { id: "adult-text", url: "https://media.giphy.com/media/3o6ZsYm5q2m0Qkq0gE/giphy.gif", title: "left on read energy", tags: ["flirty", "cringe"] },
  { id: "adult-smooth", url: "https://media.giphy.com/media/l0HlNQ03J5JxX6lva/giphy.gif", title: "thought i was smooth", tags: ["flirty", "cringe"] },
  { id: "adult-kiss", url: "https://media.giphy.com/media/l0MYwONBGDcdVu8mA/giphy.gif", title: "mwah from across the bar", tags: ["flirty"] },

  // Roasts / group chat energy
  { id: "adult-sideeye", url: "https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif", title: "industrial strength side-eye", tags: ["roast"] },
  { id: "adult-nope", url: "https://media.giphy.com/media/3ohzdIuqJoo8QdKlnW/giphy.gif", title: "absolutely not", tags: ["roast"] },
  { id: "adult-liar", url: "https://media.giphy.com/media/3o6Zt8zb1Pp2p4kq5a/giphy.gif", title: "and i oop — liar", tags: ["roast"] },
  { id: "adult-judge", url: "https://media.giphy.com/media/xT0GqssRwiIIiNxOQE/giphy.gif", title: "judging silently", tags: ["roast"] },
  { id: "adult-cap", url: "https://media.giphy.com/media/3o7TKMoy3ZQ8SnY2cM/giphy.gif", title: "that's cap", tags: ["roast"] },
  { id: "adult-receipts", url: "https://media.giphy.com/media/26tPoyNh1xqQzq2kq/giphy.gif", title: "i have receipts", tags: ["roast"] },

  // Chaos / unhinged
  { id: "adult-feral", url: "https://media.giphy.com/media/3oEduPPmzXoF6qG5Tq/giphy.gif", title: "feral mode", tags: ["chaos"] },
  { id: "adult-scream", url: "https://media.giphy.com/media/l41lGvinEgARjB2HC/giphy.gif", title: "internal screaming", tags: ["chaos"] },
  { id: "adult-run", url: "https://media.giphy.com/media/l0HlvtIPzPdt2usKs/giphy.gif", title: "exit the chat", tags: ["chaos"] },
  { id: "adult-explode", url: "https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif", title: "brain go boom", tags: ["chaos"] },
  { id: "adult-plot", url: "https://media.giphy.com/media/3oriO7A7bt1wgFzBhK/giphy.gif", title: "plot twist nobody asked for", tags: ["chaos"] },
  { id: "adult-villain", url: "https://media.giphy.com/media/xUA7aM09ByyR1Q5KGM/giphy.gif", title: "villain origin story", tags: ["chaos"] },

  // Adulting fails
  { id: "adult-bills", url: "https://media.giphy.com/media/d2lcHJTG5Tscg/giphy.gif", title: "adulting declined", tags: ["adulting"] },
  { id: "adult-broke", url: "https://media.giphy.com/media/3orieXHZX2Eb5mq1YI/giphy.gif", title: "wallet empty soul emptier", tags: ["adulting"] },
  { id: "adult-monday", url: "https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif", title: "monday after the weekend", tags: ["adulting", "hangover"] },
  { id: "adult-tax", url: "https://media.giphy.com/media/l0HlNQ03J5JxX6lva/giphy.gif", title: "taxes? in this economy?", tags: ["adulting"] },
  { id: "adult-nap", url: "https://media.giphy.com/media/3o6Zt6ML6BklcajjsA/giphy.gif", title: "power nap propaganda", tags: ["adulting"] },
  { id: "adult-late", url: "https://media.giphy.com/media/3o6ZsYm5q2m0Qkq0gE/giphy.gif", title: "fashionably next-day", tags: ["adulting"] },
] as const;

export type DemoGif = (typeof DEMO_GIFS)[number];

export const GIF_PACK_FILTERS = [
  { id: "all", label: "All funny" },
  { id: "party", label: "Party" },
  { id: "drunk", label: "Tipsy" },
  { id: "hangover", label: "Hangover" },
  { id: "flirty", label: "Flirty" },
  { id: "roast", label: "Roasts" },
  { id: "chaos", label: "Unhinged" },
  { id: "adulting", label: "Adulting" },
] as const;

export function filterFunnyGifs(query: string, tag = "all"): DemoGif[] {
  const q = query.trim().toLowerCase();
  return DEMO_GIFS.filter((gif) => {
    const tagOk =
      tag === "all" || (gif.tags as readonly string[]).includes(tag);
    if (!tagOk) return false;
    if (!q) return true;
    const haystack = [gif.title, gif.id, ...gif.tags].join(" ").toLowerCase();
    return haystack.includes(q);
  });
}

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
    state.gifs = DEMO_GIFS.filter((gif) =>
      ["adult-cheers", "adult-wobble", "adult-dead", "adult-sideeye", "adult-feral", "adult-shot"].includes(
        gif.id
      )
    ).map((gif) => ({
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

export async function searchGifs(
  query: string,
  tag = "all"
): Promise<Array<{ id: string; url: string; title: string; tags?: string[] }>> {
  const pack = filterFunnyGifs(query, tag).map((gif) => ({
    id: gif.id,
    url: gif.url,
    title: gif.title,
    tags: [...gif.tags],
  }));

  const key = process.env.NEXT_PUBLIC_GIPHY_KEY;
  if (!key) {
    return pack;
  }

  const searchTerm =
    query.trim() ||
    (tag !== "all" ? `${tag} funny reaction` : "funny drunk party reaction");

  try {
    const res = await fetch(
      `https://api.giphy.com/v1/gifs/search?api_key=${key}&q=${encodeURIComponent(searchTerm)}&limit=24&rating=pg-13`
    );
    if (!res.ok) return pack;
    const json = (await res.json()) as {
      data: Array<{
        id: string;
        title: string;
        images: { fixed_height: { url: string } };
      }>;
    };
    const remote = json.data.map((gif) => ({
      id: gif.id,
      url: gif.images.fixed_height.url,
      title: gif.title || "gif",
    }));
    // Curated funny pack first, then GIPHY hits.
    const seen = new Set<string>(pack.map((g) => g.url));
    return [...pack, ...remote.filter((g) => !seen.has(g.url))];
  } catch {
    return pack;
  }
}
