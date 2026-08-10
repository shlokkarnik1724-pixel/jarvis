import type { ScoreType } from "@/lib/types";

export const VIBE_PRESETS = [
  { emoji: "🥴", label: "hungover" },
  { emoji: "🔒", label: "locked in" },
  { emoji: "🐺", label: "feral" },
  { emoji: "👻", label: "ghost mode" },
  { emoji: "😎", label: "main character" },
  { emoji: "🫠", label: "melting" },
  { emoji: "🫡", label: "reporting for duty" },
  { emoji: "😴", label: "hibernating" },
] as const;

export const DEFAULT_BINGO_PROMPTS = [
  "Someone cries (happy or otherwise)",
  "Lost phone panic",
  "Questionable food choice",
  "\"One more round\" becomes three",
  "Aux cord diplomacy fails",
  "Someone spills a drink",
  "Group photo with eyes closed",
  "Unexpected ex lore drops",
  "Uber surge rage",
  "\"I'm fine\" is a lie",
  "Shoes come off somewhere weird",
  "Snack run at 1am",
  "Someone becomes the mom friend",
  "Karaoke attempt",
  "Mystery jacket acquired",
  "Plan changes mid-transit",
  "Someone disappears for 20 min",
  "Deep lore storytelling",
  "Dance floor commitment",
  "Wallet check spiral",
  "\"Last stop\" is not the last stop",
  "Compliment that becomes a roast",
  "Someone orders for the table",
  "Inside joke resurfaces",
  "Sunrise negotiation begins",
  "Someone claims they're sober-ish",
  "Wrong train / wrong street",
  "Shared fries diplomacy",
  "Voice note essay",
  "Bathroom buddy system",
];

export const SYMPTOM_REMEDIES: Record<string, string[]> = {
  headache: [
    "Water + electrolytes before anything else",
    "Dim lights / no doomscrolling for 20 min",
    "Light salty snack (chips, crackers)",
    "Painkiller only with food if you use them",
  ],
  nausea: [
    "Ginger tea or ginger ale, small sips",
    "Plain crackers, sit upright 20 min",
    "Cool air on your face — skip strong smells",
    "Try the Lime Soda Cooler from Drinks Bar (zero-proof)",
  ],
  "dead inside": [
    "Shower, even a short one",
    "Text the group a single 🫡",
    "Protein + carbs (eggs + toast energy)",
    "10-minute outside walk if you can stand",
  ],
  thirsty: [
    "500ml water now, then another in 30 min",
    "Electrolyte sachet or sports drink",
    "Virgin Mule (ginger + lime) from Drinks Bar",
  ],
  tired: [
    "Power nap 25–40 min max",
    "Caffeine only after water",
    "Sunglasses are a medical device today",
  ],
};

export const CIRCLE_TITLES: Array<{ minPoints: number; title: string }> = [
  { minPoints: 0, title: "New Orbit" },
  { minPoints: 20, title: "Reliable Extra" },
  { minPoints: 40, title: "Designated Adult" },
  { minPoints: 60, title: "Round King" },
  { minPoints: 80, title: "Chaos Coordinator" },
  { minPoints: 100, title: "Circle Legend" },
];

export function titleForPoints(total: number): string {
  let title = CIRCLE_TITLES[0].title;
  for (const entry of CIRCLE_TITLES) {
    if (total >= entry.minPoints) title = entry.title;
  }
  return title;
}

export function dayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export function checkBingo(marked: boolean[]): boolean {
  if (marked.length !== 25) return false;
  const lines: number[][] = [];
  for (let r = 0; r < 5; r += 1) {
    lines.push([0, 1, 2, 3, 4].map((c) => r * 5 + c));
  }
  for (let c = 0; c < 5; c += 1) {
    lines.push([0, 1, 2, 3, 4].map((r) => r * 5 + c));
  }
  lines.push([0, 6, 12, 18, 24], [4, 8, 12, 16, 20]);
  return lines.some((line) => line.every((i) => marked[i]));
}

export type RecoverySeverity = "light" | "medium" | "heavy";

export function severityFromDrinks(drinkCount: number): RecoverySeverity {
  if (drinkCount <= 3) return "light";
  if (drinkCount <= 7) return "medium";
  return "heavy";
}

export function generateRecoveryTasks(severity: RecoverySeverity): Array<{ text: string; done: boolean }> {
  const base = [
    "Drink 500ml water",
    "Eat something salty/greasy",
    "Get 7+ hrs sleep",
  ];
  const extra: Record<RecoverySeverity, string[]> = {
    light: [],
    medium: ["Take an electrolyte sachet", "Short walk outside"],
    heavy: [
      "Take electrolytes x2",
      "Painkiller if needed (with food)",
      "No screens for first hour",
      "Text the group you're alive",
    ],
  };
  return [...base, ...extra[severity]].map((text) => ({ text, done: false }));
}

export function buildRecoveryKit(
  attendeeCount: number,
  avgSeverity: RecoverySeverity
): Array<{ name: string; qty: number; bought: boolean }> {
  const perPerson = { light: 1, medium: 1.5, heavy: 2 } as const;
  const multiplier = perPerson[avgSeverity];
  return [
    {
      name: "Electrolyte sachets",
      qty: Math.ceil(attendeeCount * multiplier),
      bought: false,
    },
    {
      name: "Eggs (dozen)",
      qty: Math.max(1, Math.ceil(attendeeCount / 6)),
      bought: false,
    },
    {
      name: "Painkillers (strip)",
      qty: Math.max(1, Math.ceil(attendeeCount / 4)),
      bought: false,
    },
    {
      name: "Greasy snacks / breakfast wraps",
      qty: Math.max(1, Math.ceil(attendeeCount / 2)),
      bought: false,
    },
    {
      name: "Ginger ale / sports drinks",
      qty: Math.ceil(attendeeCount * multiplier),
      bought: false,
    },
  ];
}

export function getRemedies(symptoms: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const symptom of symptoms) {
    for (const tip of SYMPTOM_REMEDIES[symptom] ?? []) {
      if (!seen.has(tip)) {
        seen.add(tip);
        out.push(tip);
      }
    }
  }
  return out;
}

export function scoreReasonLabel(scoreType: ScoreType): string {
  return scoreType.replaceAll("_", " ");
}
