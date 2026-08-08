"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { Button, Input, Label } from "@/components/ui";

function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const search = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const payload =
      mode === "signup"
        ? {
            name: String(fd.get("name") || ""),
            email: String(fd.get("email") || ""),
            password: String(fd.get("password") || ""),
          }
        : {
            email: String(fd.get("email") || ""),
            password: String(fd.get("password") || ""),
          };

    const res = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Something went wrong");
      return;
    }

    const next = search.get("next");
    if (data.needsOnboarding) {
      router.push("/onboarding");
    } else {
      router.push(next || "/dashboard");
    }
    router.refresh();
  }

  return (
    <div className="atmosphere min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="font-display text-2xl tracking-tight">
          Tactix <span className="text-[var(--accent)]">AI</span>
        </Link>
        <h1 className="mt-8 font-display text-3xl tracking-tight">
          {mode === "signup" ? "Create your account" : "Welcome back"}
        </h1>
        <p className="mt-2 text-sm text-[var(--ink-muted)]">
          {mode === "signup"
            ? "Company linking happens next — keep auth simple."
            : "Sign in to your workspace."}
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          {mode === "signup" && (
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input id="name" name="name" required placeholder="Jordan Lee" />
            </div>
          )}
          <div>
            <Label htmlFor="email">Email</Label>
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

          <Button type="submit" className="w-full" disabled={loading}>
            {loading
              ? "Please wait…"
              : mode === "signup"
                ? "Create account"
                : "Log in"}
          </Button>
        </form>

        <button
          type="button"
          className="mt-4 w-full rounded-md border border-[var(--line)] bg-white px-4 py-2.5 text-sm text-[var(--ink-muted)] cursor-not-allowed"
          title="Wire Supabase Google OAuth when ready"
          disabled
        >
          Continue with Google (coming soon)
        </button>

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
      </div>
    </div>
  );
}

export function LoginPageClient() {
  return (
    <Suspense>
      <AuthForm mode="login" />
    </Suspense>
  );
}

export function SignupPageClient() {
  return (
    <Suspense>
      <AuthForm mode="signup" />
    </Suspense>
  );
}
