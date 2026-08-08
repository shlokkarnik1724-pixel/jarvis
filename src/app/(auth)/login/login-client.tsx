"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(
    searchParams.get("error") === "auth" ? "Authentication failed. Try again." : null
  );
  const [pending, startTransition] = useTransition();

  function handleLogin() {
    startTransition(async () => {
      setError(null);
      try {
        const response = await fetch("/api/auth/login", { method: "POST" });
        const json = (await response.json()) as {
          success: boolean;
          data?: { url?: string; demo?: boolean };
          error?: string;
        };

        if (!json.success) {
          setError(json.error ?? "Login failed");
          return;
        }

        if (json.data?.url) {
          window.location.href = json.data.url;
          return;
        }

        router.push(searchParams.get("next") || "/dashboard");
        router.refresh();
      } catch {
        setError("Network error during login");
      }
    });
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#12261e_0%,#1f6f54_42%,#d9e4ef_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(20,32,27,0.35),transparent_45%)]" />
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:48px_48px]" />
      </div>

      <main className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16">
        <div className="max-w-xl animate-fade-up">
          <p className="font-display text-5xl leading-none tracking-tight text-white md:text-7xl">
            Circle
          </p>
          <div className="mt-4 h-1 w-24 origin-left rounded-full bg-[#d8eee4] animate-reveal-line" />
          <h1 className="mt-8 max-w-lg text-2xl font-medium leading-snug text-white/95 md:text-3xl">
            Your closed friend group, private by default.
          </h1>
          <p className="mt-4 max-w-md text-base text-white/75">
            Events, a locked photo vault, live games, and shared tabs — built for
            the people you actually trust.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              onClick={handleLogin}
              disabled={pending}
              className="bg-white text-[var(--accent-deep)] hover:bg-[#f3faf6]"
            >
              {pending ? "Connecting…" : "Continue with Google"}
            </Button>
            <p className="text-sm text-white/65">
              Demo mode activates automatically without Supabase keys.
            </p>
          </div>

          {error ? (
            <p className="mt-4 rounded-xl bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]">
              {error}
            </p>
          ) : null}
        </div>
      </main>
    </div>
  );
}
