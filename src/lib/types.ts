export type MemberRole = "owner" | "admin" | "member";
export type GameType = "mafia" | "trivia" | "prediction_league" | "myth_buster";
export type GameStatus = "lobby" | "active" | "completed" | "cancelled";
export type ScoreType =
  | "game_win"
  | "event_attendance"
  | "custom"
  | "roast_toast"
  | "poll_win"
  | "bingo_win"
  | "hydration"
  | "debt_settled"
  | "vibe_check"
  | "joke_bump";

export interface CircleUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}

export interface CircleMemberView {
  userId: string;
  circleId: string;
  nickname: string | null;
  role: MemberRole;
  name: string;
  email: string;
  avatarUrl: string | null;
}

export interface CircleSummary {
  id: string;
  name: string;
  inviteCode: string;
}

export interface EventView {
  id: string;
  circleId: string;
  title: string;
  date: string;
  location: string | null;
  tags: string[];
  checkinCount: number;
  shoppingCount: number;
  claimedCount: number;
  checkedInByMe: boolean;
}

export interface ShoppingItemView {
  id: string;
  eventId: string;
  itemName: string;
  quantity: string | null;
  claimerId: string | null;
  claimerName: string | null;
}

export interface PhotoView {
  id: string;
  circleId: string;
  uploaderId: string;
  uploaderName: string;
  mimeType: string;
  createdAt: string;
  captionHint: string | null;
}

export interface LeaderboardRow {
  userId: string;
  name: string;
  nickname: string | null;
  totalPoints: number;
  breakdown: Partial<Record<ScoreType, number>>;
  title?: string | null;
}

export interface TabEntryView {
  id: string;
  circleId: string;
  payerId: string;
  payerName: string;
  amount: number;
  description: string;
  createdAt: string;
}

export interface Settlement {
  fromUserId: string;
  fromName: string;
  toUserId: string;
  toName: string;
  amount: number;
}

export interface RoastToastView {
  id: string;
  circleId: string;
  kind: "roast" | "toast";
  body: string;
  voteScore: number;
  createdAt: string;
  myVote: number | null;
}

export interface GameSessionView {
  id: string;
  circleId: string;
  gameType: GameType;
  status: GameStatus;
  state: Record<string, unknown>;
  updatedAt: string;
}

export interface SessionContext {
  user: CircleUser;
  circle: CircleSummary | null;
  membership: CircleMemberView | null;
  demo: boolean;
}

/** Daily mood ring around a member avatar. */
export interface VibeCheckView {
  userId: string;
  circleId: string;
  emoji: string;
  label: string;
  dayKey: string;
  expiresAt: string;
  displayName: string;
}

export interface InsideJokeView {
  id: string;
  circleId: string;
  term: string;
  definition: string;
  addedByName: string;
  usageCount: number;
  createdAt: string;
}

export interface PointsLedgerEntry {
  id: string;
  userId: string;
  circleId: string;
  delta: number;
  reason: string;
  scoreType: ScoreType;
  createdAt: string;
}

export interface MostLikelyPollView {
  id: string;
  circleId: string;
  prompt: string;
  createdByName: string;
  createdAt: string;
  closesAt: string;
  closed: boolean;
  myVoteUserId: string | null;
  tallies: Array<{ userId: string; name: string; votes: number }>;
  winnerUserId: string | null;
}

export interface ConfessionView {
  id: string;
  circleId: string;
  text: string;
  createdAt: string;
  reactions: { fire: number; skull: number };
  myReaction: "fire" | "skull" | null;
}

export interface BingoCardView {
  id: string;
  eventId: string;
  eventTitle: string;
  userId: string;
  grid: string[];
  marked: boolean[];
  hasBingo: boolean;
  createdAt: string;
}

export type RecoverySeverity = "light" | "medium" | "heavy";
export type WellnessStatus = "fine" | "rough" | "help";

export interface RecoveryTask {
  text: string;
  done: boolean;
}

export interface RecoveryPlanView {
  id: string;
  userId: string;
  eventId: string;
  eventTitle: string;
  severity: RecoverySeverity;
  drinkCount: number;
  tasks: RecoveryTask[];
  symptoms: string[];
  remedies: string[];
  wellness: WellnessStatus | null;
  hydrationGlasses: number;
  hydrationStreak: number;
  kit: Array<{ name: string; qty: number; bought: boolean }>;
  createdAt: string;
}

export interface SnackCountView {
  snackName: string;
  count: number;
  updatedAt: string;
}

export interface GifPinView {
  id: string;
  circleId: string;
  url: string;
  title: string;
  pinnedByName: string;
  createdAt: string;
}

export interface CircleStreakView {
  current: number;
  best: number;
  lastCheckInDay: string | null;
  checkedInToday: boolean;
}

export interface SuperlativeView {
  emoji: string;
  title: string;
  userId: string;
  name: string;
  reason: string;
}

export interface TruthDareCard {
  id: string;
  kind: "truth" | "dare";
  text: string;
  custom: boolean;
}
