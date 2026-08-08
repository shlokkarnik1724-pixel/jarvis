export type MemberRole = "owner" | "admin" | "member";
export type GameType = "mafia" | "trivia" | "prediction_league" | "myth_buster";
export type GameStatus = "lobby" | "active" | "completed" | "cancelled";
export type ScoreType = "game_win" | "event_attendance" | "custom" | "roast_toast";

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
