import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

const SAMPLE_SLACK = `Alex (AE): Enterprise prospect wants 20% off to close this quarter.
Jordan (Manager): Cap at 15% for Enterprise — no manager sign-off needed under that. Above 15% escalate to me.
Alex: Got it — locking 15% for Acme.`;

const SAMPLE_SKILL = `{
  "title": "Enterprise Tier Discount Exception",
  "condition": "Customer Tier = Enterprise",
  "action": "Permit up to 15% discount without manager sign-off",
  "category": "Discounting",
  "confidence": 0.87
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
            href="/login"
            className="text-sm text-[var(--ink-muted)] hover:text-[var(--ink)]"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-deep)]"
          >
            Start Free
          </Link>
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
            The Living Operating System for Enterprise AI Agents
          </h1>
          <p className="mt-4 max-w-xl text-[var(--ink-muted)] text-base sm:text-lg animate-fade-up-delay">
            Mine Slack and support threads into versioned decision skills —
            then deploy agents that cite the exact approved rule.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 animate-fade-up-delay-2">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-md bg-[var(--ink)] px-5 py-3 text-sm font-medium text-white hover:opacity-90"
            >
              Start Free <ArrowRight size={16} />
            </Link>
            <a
              href="#pipeline"
              className="inline-flex items-center gap-2 rounded-md border border-[var(--line)] bg-white/70 px-5 py-3 text-sm font-medium backdrop-blur hover:bg-white"
            >
              Watch 90-sec Demo
            </a>
          </div>
        </div>
      </section>

      <section id="pipeline" className="atmosphere py-20 px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-3xl tracking-tight">
            Mine → Extract → Deploy
          </h2>
          <p className="mt-2 text-[var(--ink-muted)] max-w-xl">
            One pipeline from how your team already decides to how agents act.
          </p>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Mine",
                body: "Paste Slack, email, or ticket threads where decisions actually happen.",
              },
              {
                step: "02",
                title: "Extract",
                body: "LLMs draft structured Skill Specs with confidence and missing-field flags.",
              },
              {
                step: "03",
                title: "Deploy",
                body: "Approve with human governance, then simulate or export to agent stacks.",
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
            Before / after
          </h2>
          <p className="mt-2 text-[var(--ink-muted)]">
            Raw conversation in. Executable skill out.
          </p>
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
        <div className="mx-auto max-w-6xl">
          <p className="text-sm text-[var(--ink-muted)] mb-6">Works with</p>
          <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm font-medium text-[var(--ink)]/70">
            {["Slack", "Zendesk", "Gmail", "LangChain", "CrewAI"].map((name) => (
              <span key={name} className="inline-flex items-center gap-2">
                <Check size={14} className="text-[var(--accent)]" /> {name}
              </span>
            ))}
          </div>
          <div className="mt-12">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-md bg-[var(--accent)] px-5 py-3 text-sm font-medium text-white hover:bg-[var(--accent-deep)]"
            >
              Start Free <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <footer className="px-6 py-8 text-sm text-[var(--ink-muted)] border-t border-[var(--line)]">
        <div className="mx-auto max-w-6xl flex justify-between">
          <span className="font-display">Tactix AI</span>
          <span>Company brain for AI agents</span>
        </div>
      </footer>
    </div>
  );
}
