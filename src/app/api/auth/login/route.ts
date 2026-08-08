import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSiteUrl, isSupabaseConfigured } from "@/lib/config";
import { DEMO_COOKIE, demoLogin } from "@/lib/demo/store";
import { fail, ok } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      mode?: "google" | "demo" | "email";
      email?: string;
      password?: string;
      name?: string;
      intent?: "signin" | "signup";
    };

    const mode = body.mode ?? (isSupabaseConfigured() ? "google" : "demo");

    if (mode === "demo" || !isSupabaseConfigured()) {
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

    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    if (mode === "email") {
      const email = body.email?.trim().toLowerCase();
      const password = body.password ?? "";
      if (!email || password.length < 6) {
        return NextResponse.json(
          fail("Email and password (min 6 chars) are required"),
          { status: 400 }
        );
      }

      if (body.intent === "signup") {
        const displayName = body.name?.trim() || email.split("@")[0] || "Member";
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: displayName },
            emailRedirectTo: `${getSiteUrl()}/auth/callback`,
          },
        });
        if (error) {
          return NextResponse.json(fail(error.message), { status: 400 });
        }

        if (data.user) {
          await supabase.from("users").upsert({
            id: data.user.id,
            email,
            name: displayName,
            avatar_url: null,
          });
        }

        if (data.session) {
          return NextResponse.json(ok({ user: data.user, demo: false }));
        }

        return NextResponse.json(
          ok({
            demo: false,
            confirmEmail: true,
            message: "Check your email to confirm, then sign in.",
          })
        );
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        return NextResponse.json(fail(error.message), { status: 400 });
      }
      return NextResponse.json(ok({ user: data.user, demo: false }));
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${getSiteUrl()}/auth/callback`,
      },
    });

    if (error || !data.url) {
      return NextResponse.json(fail(error?.message ?? "Google sign-in failed"), {
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
