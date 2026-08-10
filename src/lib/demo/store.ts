import { createHmac, randomUUID, timingSafeEqual } from "crypto";
import type {
  CircleMemberView,
  CircleSummary,
  CircleUser,
  EventRsvpStatus,
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

export const DEMO_USER_ID = "11111111-1111-4111-8111-111111111111";
export const DEMO_CIRCLE_ID = "22222222-2222-4222-8222-222222222222";
export const DEMO_EVENT_ID = "33333333-3333-4333-8333-333333333333";
const DEMO_PHOTO_ID = "44444444-4444-4444-8444-444444444444";
export const DEMO_MEET_ID = "55555555-5555-4555-8555-555555555555";
export const DEMO_ARYAN_ID = "66666666-6666-4666-8666-666666666666";
export const DEMO_ADITYA_ID = "77777777-7777-4777-8777-777777777777";
export const DEMO_DARSHAN_ID = "88888888-8888-4888-8888-888888888888";
export const DEMO_KEDAR_ID = "99999999-9999-4999-8999-999999999999";
export const DEMO_KRISHNA_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

const DEMO_STORE_VERSION = 4;

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
  const base64 =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
  return Uint8Array.from(Buffer.from(base64, "base64"));
}

function createStore(): DemoStore {
  const now = new Date();
  const weekend = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  const members: CircleMemberView[] = [
    {
      userId: DEMO_USER_ID,
      circleId: DEMO_CIRCLE_ID,
      nickname: "Main Character",
      role: "owner",
      name: "Shlok Karnik",
      email: "shlok@circle.local",
      avatarUrl: null,
    },
    {
      userId: DEMO_MEET_ID,
      circleId: DEMO_CIRCLE_ID,
      nickname: "MIT",
      role: "member",
      name: "Meet Shinde",
      email: "meet@circle.local",
      avatarUrl: null,
    },
    {
      userId: DEMO_ARYAN_ID,
      circleId: DEMO_CIRCLE_ID,
      nickname: "Rev",
      role: "member",
      name: "Aryan Revankar",
      email: "aryan@circle.local",
      avatarUrl: null,
    },
    {
      userId: DEMO_ADITYA_ID,
      circleId: DEMO_CIRCLE_ID,
      nickname: "Khalil",
      role: "member",
      name: "Aditya Khalil",
      email: "aditya@circle.local",
      avatarUrl: null,
    },
    {
      userId: DEMO_DARSHAN_ID,
      circleId: DEMO_CIRCLE_ID,
      nickname: "Darsh",
      role: "member",
      name: "Darshan",
      email: "darshan@circle.local",
      avatarUrl: null,
    },
    {
      userId: DEMO_KEDAR_ID,
      circleId: DEMO_CIRCLE_ID,
      nickname: "KP",
      role: "member",
      name: "Kedar Prabhu",
      email: "kedar@circle.local",
      avatarUrl: null,
    },
    {
      userId: DEMO_KRISHNA_ID,
      circleId: DEMO_CIRCLE_ID,
      nickname: "Hemgude",
      role: "member",
      name: "Krishna Hemgude",
      email: "krishna@circle.local",
      avatarUrl: null,
    },
  ];

  const rsvps = [
    { userId: DEMO_USER_ID, name: "Shlok Karnik", status: "yes" as const },
    { userId: DEMO_MEET_ID, name: "Meet Shinde", status: "yes" as const },
    { userId: DEMO_ARYAN_ID, name: "Aryan Revankar", status: "maybe" as const },
    { userId: DEMO_ADITYA_ID, name: "Aditya Khalil", status: "yes" as const },
    { userId: DEMO_DARSHAN_ID, name: "Darshan", status: "yes" as const },
    { userId: DEMO_KEDAR_ID, name: "Kedar Prabhu", status: "no" as const },
    { userId: DEMO_KRISHNA_ID, name: "Krishna Hemgude", status: "maybe" as const },
  ];

  return {
    user: {
      id: DEMO_USER_ID,
      email: "shlok@circle.local",
      name: "Shlok Karnik",
      avatarUrl: null,
    },
    circle: {
      id: DEMO_CIRCLE_ID,
      name: "Shlok's Circle",
      inviteCode: "shlok7",
    },
    members,
    events: [
      {
        id: DEMO_EVENT_ID,
        circleId: DEMO_CIRCLE_ID,
        title: "Friday Night Chaos",
        date: weekend.toISOString(),
        location: "Kedar's terrace · Andheri vibes",
        tags: ["drinks", "sutta", "playlist"],
        checkinCount: 2,
        shoppingCount: 5,
        claimedCount: 2,
        checkedInByMe: false,
        hostId: DEMO_KEDAR_ID,
        hostName: "Kedar Prabhu",
        rsvps,
        myRsvp: "yes",
      },
      {
        id: randomUUID(),
        circleId: DEMO_CIRCLE_ID,
        title: "Sunday Recovery Brunch",
        date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        location: "Bandra café crawl",
        tags: ["food", "hangover"],
        checkinCount: 0,
        shoppingCount: 0,
        claimedCount: 0,
        checkedInByMe: false,
        hostId: DEMO_USER_ID,
        hostName: "Shlok Karnik",
        rsvps: [],
        myRsvp: null,
      },
    ],
    shopping: [
      {
        id: randomUUID(),
        eventId: DEMO_EVENT_ID,
        itemName: "Kingfisher / breezers",
        quantity: "2 packs",
        claimerId: DEMO_MEET_ID,
        claimerName: "Meet Shinde",
      },
      {
        id: randomUUID(),
        eventId: DEMO_EVENT_ID,
        itemName: "Ice + mixer",
        quantity: "lots",
        claimerId: DEMO_ARYAN_ID,
        claimerName: "Aryan Revankar",
      },
      {
        id: randomUUID(),
        eventId: DEMO_EVENT_ID,
        itemName: "Sutta pack (shared)",
        quantity: "2",
        claimerId: null,
        claimerName: null,
      },
      {
        id: randomUUID(),
        eventId: DEMO_EVENT_ID,
        itemName: "Chips + maggi",
        quantity: "enough for 7",
        claimerId: null,
        claimerName: null,
      },
      {
        id: randomUUID(),
        eventId: DEMO_EVENT_ID,
        itemName: "Bluetooth speaker",
        quantity: "1",
        claimerId: null,
        claimerName: null,
      },
    ],
    photos: [
      {
        id: DEMO_PHOTO_ID,
        circleId: DEMO_CIRCLE_ID,
        uploaderId: DEMO_MEET_ID,
        uploaderName: "Meet Shinde",
        mimeType: "image/png",
        createdAt: now.toISOString(),
        captionHint: "Last rooftop night",
      },
    ],
    leaderboard: [
      {
        userId: DEMO_MEET_ID,
        name: "Meet Shinde",
        nickname: "MIT",
        totalPoints: 48,
        breakdown: { game_win: 20, event_attendance: 16, custom: 12 },
      },
      {
        userId: DEMO_USER_ID,
        name: "Shlok Karnik",
        nickname: "Main Character",
        totalPoints: 44,
        breakdown: { game_win: 18, event_attendance: 14, roast_toast: 12 },
      },
      {
        userId: DEMO_ARYAN_ID,
        name: "Aryan Revankar",
        nickname: "Rev",
        totalPoints: 36,
        breakdown: { game_win: 14, event_attendance: 12, custom: 10 },
      },
      {
        userId: DEMO_ADITYA_ID,
        name: "Aditya Khalil",
        nickname: "Khalil",
        totalPoints: 31,
        breakdown: { game_win: 12, event_attendance: 11, custom: 8 },
      },
      {
        userId: DEMO_DARSHAN_ID,
        name: "Darshan",
        nickname: "Darsh",
        totalPoints: 28,
        breakdown: { game_win: 10, event_attendance: 10, custom: 8 },
      },
      {
        userId: DEMO_KEDAR_ID,
        name: "Kedar Prabhu",
        nickname: "KP",
        totalPoints: 27,
        breakdown: { game_win: 8, event_attendance: 12, custom: 7 },
      },
      {
        userId: DEMO_KRISHNA_ID,
        name: "Krishna Hemgude",
        nickname: "Hemgude",
        totalPoints: 22,
        breakdown: { game_win: 8, event_attendance: 8, custom: 6 },
      },
    ],
    tabs: [
      {
        id: randomUUID(),
        circleId: DEMO_CIRCLE_ID,
        payerId: DEMO_USER_ID,
        payerName: "Shlok Karnik",
        amount: 2400,
        description: "Friday liquor haul",
        createdAt: now.toISOString(),
      },
      {
        id: randomUUID(),
        circleId: DEMO_CIRCLE_ID,
        payerId: DEMO_MEET_ID,
        payerName: "Meet Shinde",
        amount: 980,
        description: "Uber pool + snacks",
        createdAt: now.toISOString(),
      },
      {
        id: randomUUID(),
        circleId: DEMO_CIRCLE_ID,
        payerId: DEMO_ARYAN_ID,
        payerName: "Aryan Revankar",
        amount: 650,
        description: "Sutta + ice run",
        createdAt: now.toISOString(),
      },
      {
        id: randomUUID(),
        circleId: DEMO_CIRCLE_ID,
        payerId: DEMO_ADITYA_ID,
        payerName: "Aditya Khalil",
        amount: 1200,
        description: "Dinner before the hang",
        createdAt: now.toISOString(),
      },
      {
        id: randomUUID(),
        circleId: DEMO_CIRCLE_ID,
        payerId: DEMO_DARSHAN_ID,
        payerName: "Darshan",
        amount: 420,
        description: "Extra mixers",
        createdAt: now.toISOString(),
      },
      {
        id: randomUUID(),
        circleId: DEMO_CIRCLE_ID,
        payerId: DEMO_KEDAR_ID,
        payerName: "Kedar Prabhu",
        amount: 800,
        description: "Host supplies (cups, trash bags)",
        createdAt: now.toISOString(),
      },
      {
        id: randomUUID(),
        circleId: DEMO_CIRCLE_ID,
        payerId: DEMO_KRISHNA_ID,
        payerName: "Krishna Hemgude",
        amount: 350,
        description: "Late-night maggi",
        createdAt: now.toISOString(),
      },
    ],
    roastToasts: [
      {
        id: randomUUID(),
        circleId: DEMO_CIRCLE_ID,
        kind: "toast",
        body: "To Shlok for hosting the chaos and somehow surviving it.",
        voteScore: 5,
        createdAt: now.toISOString(),
        myVote: null,
      },
      {
        id: randomUUID(),
        circleId: DEMO_CIRCLE_ID,
        kind: "roast",
        body: "Meet still thinks 'one more sutta' means three.",
        voteScore: 4,
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

const globalDemo = globalThis as unknown as {
  __circleDemo?: DemoStore;
  __circleDemoVersion?: number;
};

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
  if (!globalDemo.__circleDemo || globalDemo.__circleDemoVersion !== DEMO_STORE_VERSION) {
    globalDemo.__circleDemo = createStore();
    globalDemo.__circleDemoVersion = DEMO_STORE_VERSION;
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

export function addDemoShoppingItem(input: {
  eventId: string;
  itemName: string;
  quantity?: string;
}): ShoppingItemView | null {
  const store = getDemoStore();
  const event = store.events.find((e) => e.id === input.eventId);
  if (!event) return null;
  const item: ShoppingItemView = {
    id: randomUUID(),
    eventId: input.eventId,
    itemName: input.itemName.trim(),
    quantity: input.quantity?.trim() || null,
    claimerId: null,
    claimerName: null,
  };
  store.shopping.push(item);
  event.shoppingCount = store.shopping.filter((s) => s.eventId === event.id).length;
  return item;
}

export function setDemoRsvp(
  eventId: string,
  userId: string,
  status: EventRsvpStatus
): EventView | null {
  const store = getDemoStore();
  const event = store.events.find((e) => e.id === eventId);
  if (!event) return null;
  const member = store.members.find((m) => m.userId === userId);
  const name = member?.name ?? "Member";
  event.rsvps = event.rsvps.filter((r) => r.userId !== userId);
  event.rsvps.push({ userId, name, status });
  if (userId === store.user.id) event.myRsvp = status;
  return event;
}

export function setDemoHost(eventId: string, hostId: string): EventView | null {
  const store = getDemoStore();
  const event = store.events.find((e) => e.id === eventId);
  if (!event) return null;
  const member = store.members.find((m) => m.userId === hostId);
  if (!member) return null;
  event.hostId = hostId;
  event.hostName = member.name;
  return event;
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
