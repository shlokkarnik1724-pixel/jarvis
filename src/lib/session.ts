import { isSupabaseConfigured } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";
import { getSession as getLocalSession } from "@/lib/auth";
import type { SessionPayload } from "@/lib/types";

export type AppSession = SessionPayload & {
  mode: "supabase" | "local";
  avatarUrl?: string | null;
};

export async function getAppSession(): Promise<AppSession | null> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: membership } = await supabase
        .from("memberships")
        .select("organization_id, role")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      return {
        mode: "supabase",
        userId: user.id,
        email: user.email || "",
        name:
          profile?.full_name ||
          user.user_metadata?.full_name ||
          user.email?.split("@")[0] ||
          "User",
        organizationId: membership?.organization_id,
        role: membership?.role as "admin" | "member" | undefined,
        avatarUrl: profile?.avatar_url,
      };
    } catch {
      return null;
    }
  }

  const local = await getLocalSession();
  if (!local) return null;
  return { ...local, mode: "local" };
}
