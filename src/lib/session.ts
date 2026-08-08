import { cookies } from "next/headers";
import { DEMO_MODE, isSupabaseConfigured } from "@/lib/config";
import {
  DEMO_COOKIE,
  getDemoCircle,
  getDemoMembers,
  getDemoUser,
  isDemoSession,
} from "@/lib/demo/store";
import { createClient } from "@/lib/supabase/server";
import type { SessionContext } from "@/lib/types";

export async function getSessionContext(): Promise<SessionContext | null> {
  if (DEMO_MODE || !isSupabaseConfigured()) {
    const cookieStore = await cookies();
    const token = cookieStore.get(DEMO_COOKIE)?.value;
    if (!isDemoSession(token)) return null;
    const user = getDemoUser();
    const circle = getDemoCircle();
    const membership = getDemoMembers().find((m) => m.userId === user.id) ?? null;
    return { user, circle, membership, demo: true };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("id, email, name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const { data: membership } = await supabase
    .from("circle_members")
    .select("circle_id, user_id, nickname, role, circles(id, name, invite_code)")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  const circleRelation = membership?.circles as
    | { id: string; name: string; invite_code: string }
    | { id: string; name: string; invite_code: string }[]
    | null
    | undefined;

  const circleRow = Array.isArray(circleRelation)
    ? circleRelation[0]
    : circleRelation;

  return {
    user: {
      id: user.id,
      email: profile?.email ?? user.email ?? "",
      name: profile?.name ?? user.user_metadata?.full_name ?? "Member",
      avatarUrl: profile?.avatar_url ?? user.user_metadata?.avatar_url ?? null,
    },
    circle: circleRow
      ? {
          id: circleRow.id,
          name: circleRow.name,
          inviteCode: circleRow.invite_code,
        }
      : null,
    membership: membership
      ? {
          circleId: membership.circle_id,
          userId: membership.user_id,
          nickname: membership.nickname,
          role: membership.role,
          name: profile?.name ?? "Member",
          email: profile?.email ?? user.email ?? "",
          avatarUrl: profile?.avatar_url ?? null,
        }
      : null,
    demo: false,
  };
}

export function requireCircleId(session: SessionContext): string {
  if (!session.circle?.id) {
    throw new Error("No circle membership");
  }
  return session.circle.id;
}
