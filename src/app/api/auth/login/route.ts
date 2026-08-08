import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { DEMO_MODE } from "@/lib/config";
import { DEMO_COOKIE, demoLogin } from "@/lib/demo/store";
import { createClient } from "@/lib/supabase/server";
import { fail, ok } from "@/lib/utils";
import { getSiteUrl } from "@/lib/config";

export async function POST() {
  try {
    if (DEMO_MODE) {
      const { token, user } = demoLogin();
      const cookieStore = await cookies();
      cookieStore.set(DEMO_COOKIE, token, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
      return NextResponse.json(ok({ user, demo: true }));
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${getSiteUrl()}/auth/callback`,
      },
    });

    if (error || !data.url) {
      return NextResponse.json(fail(error?.message ?? "OAuth failed"), {
        status: 400,
      });
    }

    return NextResponse.json(ok({ url: data.url, demo: false }));
  } catch (error) {
    return NextResponse.json(
      fail(error instanceof Error ? error.message : "Login failed"),
      { status: 500 }
    );
  }
}
