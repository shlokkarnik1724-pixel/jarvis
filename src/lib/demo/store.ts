import { createHmac, randomUUID, timingSafeEqual } from "crypto";
import type {
  CircleMemberView,
  CircleSummary,
  CircleUser,
  EventView,
  GameSessionView,
  GameType,
  LeaderboardRow,
  PhotoView,
  RoastToastView,
  ShoppingItemView,
  TabEntryView,
} from "@/lib/types";
import { createInitialState } from "@/lib/games/state-machine";

const DEMO_USER_ID = "11111111-1111-4111-8111-111111111111";
const DEMO_CIRCLE_ID = "22222222-2222-4222-8222-222222222222";
const DEMO_EVENT_ID = "33333333-3333-4333-8333-333333333333";
const DEMO_PHOTO_ID = "44444444-4444-4444-8444-444444444444";
const DEMO_FRIEND_ID = "55555555-5555-4555-8555-555555555555";
const DEMO_FRIEND_2 = "66666666-6666-4666-8666-666666666666";

interface DemoStore {
  user: CircleUser;
  circle: CircleSummary;
  members: CircleMemberView[];
  events: EventView[];
  shopping: ShoppingItemView[];
  photos: PhotoView[];
  leaderboard: LeaderboardRow[];
  tabs: TabEntryView[];
  roastToasts: RoastToastView[];
  games: GameSessionView[];
  sessions: Set<string>;
  photoBytes: Map<string, Uint8Array>;
}

function buildDemoPng(): Uint8Array {
  // Minimal valid 1x1 PNG (teal pixel) — vault stream demo asset
  const base64 =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
  return Uint8Array.from(Buffer.from(base64, "base64"));
}

function createStore(): DemoStore {
  const now = new Date();
  const weekend = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  return {
    user: {
      id: DEMO_USER_ID,
      email: "you@circle.local",
      name: "Alex Rivera",
      avatarUrl: null,
    },
    circle: {
      id: DEMO_CIRCLE_ID,
      name: "The Inner Orbit",
      inviteCode: "orbit42",
    },
    members: [
      {
        userId: DEMO_USER_ID,
        circleId: DEMO_CIRCLE_ID,
        nickname: "Orbit Captain",
        role: "owner",
        name: "Alex Rivera",
        email: "you@circle.local",
        avatarUrl: null,
      },
      {
        userId: DEMO_FRIEND_ID,
        circleId: DEMO_CIRCLE_ID,
        nickname: "Spark",
        role: "member",
        name: "Jordan Lee",
        email: "jordan@circle.local",
        avatarUrl: null,
      },
      {
        userId: DEMO_FRIEND_2,
        circleId: DEMO_CIRCLE_ID,
        nickname: "Midnight",
        role: "member",
        name: "Sam Okonkwo",
        email: "sam@circle.local",
        avatarUrl: null,
      },
    ],
    events: [
      {
        id: DEMO_EVENT_ID,
        circleId: DEMO_CIRCLE_ID,
        title: "Rooftop Film Night",
        date: weekend.toISOString(),
        location: "East River Overlook",
        tags: ["outdoor", "movies", "snacks"],
        checkinCount: 1,
        shoppingCount: 3,
        claimedCount: 1,
        checkedInByMe: false,
      },
      {
        id: randomUUID(),
        circleId: DEMO_CIRCLE_ID,
        title: "Sunday Brunch Circuit",
        date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        location: "Harbor Café",
        tags: ["food", "catch-up"],
        checkinCount: 0,
        shoppingCount: 0,
        claimedCount: 0,
        checkedInByMe: false,
      },
    ],
    shopping: [
      {
        id: randomUUID(),
        eventId: DEMO_EVENT_ID,
        itemName: "Blanket stack",
        quantity: "3",
        claimerId: DEMO_FRIEND_ID,
        claimerName: "Jordan Lee",
      },
      {
        id: randomUUID(),
        eventId: DEMO_EVENT_ID,
        itemName: "Popcorn cans",
        quantity: "4",
        claimerId: null,
        claimerName: null,
      },
      {
        id: randomUUID(),
        eventId: DEMO_EVENT_ID,
        itemName: "Citronella candles",
        quantity: "2",
        claimerId: null,
        claimerName: null,
      },
    ],
    photos: [
      {
        id: DEMO_PHOTO_ID,
        circleId: DEMO_CIRCLE_ID,
        uploaderId: DEMO_FRIEND_ID,
        uploaderName: "Jordan Lee",
        mimeType: "image/png",
        createdAt: now.toISOString(),
        captionHint: "Last summer hike",
      },
    ],
    leaderboard: [
      {
        userId: DEMO_FRIEND_ID,
        name: "Jordan Lee",
        nickname: "Spark",
        totalPoints: 42,
        breakdown: { game_win: 20, event_attendance: 12, custom: 10 },
      },
      {
        userId: DEMO_USER_ID,
        name: "Alex Rivera",
        nickname: "Orbit Captain",
        totalPoints: 37,
        breakdown: { game_win: 15, event_attendance: 14, roast_toast: 8 },
      },
      {
        userId: DEMO_FRIEND_2,
        name: "Sam Okonkwo",
        nickname: "Midnight",
        totalPoints: 29,
        breakdown: { game_win: 10, event_attendance: 11, custom: 8 },
      },
    ],
    tabs: [
      {
        id: randomUUID(),
        circleId: DEMO_CIRCLE_ID,
        payerId: DEMO_USER_ID,
        payerName: "Alex Rivera",
        amount: 86.4,
        description: "Dinner at Harbor",
        createdAt: now.toISOString(),
      },
      {
        id: randomUUID(),
        circleId: DEMO_CIRCLE_ID,
        payerId: DEMO_FRIEND_ID,
        payerName: "Jordan Lee",
        amount: 42,
        description: "Rideshare pool",
        createdAt: now.toISOString(),
      },
      {
        id: randomUUID(),
        circleId: DEMO_CIRCLE_ID,
        payerId: DEMO_FRIEND_2,
        payerName: "Sam Okonkwo",
        amount: 27.5,
        description: "Snacks run",
        createdAt: now.toISOString(),
      },
    ],
    roastToasts: [
      {
        id: randomUUID(),
        circleId: DEMO_CIRCLE_ID,
        kind: "toast",
        body: "To the friend who always brings the aux cord and the chaos.",
        voteScore: 4,
        createdAt: now.toISOString(),
        myVote: null,
      },
      {
        id: randomUUID(),
        circleId: DEMO_CIRCLE_ID,
        kind: "roast",
        body: "Someone still thinks 'fashionably late' means the next calendar day.",
        voteScore: 2,
        createdAt: now.toISOString(),
        myVote: null,
      },
    ],
    games: [
      {
        id: randomUUID(),
        circleId: DEMO_CIRCLE_ID,
        gameType: "mafia",
        status: "lobby",
        state: createInitialState("mafia") as unknown as Record<string, unknown>,
        updatedAt: now.toISOString(),
      },
    ],
    sessions: new Set<string>(),
    photoBytes: new Map([[DEMO_PHOTO_ID, buildDemoPng()]]),
  };
}

export const DEMO_COOKIE = "circle_demo_session";

const globalDemo = globalThis as unknown as { __circleDemo?: DemoStore };

function demoSecret(): string {
  return (
    process.env.AUTH_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "circle-demo-secret"
  );
}

export function demoLogin(): { token: string; user: CircleUser } {
  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const payload = `demo.${exp}.${randomUUID()}`;
  const sig = createHmac("sha256", demoSecret()).update(payload).digest("base64url");
  return { token: `${payload}.${sig}`, user: getDemoUser() };
}

export function demoLogout(_token: string | undefined): void {
  // Stateless signed cookies — clearing the cookie is enough.
}

export function isDemoSession(token: string | undefined): boolean {
  if (!token) return false;
  const idx = token.lastIndexOf(".");
  if (idx <= 0) return false;
  const payload = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expected = createHmac("sha256", demoSecret()).update(payload).digest("base64url");
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  } catch {
    return false;
  }
  const exp = Number(payload.split(".")[1]);
  return Number.isFinite(exp) && Date.now() <= exp;
}

export function getDemoStore(): DemoStore {
  if (!globalDemo.__circleDemo) {
    globalDemo.__circleDemo = createStore();
  }
  return globalDemo.__circleDemo;
}

export function getDemoUser(): CircleUser {
  return getDemoStore().user;
}

export function getDemoCircle(): CircleSummary {
  return getDemoStore().circle;
}

export function getDemoMembers(): CircleMemberView[] {
  return getDemoStore().members;
}

export function getDemoEvents(): EventView[] {
  return getDemoStore().events;
}

export function getDemoEvent(id: string): EventView | undefined {
  return getDemoStore().events.find((event) => event.id === id);
}

export function getDemoShopping(eventId: string): ShoppingItemView[] {
  return getDemoStore().shopping.filter((item) => item.eventId === eventId);
}

export function claimDemoItem(itemId: string, userId: string): ShoppingItemView | null {
  const store = getDemoStore();
  const item = store.shopping.find((entry) => entry.id === itemId);
  if (!item) return null;
  const member = store.members.find((m) => m.userId === userId);
  item.claimerId = userId;
  item.claimerName = member?.name ?? "Member";
  const event = store.events.find((e) => e.id === item.eventId);
  if (event) {
    event.claimedCount = store.shopping.filter(
      (s) => s.eventId === event.id && s.claimerId
    ).length;
  }
  return item;
}

export function checkInDemo(eventId: string, userId: string): EventView | null {
  const store = getDemoStore();
  const event = store.events.find((e) => e.id === eventId);
  if (!event) return null;
  if (!event.checkedInByMe && userId === store.user.id) {
    event.checkedInByMe = true;
    event.checkinCount += 1;
  }
  return event;
}

export function getDemoPhotos(): PhotoView[] {
  return getDemoStore().photos;
}

export function getDemoPhotoBytes(id: string): Uint8Array | null {
  return getDemoStore().photoBytes.get(id) ?? null;
}

export function getDemoLeaderboard(): LeaderboardRow[] {
  return [...getDemoStore().leaderboard].sort((a, b) => b.totalPoints - a.totalPoints);
}

export function getDemoTabs(): TabEntryView[] {
  return getDemoStore().tabs;
}

export function addDemoTab(input: {
  payerId: string;
  payerName: string;
  amount: number;
  description: string;
}): TabEntryView {
  const entry: TabEntryView = {
    id: randomUUID(),
    circleId: DEMO_CIRCLE_ID,
    payerId: input.payerId,
    payerName: input.payerName,
    amount: input.amount,
    description: input.description,
    createdAt: new Date().toISOString(),
  };
  getDemoStore().tabs.unshift(entry);
  return entry;
}

export function getDemoRoasts(): RoastToastView[] {
  return getDemoStore().roastToasts;
}

export function addDemoRoast(input: {
  kind: "roast" | "toast";
  body: string;
}): RoastToastView {
  const entry: RoastToastView = {
    id: randomUUID(),
    circleId: DEMO_CIRCLE_ID,
    kind: input.kind,
    body: input.body,
    voteScore: 0,
    createdAt: new Date().toISOString(),
    myVote: null,
  };
  getDemoStore().roastToasts.unshift(entry);
  return entry;
}

export function voteDemoRoast(
  id: string,
  value: number
): RoastToastView | null {
  const entry = getDemoStore().roastToasts.find((r) => r.id === id);
  if (!entry) return null;
  if (entry.myVote !== null) {
    entry.voteScore -= entry.myVote;
  }
  entry.myVote = value;
  entry.voteScore += value;
  return entry;
}

export function getDemoGames(): GameSessionView[] {
  return getDemoStore().games;
}

export function getDemoGame(id: string): GameSessionView | undefined {
  return getDemoStore().games.find((g) => g.id === id);
}

export function createDemoGame(gameType: GameType): GameSessionView {
  const session: GameSessionView = {
    id: randomUUID(),
    circleId: DEMO_CIRCLE_ID,
    gameType,
    status: "lobby",
    state: createInitialState(gameType) as unknown as Record<string, unknown>,
    updatedAt: new Date().toISOString(),
  };
  getDemoStore().games.unshift(session);
  return session;
}

export function updateDemoGame(
  id: string,
  state: Record<string, unknown>,
  status?: GameSessionView["status"]
): GameSessionView | null {
  const game = getDemoStore().games.find((g) => g.id === id);
  if (!game) return null;
  game.state = state;
  if (status) game.status = status;
  game.updatedAt = new Date().toISOString();
  return game;
}

export function updateDemoNickname(
  targetId: string,
  nickname: string
): CircleMemberView | null {
  const member = getDemoStore().members.find((m) => m.userId === targetId);
  if (!member) return null;
  member.nickname = nickname;
  const row = getDemoStore().leaderboard.find((l) => l.userId === targetId);
  if (row) row.nickname = nickname;
  return member;
}
