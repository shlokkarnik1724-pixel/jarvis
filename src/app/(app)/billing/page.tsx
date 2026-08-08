import { Badge, Button } from "@/components/ui";
import { Check } from "lucide-react";

const tiers = [
  {
    name: "Starter",
    price: "$99–$199",
    blurb: "Small teams / startups",
    features: [
      "1 channel integration (Slack or Zendesk)",
      "50 extracted skills",
      "Export to JSON / system prompts",
      "Skill review & versioning",
    ],
  },
  {
    name: "Pro",
    price: "$499–$999",
    blurb: "Growth SaaS companies",
    features: [
      "Multi-channel ingestion",
      "Auto-updating skills",
      "Agent execution playground",
      "API hooks for agent frameworks",
    ],
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    blurb: "Scale-ups / compliance-heavy",
    features: [
      "SOC-2 compliance path",
      "Private VPC deployment",
      "Human-in-the-loop approval workflows",
      "Dedicated success engineer",
    ],
  },
];

export default function BillingPage() {
  return (
    <div>
      <h1 className="font-display text-3xl tracking-tight">Billing</h1>
      <p className="mt-1 text-sm text-[var(--ink-muted)]">
        Static pricing for the MVP demo — Stripe Checkout can plug in when
        pilots go paid.
      </p>

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {tiers.map((t) => (
          <div
            key={t.name}
            className={`rounded-md border p-6 ${
              t.highlight
                ? "border-[var(--accent)] bg-[var(--accent-soft)]/40"
                : "border-[var(--line)] bg-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl">{t.name}</h2>
              {t.highlight && <Badge tone="accent">Popular</Badge>}
            </div>
            <p className="mt-2 text-sm text-[var(--ink-muted)]">{t.blurb}</p>
            <p className="mt-4 font-display text-3xl">
              {t.price}
              <span className="text-sm font-sans text-[var(--ink-muted)]">
                /mo
              </span>
            </p>
            <ul className="mt-6 space-y-2">
              {t.features.map((f) => (
                <li key={f} className="flex gap-2 text-sm">
                  <Check size={16} className="mt-0.5 text-[var(--accent)]" />
                  {f}
                </li>
              ))}
            </ul>
            <Button
              className="mt-6 w-full"
              variant={t.highlight ? "primary" : "outline"}
              disabled
              title="Demo only — no Stripe in MVP"
            >
              Choose {t.name}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
