import Link from "next/link";
import { ArrowRight, Play, Cpu, Radio, Rocket } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#05080f] text-[var(--ink)]">
      <header className="absolute inset-x-0 top-0 z-20 px-6 py-5 flex items-center justify-between max-w-6xl mx-auto w-full">
        <div className="font-display text-sm tracking-[0.25em]">
          TACTIX <span className="text-[var(--hud-cyan)]">AI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-white/55 hover:text-white"
          >
            Log in
          </Link>
          <a href="/demo" className="hud-btn">
            Launch brain
          </a>
        </div>
      </header>

      <section className="hero-atmosphere relative min-h-[100svh] flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-60 pointer-events-none">
          <div className="absolute inset-0 hero-mesh" />
          <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--hud-cyan)]/25 animate-spin-slow" />
          <div className="absolute left-1/2 top-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--hud-amber)]/20 animate-pulse-soft" />
          <div className="absolute right-[8%] top-[18%] h-40 w-40 rounded-full bg-[var(--hud-cyan)]/10 blur-3xl animate-float" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pt-24 pb-16">
          <p className="font-display text-4xl sm:text-6xl md:text-7xl tracking-[0.08em] leading-[0.95] animate-fade-up">
            TACTIX
          </p>
          <h1 className="mt-4 max-w-2xl text-xl sm:text-2xl text-white/90 animate-fade-up-delay font-medium">
            Your company&apos;s JARVIS — one brain for every system
          </h1>
          <p className="mt-4 max-w-xl text-white/60 text-base sm:text-lg animate-fade-up-delay">
            Pull Slack, Google Sheets, Freshdesk, Looker Studio, and WhatsApp.
            Detect requests. Correct messy data. Run shipments and ops from one
            live command center.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 animate-fade-up-delay-2">
            <a href="/demo" className="hud-btn">
              <Play size={16} /> Launch company brain
            </a>
            <Link
              href="/convert"
              className="inline-flex items-center gap-2 rounded-md border border-white/20 px-5 py-3 text-sm font-medium text-white/80 hover:bg-white/5"
            >
              Free Slack → skill converter <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl grid gap-8 md:grid-cols-3">
          {[
            {
              icon: Radio,
              title: "Pull everything",
              body: "Sheets rows, Freshdesk tickets, Slack threads, Looker alerts, WhatsApp chats — into one neural feed.",
            },
            {
              icon: Cpu,
              title: "Learn & correct",
              body: "AI finds requests, fixes typos, missing SKUs, bad discounts, incomplete tracking — before humans waste a cycle.",
            },
            {
              icon: Rocket,
              title: "Run the business",
              body: "Approve, execute, ship. One-stop ops for fulfillment, refunds, escalations, and CX.",
            },
          ].map((item) => (
            <div key={item.title} className="hud-panel">
              <item.icon className="text-[var(--hud-cyan)]" size={22} />
              <h2 className="mt-4 font-display text-xl tracking-wide">
                {item.title}
              </h2>
              <p className="mt-2 text-sm text-white/60 leading-relaxed">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <footer className="px-6 py-8 text-sm text-white/40 border-t border-white/10">
        <div className="mx-auto max-w-6xl flex flex-wrap justify-between gap-3">
          <span className="font-display tracking-[0.2em] text-white/80">
            TACTIX AI
          </span>
          <span>Company brain · multi-source · ops automation</span>
        </div>
      </footer>
    </div>
  );
}
