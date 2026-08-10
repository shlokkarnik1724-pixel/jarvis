import { createClient, createServiceClient } from "@/lib/supabase/server";
import type {
  EventView,
  GameSessionView,
  GameType,
  LeaderboardRow,
  PhotoView,
  RoastToastView,
  ScoreType,
  ShoppingItemView,
  TabEntryView,
  CircleMemberView,
} from "@/lib/types";
import { createInitialState } from "@/lib/games/state-machine";

export async function ensureUserProfile(input: {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("users").upsert({
    id: input.id,
    email: input.email,
    name: input.name,
    avatar_url: input.avatarUrl ?? null,
  });
  if (error) throw new Error(error.message);
}

export async function createCircleForUser(input: {
  userId: string;
  name: string;
  ownerName: string;
  ownerEmail: string;
  avatarUrl?: string | null;
}) {
  await ensureUserProfile({
    id: input.userId,
    email: input.ownerEmail,
    name: input.ownerName,
    avatarUrl: input.avatarUrl,
  });

  const service = await createServiceClient();
  const { data: circle, error: circleError } = await service
    .from("circles")
    .insert({ name: input.name.trim() })
    .select("id, name, invite_code")
    .single();

  if (circleError || !circle) {
    throw new Error(circleError?.message ?? "Failed to create circle");
  }

  const { error: memberError } = await service.from("circle_members").insert({
    circle_id: circle.id,
    user_id: input.userId,
    nickname: input.ownerName.split(" ")[0] || "Owner",
    role: "owner",
  });

  if (memberError) {
    throw new Error(memberError.message);
  }

  return {
    id: circle.id as string,
    name: circle.name as string,
    inviteCode: circle.invite_code as string,
  };
}

export async function joinCircleByInvite(input: {
  userId: string;
  inviteCode: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
}) {
  await ensureUserProfile({
    id: input.userId,
    email: input.email,
    name: input.name,
    avatarUrl: input.avatarUrl,
  });

  const service = await createServiceClient();
  const { data: circles, error } = await service.rpc("get_circle_by_invite", {
    code: input.inviteCode.trim(),
  });

  const circle = Array.isArray(circles) ? circles[0] : circles;
  if (error || !circle) {
    throw new Error("Invalid invite code");
  }

  const { error: memberError } = await service.from("circle_members").upsert({
    circle_id: circle.id,
    user_id: input.userId,
    nickname: input.name.split(" ")[0] || "Member",
    role: "member",
  });

  if (memberError) {
    throw new Error(memberError.message);
  }

  return {
    id: circle.id as string,
    name: circle.name as string,
    inviteCode: circle.invite_code as string,
  };
}

export async function listMembers(circleId: string): Promise<CircleMemberView[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("circle_members")
    .select("circle_id, user_id, nickname, role, users(id, email, name, avatar_url)")
    .eq("circle_id", circleId);

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
    const user = Array.isArray(row.users) ? row.users[0] : row.users;
    return {
      circleId: row.circle_id,
      userId: row.user_id,
      nickname: row.nickname,
      role: row.role,
      name: user?.name ?? "Member",
      email: user?.email ?? "",
      avatarUrl: user?.avatar_url ?? null,
    };
  });
}

export async function listEvents(
  circleId: string,
  userId: string
): Promise<EventView[]> {
  const supabase = await createClient();
  const { data: events, error } = await supabase
    .from("events")
    .select("id, circle_id, title, date, location, tags")
    .eq("circle_id", circleId)
    .order("date", { ascending: true });

  if (error) throw new Error(error.message);
  if (!events?.length) return [];

  const eventIds = events.map((e) => e.id);
  const [{ data: checkins }, { data: shopping }] = await Promise.all([
    supabase.from("event_checkins").select("event_id, user_id").in("event_id", eventIds),
    supabase
      .from("shopping_list_items")
      .select("event_id, claimer_id")
      .in("event_id", eventIds),
  ]);

  return events.map((event) => {
    const eventCheckins = (checkins ?? []).filter((c) => c.event_id === event.id);
    const eventShopping = (shopping ?? []).filter((s) => s.event_id === event.id);
    return {
      id: event.id,
      circleId: event.circle_id,
      title: event.title,
      date: event.date,
      location: event.location,
      tags: event.tags ?? [],
      checkinCount: eventCheckins.length,
      shoppingCount: eventShopping.length,
      claimedCount: eventShopping.filter((s) => s.claimer_id).length,
      checkedInByMe: eventCheckins.some((c) => c.user_id === userId),
      hostId: null,
      hostName: null,
      rsvps: [],
      myRsvp: null,
    };
  });
}

export async function getEventDetail(
  eventId: string,
  userId: string
): Promise<{ event: EventView; shopping: ShoppingItemView[] } | null> {
  const supabase = await createClient();
  const { data: event, error } = await supabase
    .from("events")
    .select("id, circle_id, title, date, location, tags")
    .eq("id", eventId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!event) return null;

  const [{ data: checkins }, { data: shopping }] = await Promise.all([
    supabase.from("event_checkins").select("user_id").eq("event_id", eventId),
    supabase
      .from("shopping_list_items")
      .select("id, event_id, item_name, quantity, claimer_id, users:claimer_id(name)")
      .eq("event_id", eventId)
      .order("created_at", { ascending: true }),
  ]);

  const shoppingViews: ShoppingItemView[] = (shopping ?? []).map((item) => {
    const claimer = Array.isArray(item.users) ? item.users[0] : item.users;
    return {
      id: item.id,
      eventId: item.event_id,
      itemName: item.item_name,
      quantity: item.quantity,
      claimerId: item.claimer_id,
      claimerName: claimer?.name ?? null,
    };
  });

  return {
    event: {
      id: event.id,
      circleId: event.circle_id,
      title: event.title,
      date: event.date,
      location: event.location,
      tags: event.tags ?? [],
      checkinCount: (checkins ?? []).length,
      shoppingCount: shoppingViews.length,
      claimedCount: shoppingViews.filter((s) => s.claimerId).length,
      checkedInByMe: (checkins ?? []).some((c) => c.user_id === userId),
      hostId: null,
      hostName: null,
      rsvps: [],
      myRsvp: null,
    },
    shopping: shoppingViews,
  };
}

export async function createEvent(input: {
  circleId: string;
  title: string;
  date: string;
  location?: string;
  tags?: string[];
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .insert({
      circle_id: input.circleId,
      title: input.title.trim(),
      date: input.date,
      location: input.location?.trim() || null,
      tags: input.tags ?? [],
    })
    .select("id, circle_id, title, date, location, tags")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to create event");
  return data;
}

export async function addShoppingItem(input: {
  eventId: string;
  itemName: string;
  quantity?: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shopping_list_items")
    .insert({
      event_id: input.eventId,
      item_name: input.itemName.trim(),
      quantity: input.quantity?.trim() || null,
    })
    .select("id, event_id, item_name, quantity, claimer_id")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to add item");
  return data;
}

export async function checkInEvent(eventId: string, userId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("event_checkins").upsert({
    event_id: eventId,
    user_id: userId,
  });
  if (error) throw new Error(error.message);
  return getEventDetail(eventId, userId);
}

export async function claimShoppingItem(
  eventId: string,
  itemId: string,
  userId: string
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shopping_list_items")
    .update({ claimer_id: userId })
    .eq("id", itemId)
    .eq("event_id", eventId)
    .select("id, event_id, item_name, quantity, claimer_id, users:claimer_id(name)")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to claim item");
  const claimer = Array.isArray(data.users) ? data.users[0] : data.users;
  return {
    id: data.id,
    eventId: data.event_id,
    itemName: data.item_name,
    quantity: data.quantity,
    claimerId: data.claimer_id,
    claimerName: claimer?.name ?? null,
  } satisfies ShoppingItemView;
}

export async function listPhotos(circleId: string): Promise<PhotoView[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("photos")
    .select("id, circle_id, uploader_id, mime_type, created_at, caption_enc, users:uploader_id(name)")
    .eq("circle_id", circleId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((photo) => {
    const uploader = Array.isArray(photo.users) ? photo.users[0] : photo.users;
    return {
      id: photo.id,
      circleId: photo.circle_id,
      uploaderId: photo.uploader_id,
      uploaderName: uploader?.name ?? "Member",
      mimeType: photo.mime_type,
      createdAt: photo.created_at,
      captionHint: photo.caption_enc ? "Encrypted caption" : null,
    };
  });
}

export async function listLeaderboard(circleId: string): Promise<LeaderboardRow[]> {
  const supabase = await createClient();
  const [{ data: scores, error }, members] = await Promise.all([
    supabase
      .from("leaderboard")
      .select("user_id, score_type, points")
      .eq("circle_id", circleId),
    listMembers(circleId),
  ]);

  if (error) throw new Error(error.message);

  const byUser = new Map<string, LeaderboardRow>();
  for (const member of members) {
    byUser.set(member.userId, {
      userId: member.userId,
      name: member.name,
      nickname: member.nickname,
      totalPoints: 0,
      breakdown: {},
    });
  }

  for (const row of scores ?? []) {
    const existing = byUser.get(row.user_id);
    const entry: LeaderboardRow = existing ?? {
      userId: row.user_id,
      name: "Member",
      nickname: null,
      totalPoints: 0,
      breakdown: {},
    };
    const type = row.score_type as ScoreType;
    const breakdown = { ...entry.breakdown };
    breakdown[type] = (breakdown[type] ?? 0) + row.points;
    entry.breakdown = breakdown;
    entry.totalPoints += row.points;
    byUser.set(row.user_id, entry);
  }

  return [...byUser.values()].sort((a, b) => b.totalPoints - a.totalPoints);
}

export async function listTabs(circleId: string): Promise<TabEntryView[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tab_tracker")
    .select("id, circle_id, payer_id, amount, description, created_at, users:payer_id(name)")
    .eq("circle_id", circleId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((tab) => {
    const payer = Array.isArray(tab.users) ? tab.users[0] : tab.users;
    return {
      id: tab.id,
      circleId: tab.circle_id,
      payerId: tab.payer_id,
      payerName: payer?.name ?? "Member",
      amount: Number(tab.amount),
      description: tab.description,
      createdAt: tab.created_at,
    };
  });
}

export async function addTab(input: {
  circleId: string;
  payerId: string;
  amount: number;
  description: string;
}): Promise<TabEntryView> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tab_tracker")
    .insert({
      circle_id: input.circleId,
      payer_id: input.payerId,
      amount: input.amount,
      description: input.description,
    })
    .select("id, circle_id, payer_id, amount, description, created_at, users:payer_id(name)")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to add tab");
  const payer = Array.isArray(data.users) ? data.users[0] : data.users;
  return {
    id: data.id,
    circleId: data.circle_id,
    payerId: data.payer_id,
    payerName: payer?.name ?? "Member",
    amount: Number(data.amount),
    description: data.description,
    createdAt: data.created_at,
  };
}

export async function listRoasts(
  circleId: string,
  userId: string
): Promise<RoastToastView[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("roast_toasts")
    .select("id, circle_id, kind, encrypted_body, iv, vote_score, created_at, roast_toast_votes(user_id, value)")
    .eq("circle_id", circleId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
    const votes = row.roast_toast_votes as Array<{ user_id: string; value: number }> | null;
    const mine = votes?.find((v) => v.user_id === userId)?.value ?? null;
    // Body is stored as plaintext for MVP join-friend use; encryption optional later
    return {
      id: row.id,
      circleId: row.circle_id,
      kind: row.kind as "roast" | "toast",
      body: row.encrypted_body,
      voteScore: row.vote_score,
      createdAt: row.created_at,
      myVote: mine,
    };
  });
}

export async function addRoast(input: {
  circleId: string;
  kind: "roast" | "toast";
  body: string;
}): Promise<RoastToastView> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("roast_toasts")
    .insert({
      circle_id: input.circleId,
      kind: input.kind,
      encrypted_body: input.body,
      iv: "plaintext",
      vote_score: 0,
    })
    .select("id, circle_id, kind, encrypted_body, vote_score, created_at")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to add roast/toast");
  return {
    id: data.id,
    circleId: data.circle_id,
    kind: data.kind as "roast" | "toast",
    body: data.encrypted_body,
    voteScore: data.vote_score,
    createdAt: data.created_at,
    myVote: null,
  };
}

export async function voteRoast(
  roastId: string,
  userId: string,
  value: number
): Promise<RoastToastView> {
  const supabase = await createClient();
  const vote = value === -1 ? -1 : 1;

  const { data: existing } = await supabase
    .from("roast_toast_votes")
    .select("value")
    .eq("roast_toast_id", roastId)
    .eq("user_id", userId)
    .maybeSingle();

  const { data: roast } = await supabase
    .from("roast_toasts")
    .select("id, circle_id, kind, encrypted_body, vote_score, created_at")
    .eq("id", roastId)
    .single();

  if (!roast) throw new Error("Entry not found");

  let nextScore = roast.vote_score;
  if (existing) {
    nextScore -= existing.value;
    await supabase
      .from("roast_toast_votes")
      .update({ value: vote })
      .eq("roast_toast_id", roastId)
      .eq("user_id", userId);
  } else {
    await supabase.from("roast_toast_votes").insert({
      roast_toast_id: roastId,
      user_id: userId,
      value: vote,
    });
  }
  nextScore += vote;

  await supabase.from("roast_toasts").update({ vote_score: nextScore }).eq("id", roastId);

  return {
    id: roast.id,
    circleId: roast.circle_id,
    kind: roast.kind as "roast" | "toast",
    body: roast.encrypted_body,
    voteScore: nextScore,
    createdAt: roast.created_at,
    myVote: vote,
  };
}

export async function updateNickname(input: {
  circleId: string;
  targetId: string;
  editorId: string;
  nickname: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("circle_members")
    .update({ nickname: input.nickname })
    .eq("circle_id", input.circleId)
    .eq("user_id", input.targetId)
    .select("circle_id, user_id, nickname, role, users(id, email, name, avatar_url)")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to update nickname");

  await supabase.from("nickname_history").insert({
    circle_id: input.circleId,
    target_id: input.targetId,
    editor_id: input.editorId,
    nickname: input.nickname,
  });

  const user = Array.isArray(data.users) ? data.users[0] : data.users;
  return {
    circleId: data.circle_id,
    userId: data.user_id,
    nickname: data.nickname,
    role: data.role,
    name: user?.name ?? "Member",
    email: user?.email ?? "",
    avatarUrl: user?.avatar_url ?? null,
  } satisfies CircleMemberView;
}

export async function listGames(circleId: string): Promise<GameSessionView[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("game_sessions")
    .select("id, circle_id, game_type, status, state, updated_at")
    .eq("circle_id", circleId)
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((game) => ({
    id: game.id,
    circleId: game.circle_id,
    gameType: game.game_type as GameType,
    status: game.status,
    state: (game.state ?? {}) as Record<string, unknown>,
    updatedAt: game.updated_at,
  }));
}

export async function createGame(circleId: string, gameType: GameType) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("game_sessions")
    .insert({
      circle_id: circleId,
      game_type: gameType,
      state: createInitialState(gameType),
      status: "lobby",
    })
    .select("id, circle_id, game_type, status, state, updated_at")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to create game");
  return {
    id: data.id,
    circleId: data.circle_id,
    gameType: data.game_type as GameType,
    status: data.status,
    state: (data.state ?? {}) as Record<string, unknown>,
    updatedAt: data.updated_at,
  } satisfies GameSessionView;
}

export async function getGame(gameId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("game_sessions")
    .select("id, circle_id, game_type, status, state, updated_at")
    .eq("id", gameId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return {
    id: data.id,
    circleId: data.circle_id,
    gameType: data.game_type as GameType,
    status: data.status,
    state: (data.state ?? {}) as Record<string, unknown>,
    updatedAt: data.updated_at,
  } satisfies GameSessionView;
}

export async function updateGame(
  gameId: string,
  state: Record<string, unknown>,
  status?: GameSessionView["status"]
) {
  const supabase = await createClient();
  const payload: Record<string, unknown> = { state };
  if (status) payload.status = status;

  const { data, error } = await supabase
    .from("game_sessions")
    .update(payload)
    .eq("id", gameId)
    .select("id, circle_id, game_type, status, state, updated_at")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to update game");
  return {
    id: data.id,
    circleId: data.circle_id,
    gameType: data.game_type as GameType,
    status: data.status,
    state: (data.state ?? {}) as Record<string, unknown>,
    updatedAt: data.updated_at,
  } satisfies GameSessionView;
}
