"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { Button, Input, Label } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.2 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.5-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.2 6.1 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.2 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.2-3.5 5.7-6.1 7.1l.1.1 6.2 5.2C37.8 38.3 44 33 44 24c0-1.3-.1-2.5-.4-3.5z"
      />
    </svg>
  );
}

function AuthForm({
  mode,
  supabaseEnabled,
}: {
  mode: "login" | "signup";
  supabaseEnabled: boolean;
}) {
  const router = useRouter();
  const search = useSearchParams();
  const [error, setError] = useState(search.get("error") ? "Authentication failed. Try again." : "");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [info, setInfo] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "").trim();
    const password = String(fd.get("password") || "");
    const name = String(fd.get("name") || "");

    try {
      if (supabaseEnabled) {
        const supabase = createClient();
        if (mode === "signup") {
          const { data, error: err } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { full_name: name },
              emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
            },
          });
          if (err) throw err;
          if (data.session) {
            router.push("/onboarding");
            router.refresh();
            return;
          }
          setInfo(
            "Check your email to confirm your account, then log in. (You can disable email confirm in Supabase Auth settings for faster demos.)"
          );
          setLoading(false);
          return;
        }

        const { error: err } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (err) throw err;
        router.push(search.get("next") || "/brain");
        router.refresh();
        return;
      }

      // Local fallback API
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          mode === "signup"
            ? { name, email, password }
            : { email, password }
        ),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Auth failed");
      router.push(data.needsOnboarding ? "/onboarding" : search.get("next") || "/brain");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  async function signInWithGoogle() {
    if (!supabaseEnabled) {
      setError(
        "Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, then enable Google in Supabase Auth → Providers."
      );
      return;
    }
    setGoogleLoading(true);
    setError("");
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
          queryParams: { access_type: "offline", prompt: "consent" },
        },
      });
      if (err) throw err;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed");
      setGoogleLoading(false);
    }
  }

  return (
    <div className="atmosphere min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="font-display text-2xl tracking-tight">
          Tactix <span className="text-[var(--accent)]">AI</span>
        </Link>
        <h1 className="mt-8 font-display text-3xl tracking-tight">
          {mode === "signup" ? "Create your account" : "Sign in to your company brain"}
        </h1>
        <p className="mt-2 text-sm text-[var(--ink-muted)]">
          {supabaseEnabled
            ? "Secured with Supabase Auth · email or Google"
            : "Local auth mode — connect Supabase for Google login & cloud sync"}
        </p>

        {!supabaseEnabled && (
          <div className="mt-4 rounded-md border border-[var(--warn)]/30 bg-[var(--warn-soft)] px-3 py-2 text-xs text-[var(--warn)]">
            Supabase keys not detected.{" "}
            <Link href="/setup" className="underline font-medium">
              Connect Supabase + Google Auth →
            </Link>
          </div>
        )}

        <button
          type="button"
          onClick={signInWithGoogle}
          disabled={googleLoading}
          className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-md border border-[var(--line)] bg-white px-4 py-2.5 text-sm font-medium hover:bg-[var(--bg)] disabled:opacity-60"
        >
          <GoogleIcon />
          {googleLoading ? "Redirecting…" : "Continue with Google"}
        </button>

        <div className="my-5 flex items-center gap-3 text-xs text-[var(--ink-muted)]">
          <div className="h-px flex-1 bg-[var(--line)]" />
          or email
          <div className="h-px flex-1 bg-[var(--line)]" />
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {mode === "signup" && (
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input id="name" name="name" required placeholder="Jordan Lee" />
            </div>
          )}
          <div>
            <Label htmlFor="email">Work email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@company.com"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-[var(--danger)] bg-[var(--danger-soft)] px-3 py-2 rounded">
              {error}
            </p>
          )}
          {info && (
            <p className="text-sm text-[var(--ok)] bg-[var(--ok-soft)] px-3 py-2 rounded">
              {info}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading
              ? "Please wait…"
              : mode === "signup"
                ? "Create account"
                : "Log in"}
          </Button>
        </form>

        <p className="mt-6 text-sm text-[var(--ink-muted)]">
          {mode === "signup" ? (
            <>
              Already have an account?{" "}
              <Link href="/login" className="text-[var(--accent)] font-medium">
                Log in
              </Link>
            </>
          ) : (
            <>
              New here?{" "}
              <Link href="/signup" className="text-[var(--accent)] font-medium">
                Start free
              </Link>
            </>
          )}
        </p>

        <button
          type="button"
          className="mt-4 w-full text-sm text-[var(--accent-deep)] font-medium hover:underline"
          onClick={async () => {
            setLoading(true);
            setError("");
            try {
              const res = await fetch("/api/demo/launch", { method: "POST" });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error || "Demo launch failed");
              router.push("/tour");
              router.refresh();
            } catch (err) {
              setError(
                err instanceof Error ? err.message : "Could not start demo"
              );
              setLoading(false);
            }
          }}
        >
          Preview without account (local demo workspace) →
        </button>
      </div>
    </div>
  );
}

export function LoginPageClient({
  supabaseEnabled,
}: {
  supabaseEnabled: boolean;
}) {
  return (
    <Suspense>
      <AuthForm mode="login" supabaseEnabled={supabaseEnabled} />
    </Suspense>
  );
}

export function SignupPageClient({
  supabaseEnabled,
}: {
  supabaseEnabled: boolean;
}) {
  return (
    <Suspense>
      <AuthForm mode="signup" supabaseEnabled={supabaseEnabled} />
    </Suspense>
  );
}
