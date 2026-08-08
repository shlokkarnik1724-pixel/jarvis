import Link from "next/link";
import { ArrowRight, Play, Brain, FileCode2, Network } from "lucide-react";

const SAMPLE_SCATTERED = `Slack · Zendesk · Email · Gong · Sheets
— critical know-how, nowhere to find it —

Alex: Can I give Acme 15%?
Jordan: Enterprise cap is 15% without me.
Marcus: P1 outages → full refund exception.
Riley: VIP blockers escalate in 15 minutes.`;

const SAMPLE_SKILL = `{
  "company_brain": "Acme operating system",
  "skills": [
    {
      "if": "Customer Tier = Enterprise",
      "then": "Permit up to 15% discount"
    },
    {
      "if": "Enterprise + P1 outage + past 30 days",
      "then": "Approve full refund + CC finance"
    }
  ],
  "routes_to": "executable agent skills file"
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
            Launch MVP
          </a>
        </div>
      </header>

      <section className="hero-atmosphere relative min-h-[100svh] flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-50 pointer-events-none">
          <div className="absolute inset-0 hero-mesh" />
          <div className="absolute right-[-8%] top-[8%] h-[72%] w-[58%] rounded-[42%] border border-[var(--line)] bg-gradient-to-br from-white/80 to-transparent animate-float" />
          <div className="absolute left-[4%] bottom-[10%] h-44 w-44 rounded-full bg-[var(--accent-soft)] blur-3xl animate-pulse-soft" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pt-24 pb-16">
          <p className="font-display text-4xl sm:text-6xl md:text-7xl tracking-tight leading-[0.95] animate-fade-up max-w-4xl">
            Tactix AI
          </p>
          <h1 className="mt-4 max-w-2xl text-xl sm:text-2xl text-[var(--ink)]/90 animate-fade-up-delay font-medium">
            The company brain for reliable AI automation
          </h1>
          <p className="mt-4 max-w-xl text-[var(--ink-muted)] text-base sm:text-lg animate-fade-up-delay">
            Models got good. Domain knowledge is still scattered. Tactix pulls
            it from Slack, tickets, email, and meetings — then turns it into a
            living map and executable skills files agents can run safely.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 animate-fade-up-delay-2">
            <a
              href="/demo"
              className="inline-flex items-center gap-2 rounded-md bg-[var(--ink)] px-5 py-3 text-sm font-medium text-white hover:opacity-90"
            >
              <Play size={16} />
              Launch company brain MVP
            </a>
            <Link
              href="/convert"
              className="inline-flex items-center gap-2 rounded-md border border-[var(--line)] bg-white/70 px-5 py-3 text-sm font-medium backdrop-blur hover:bg-white"
            >
              <FileCode2 size={16} /> Try free Slack → skill converter
            </Link>
          </div>
        </div>
      </section>

      <section className="atmosphere py-20 px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-3xl tracking-tight">
            Not search. Not a chatbot. A company brain.
          </h2>
          <p className="mt-2 text-[var(--ink-muted)] max-w-2xl">
            The missing layer between raw company data and AI agents that
            actually do the work — consistently, with provenance.
          </p>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Pull",
                body: "Mine Slack, Zendesk, Gmail, Gong, Teams, Zoho, Sheets, Zoom — decisions without forcing documentation.",
                icon: CableIcon,
              },
              {
                step: "02",
                title: "Structure",
                body: "Extract IF/THEN skills + SOPs. Humans approve. Bi-temporal memory keeps the map current.",
                icon: Network,
              },
              {
                step: "03",
                title: "Execute",
                body: "Export skills packs for LangChain, CrewAI, AutoGen — or ask the brain and route to the right owner.",
                icon: Brain,
              },
            ].map((item) => (
              <div key={item.step} className="border-t border-[var(--line)] pt-5">
                <p className="text-xs tracking-[0.2em] text-[var(--accent)]">
                  {item.step}
                </p>
                <h3 className="mt-2 font-display text-2xl flex items-center gap-2">
                  <item.icon size={20} className="text-[var(--accent)]" />
                  {item.title}
                </h3>
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
            Scattered know-how → executable skills
          </h2>
          <p className="mt-2 text-[var(--ink-muted)] max-w-2xl">
            How refunds get handled. How pricing exceptions are decided. How
            engineers respond to incidents. One living operating map.
          </p>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <pre className="overflow-auto rounded-md bg-[var(--ink)] p-5 text-sm text-[#d7e8e4] leading-relaxed whitespace-pre-wrap">
              {SAMPLE_SCATTERED}
            </pre>
            <pre className="overflow-auto rounded-md border border-[var(--line)] bg-[var(--bg)] p-5 text-sm text-[var(--ink)] leading-relaxed whitespace-pre-wrap">
              {SAMPLE_SKILL}
            </pre>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 atmosphere">
        <div className="mx-auto max-w-6xl flex flex-wrap items-center justify-between gap-6">
          <div>
            <h2 className="font-display text-2xl tracking-tight">
              See the Acme company brain in 90 seconds
            </h2>
            <p className="mt-2 text-sm text-[var(--ink-muted)] max-w-lg">
              Seeded demo: passive ingestion, pending skill review, living
              operating map, and agent sandbox — no signup required.
            </p>
          </div>
          <a
            href="/demo"
            className="inline-flex items-center gap-2 rounded-md bg-[var(--accent)] px-5 py-3 text-sm font-medium text-white hover:bg-[var(--accent-deep)]"
          >
            <Play size={16} /> Launch MVP <ArrowRight size={16} />
          </a>
        </div>
      </section>

      <footer className="px-6 py-8 text-sm text-[var(--ink-muted)] border-t border-[var(--line)]">
        <div className="mx-auto max-w-6xl flex flex-wrap justify-between gap-3">
          <span className="font-display text-[var(--ink)]">Tactix AI</span>
          <span>Company brain · executable skills · agent-ready</span>
        </div>
      </footer>
    </div>
  );
}

function CableIcon({
  size,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size || 20}
      height={size || 20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4 9a4 4 0 0 1 4-4h1" />
      <path d="M15 5h1a4 4 0 0 1 4 4" />
      <path d="M4 15a4 4 0 0 0 4 4h1" />
      <path d="M15 19h1a4 4 0 0 0 4-4" />
      <path d="M9 5v14" />
      <path d="M15 5v14" />
    </svg>
  );
}
