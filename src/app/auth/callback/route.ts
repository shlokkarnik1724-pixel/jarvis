import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/config";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await supabase.from("users").upsert({
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "Member",
          avatar_url: user.user_metadata?.avatar_url ?? null,
        });
      }

      return NextResponse.redirect(`${getSiteUrl()}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
