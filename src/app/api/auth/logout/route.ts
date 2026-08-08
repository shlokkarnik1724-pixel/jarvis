import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { DEMO_MODE, getSiteUrl, isSupabaseConfigured } from "@/lib/config";
import { DEMO_COOKIE, demoLogout } from "@/lib/demo/store";
import { fail, ok } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const site = getSiteUrl();
    const wantsJson = request.headers.get("accept")?.includes("application/json");

    if (DEMO_MODE || !isSupabaseConfigured()) {
      const cookieStore = await cookies();
      const token = cookieStore.get(DEMO_COOKIE)?.value;
      demoLogout(token);
      cookieStore.delete(DEMO_COOKIE);
      if (wantsJson) {
        return NextResponse.json(ok({ signedOut: true }));
      }
      return NextResponse.redirect(new URL("/login", site), { status: 303 });
    }

    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    await supabase.auth.signOut();

    if (wantsJson) {
      return NextResponse.json(ok({ signedOut: true }));
    }
    return NextResponse.redirect(new URL("/login", site), { status: 303 });
  } catch (error) {
    return NextResponse.json(
      fail(error instanceof Error ? error.message : "Logout failed"),
      { status: 500 }
    );
  }
}
