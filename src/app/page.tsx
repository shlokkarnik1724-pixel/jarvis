import Link from "next/link";
import { ArrowRight, Play, Sparkles, Brain } from "lucide-react";

const SAMPLE_SLACK = `Slack · Teams · Zoho · Zoom · Sheets
— decisions scattered across every tool —

Alex: Can I give Acme 15%?
Jordan: Enterprise cap is 15% without me.
Riley: VIP outages escalate to on-call in 15m.`;

const SAMPLE_SKILL = `{
  "brain": "Acme company operating system",
  "skills": [
    "Enterprise 15% discount exception",
    "VIP escalation → Riley",
    "P1 refund exception"
  ],
  "routes_to": "the right owner automatically"
}`;

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <header className="absolute inset-x-0 top-0 z-20 px-6 py-5 flex items-center justify-between max-w-6xl mx-auto w-full">
        <div className="font-display text-xl tracking-tight">
          Tactix <span className="text-[var(--accent)]">AI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/setup"
            className="hidden sm:inline text-sm text-[var(--ink-muted)] hover:text-[var(--ink)]"
          >
            Connect Supabase
          </Link>
          <Link
            href="/login"
            className="text-sm text-[var(--ink-muted)] hover:text-[var(--ink)]"
          >
            Log in
          </Link>
          <a
            href="/demo"
            className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-deep)]"
          >
            Open demo
          </a>
        </div>
      </header>

      <section className="hero-atmosphere relative min-h-[100svh] flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-40 pointer-events-none">
          <div className="absolute right-[-10%] top-[10%] h-[70%] w-[55%] rounded-[40%] border border-[var(--line)] bg-gradient-to-br from-white/70 to-transparent animate-float" />
          <div className="absolute left-[5%] bottom-[12%] h-40 w-40 rounded-full bg-[var(--accent-soft)] blur-2xl" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pt-24 pb-16">
          <p className="font-display text-4xl sm:text-6xl md:text-7xl tracking-tight leading-[0.95] animate-fade-up max-w-4xl">
            Tactix AI
          </p>
          <h1 className="mt-4 max-w-2xl text-xl sm:text-2xl text-[var(--ink)]/90 animate-fade-up-delay font-medium">
            The company brain for Slack, Teams, Zoho, Sheets, Zoom & more
          </h1>
          <p className="mt-4 max-w-xl text-[var(--ink-muted)] text-base sm:text-lg animate-fade-up-delay">
            One living operating system that arranges decisions, answers
            questions, and routes work to the right person — across every tool
            your company already uses.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 animate-fade-up-delay-2">
            <a
              href="/demo"
              className="inline-flex items-center gap-2 rounded-md bg-[var(--ink)] px-5 py-3 text-sm font-medium text-white hover:opacity-90"
            >
              <Play size={16} />
              Open running demo
            </a>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-md border border-[var(--line)] bg-white/70 px-5 py-3 text-sm font-medium backdrop-blur hover:bg-white"
            >
              <Brain size={16} /> Sign in (Google / email)
            </Link>
            <Link
              href="/convert"
              className="inline-flex items-center gap-2 rounded-md px-5 py-3 text-sm font-medium text-[var(--accent-deep)] hover:underline"
            >
              <Sparkles size={16} /> Free converter <ArrowRight size={16} />
            </Link>
          </div>
          <p className="mt-4 text-xs text-[var(--ink-muted)]">
            Fastest path: open{" "}
            <a href="/demo" className="underline text-[var(--accent)]">
              /demo
            </a>{" "}
            after <code>npm run dev</code>.
          </p>
        </div>
      </section>

      <section className="atmosphere py-20 px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-3xl tracking-tight">
            One brain. Every system.
          </h2>
          <p className="mt-2 text-[var(--ink-muted)] max-w-2xl">
            Connectors for Slack, Microsoft Teams, Google Chat, Gmail, Outlook,
            Zoho, Zendesk, Google Sheets, Zoom, Fireflies — plus universal paste
            / upload.
          </p>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Ingest",
                body: "Pull decisions from chat, tickets, sheets, and meeting transcripts.",
              },
              {
                step: "02",
                title: "Arrange",
                body: "AI extracts skills, flags conflicts, and keeps a versioned company memory.",
              },
              {
                step: "03",
                title: "Act",
                body: "Answer questions, route to the right owner, deploy to agents.",
              },
            ].map((item) => (
              <div key={item.step} className="border-t border-[var(--line)] pt-5">
                <p className="text-xs tracking-[0.2em] text-[var(--accent)]">
                  {item.step}
                </p>
                <h3 className="mt-2 font-display text-2xl">{item.title}</h3>
                <p className="mt-2 text-sm text-[var(--ink-muted)] leading-relaxed">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white border-y border-[var(--line)]">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-3xl tracking-tight">
            Scattered tools → company brain
          </h2>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <pre className="overflow-auto rounded-md bg-[var(--ink)] p-5 text-sm text-[#d7e8e4] leading-relaxed whitespace-pre-wrap">
              {SAMPLE_SLACK}
            </pre>
            <pre className="overflow-auto rounded-md border border-[var(--line)] bg-[var(--bg)] p-5 text-sm text-[var(--ink)] leading-relaxed whitespace-pre-wrap">
              {SAMPLE_SKILL}
            </pre>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 atmosphere">
        <div className="mx-auto max-w-6xl flex flex-wrap gap-3">
          <a
            href="/demo"
            className="inline-flex items-center gap-2 rounded-md bg-[var(--accent)] px-5 py-3 text-sm font-medium text-white hover:bg-[var(--accent-deep)]"
          >
            <Play size={16} /> Open running demo
          </a>
          <Link
            href="/setup"
            className="inline-flex items-center gap-2 rounded-md border border-[var(--line)] bg-white px-5 py-3 text-sm font-medium"
          >
            Connect Supabase + Google Auth
          </Link>
        </div>
      </section>

      <footer className="px-6 py-8 text-sm text-[var(--ink-muted)] border-t border-[var(--line)]">
        <div className="mx-auto max-w-6xl flex flex-wrap justify-between gap-3">
          <span className="font-display text-[var(--ink)]">Tactix AI</span>
          <span>The living operating system for your company</span>
        </div>
      </footer>
    </div>
  );
}
