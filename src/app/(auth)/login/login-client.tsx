"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FadeIn } from "@/components/motion/reveal";
import { toast } from "@/lib/store/toast-store";
import { duration, easeOut } from "@/lib/motion";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reduced = useReducedMotion();
  const [error, setError] = useState<string | null>(
    searchParams.get("error") === "auth" ? "Authentication failed. Try again." : null
  );
  const [message, setMessage] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [pending, startTransition] = useTransition();

  async function runAuth(payload: Record<string, unknown>) {
    setError(null);
    setMessage(null);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = (await response.json()) as {
      success: boolean;
      data?: {
        url?: string;
        demo?: boolean;
        confirmEmail?: boolean;
        message?: string;
        needsCircle?: boolean;
      };
      error?: string;
    };

    if (!json.success) {
      const err = json.error ?? "Login failed";
      setError(err);
      toast("Couldn’t sign in", { description: err, tone: "error" });
      return;
    }

    if (json.data?.url) {
      window.location.href = json.data.url;
      return;
    }

    if (json.data?.confirmEmail) {
      const msg = json.data.message ?? "Check your email to confirm your account.";
      setMessage(msg);
      toast("Check your email", { description: msg, tone: "info" });
      return;
    }

    toast("Welcome back", {
      description: payload.mode === "demo" ? "Demo session ready." : "You’re in.",
      tone: "success",
    });

    const next = searchParams.get("next") || "/dashboard";
    router.push(next);
    router.refresh();
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#12261e_0%,#1f6f54_42%,#d9e4ef_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(20,32,27,0.35),transparent_45%)]" />
        <motion.div
          className="absolute -left-16 top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl"
          animate={
            reduced
              ? undefined
              : { x: [0, 24, 0], y: [0, -16, 0], opacity: [0.35, 0.55, 0.35] }
          }
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-[#d8eee4]/20 blur-3xl"
          animate={
            reduced
              ? undefined
              : { x: [0, -18, 0], y: [0, 14, 0], opacity: [0.25, 0.45, 0.25] }
          }
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <main className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <FadeIn className="max-w-xl">
            <p className="font-display text-5xl leading-none tracking-tight text-white md:text-7xl">
              Circle
            </p>
            <div className="mt-4 h-1 w-24 origin-left rounded-full bg-[#d8eee4] animate-reveal-line" />
            <h1 className="mt-8 max-w-lg text-2xl font-medium leading-snug text-white/95 md:text-3xl">
              Your closed friend group, private by default.
            </h1>
            <p className="mt-4 max-w-md text-base text-white/75">
              Sign in, create a circle, invite friends with a code. Shared events,
              vault, tabs, and games — for your people only.
            </p>
          </FadeIn>

          <FadeIn delay={0.08}>
            <motion.div
              className="rounded-3xl border border-white/25 bg-white/90 p-6 text-[var(--ink)] shadow-[0_30px_60px_-36px_rgba(10,20,16,0.55)] backdrop-blur-xl"
              whileHover={
                reduced
                  ? undefined
                  : {
                      y: -2,
                      transition: { duration: duration.fast, ease: easeOut },
                    }
              }
            >
              <h2 className="font-display text-2xl">Join your circle</h2>
              <p className="mt-1 text-sm text-[var(--ink-muted)]">
                Use email for friends, or Google if configured.
              </p>

              <div className="mt-5 space-y-3">
                <div className="group">
                  <Label htmlFor="name" className="transition-colors group-focus-within:text-[var(--accent-deep)]">
                    Name (signup)
                  </Label>
                  <Input
                    id="name"
                    className="mt-1"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex"
                  />
                </div>
                <div className="group">
                  <Label htmlFor="email" className="transition-colors group-focus-within:text-[var(--accent-deep)]">
                    Email
                  </Label>
                  <Input
                    id="email"
                    className="mt-1"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@friends.com"
                  />
                </div>
                <div className="group">
                  <Label htmlFor="password" className="transition-colors group-focus-within:text-[var(--accent-deep)]">
                    Password
                  </Label>
                  <Input
                    id="password"
                    className="mt-1"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                  />
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-2">
                <Button
                  disabled={pending}
                  onClick={() =>
                    startTransition(() =>
                      runAuth({
                        mode: "email",
                        intent: "signup",
                        email,
                        password,
                        name,
                      })
                    )
                  }
                >
                  Create account
                </Button>
                <Button
                  variant="secondary"
                  disabled={pending}
                  onClick={() =>
                    startTransition(() =>
                      runAuth({
                        mode: "email",
                        intent: "signin",
                        email,
                        password,
                      })
                    )
                  }
                >
                  Sign in with email
                </Button>
                <Button
                  variant="secondary"
                  disabled={pending}
                  onClick={() => startTransition(() => runAuth({ mode: "google" }))}
                >
                  Continue with Google
                </Button>
                <Button
                  variant="ghost"
                  disabled={pending}
                  onClick={() => startTransition(() => runAuth({ mode: "demo" }))}
                >
                  Preview demo (local only)
                </Button>
              </div>

              {error ? (
                <motion.p
                  initial={reduced ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 rounded-xl bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]"
                >
                  {error}
                </motion.p>
              ) : null}
              {message ? (
                <motion.p
                  initial={reduced ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 rounded-xl bg-[var(--ok-soft)] px-4 py-3 text-sm text-[var(--ok)]"
                >
                  {message}
                </motion.p>
              ) : null}
            </motion.div>
          </FadeIn>
        </div>
      </main>
    </div>
  );
}
