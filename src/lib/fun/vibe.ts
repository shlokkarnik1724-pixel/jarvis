import type { EventView } from "@/lib/types";

const VIBE_TEMPLATES = [
  {
    title: "Golden Hour Walk + Picnic",
    blurb: "Low-effort reset: golden-hour stroll ending at a park bench picnic.",
    tags: ["outdoor", "food", "catch-up"],
  },
  {
    title: "Kitchen Chaos Night",
    blurb: "Everyone brings one ingredient. Cook whatever the drawer decides.",
    tags: ["food", "indoor", "creative"],
  },
  {
    title: "Trivia Rematch Rematch",
    blurb: "Reopen unfinished debates with a custom friend-history quiz.",
    tags: ["games", "indoor"],
  },
  {
    title: "Sunrise Mission",
    blurb: "Early coffee run and a quiet viewpoint before the city wakes up.",
    tags: ["outdoor", "catch-up"],
  },
  {
    title: "Analog Game Stack",
    blurb: "Phones in a bowl. Cards, deduction, and snacks until someone cracks.",
    tags: ["games", "indoor", "snacks"],
  },
  {
    title: "Neighborhood Scavenger Sprint",
    blurb: "Photo scavenger list across five blocks. First team with all shots wins.",
    tags: ["outdoor", "creative", "games"],
  },
  {
    title: "Film Night Remix",
    blurb: "Pick a theme from past hangouts and build a double-feature around it.",
    tags: ["movies", "snacks", "indoor"],
  },
  {
    title: "Skill Swap Hour",
    blurb: "Each person teaches a 10-minute micro-skill. Leave sharper than you arrived.",
    tags: ["creative", "indoor", "catch-up"],
  },
];

export interface VibeSuggestion {
  title: string;
  blurb: string;
  matchedTags: string[];
  confidence: number;
}

export function generateVibes(events: EventView[], count = 3): VibeSuggestion[] {
  const tagFrequency = new Map<string, number>();
  for (const event of events) {
    for (const tag of event.tags) {
      tagFrequency.set(tag, (tagFrequency.get(tag) ?? 0) + 1);
    }
  }

  const scored = VIBE_TEMPLATES.map((template) => {
    const matchedTags = template.tags.filter((tag) => tagFrequency.has(tag));
    const weight = matchedTags.reduce(
      (sum, tag) => sum + (tagFrequency.get(tag) ?? 0),
      0
    );
    const novelty = template.tags.filter((tag) => !tagFrequency.has(tag)).length * 0.15;
    return {
      title: template.title,
      blurb: template.blurb,
      matchedTags,
      confidence: Math.min(0.98, 0.35 + weight * 0.12 + novelty),
    };
  });

  return scored
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, count)
    .map((item) => ({
      ...item,
      confidence: Math.round(item.confidence * 100) / 100,
    }));
}
