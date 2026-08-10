export const PARTY_ISLANDS = [
  {
    href: "/vault",
    emoji: "📸",
    title: "Vault",
    blurb: "Photo booth + GIFs.",
    theme: "vault",
    accent: "#7eb8c9",
    vibe: "Moody booth lights + polaroid haze",
    tilt: -4,
  },
  {
    href: "/fun/tabs",
    emoji: "💸",
    title: "Who's Broke",
    blurb: "Top G vs broke menace.",
    theme: "money",
    accent: "#3d8f7a",
    vibe: "Cash-green confetti ledger room",
    tilt: 3,
  },
  {
    href: "/fun/bar",
    emoji: "🍺",
    title: "Bar Menu",
    blurb: "Drink tiers + recipes.",
    theme: "bar",
    accent: "#f0c27a",
    vibe: "Neon liquor-shelf glow",
    tilt: -2,
  },
  {
    href: "/fun/flags",
    emoji: "🚩",
    title: "Flag Someone",
    blurb: "Red flags (for laughs).",
    theme: "flags",
    accent: "#c45c4a",
    vibe: "Roast arena with warning lights",
    tilt: 5,
  },
  {
    href: "/games",
    emoji: "🎮",
    title: "Game Night",
    blurb: "Blackjack + lobbies.",
    theme: "games",
    accent: "#e8a87c",
    vibe: "Arcade carpet + table lamps",
    tilt: -3,
  },
  {
    href: "/fun/lock-in",
    emoji: "⏰",
    title: "Lock In/Out",
    blurb: "Selfie check-ins.",
    theme: "lock",
    accent: "#7eb8c9",
    vibe: "Security-cam flash zone",
    tilt: 2,
  },
  {
    href: "/leaderboard",
    emoji: "🥂",
    title: "Leaderboard",
    blurb: "Titles, streaks, awards.",
    theme: "board",
    accent: "#d4af37",
    vibe: "Trophy stage spotlight",
    tilt: -5,
  },
  {
    href: "/fun/snacks",
    emoji: "🍿",
    title: "Snacks",
    blurb: "Munch pile counter.",
    theme: "snacks",
    accent: "#f0c27a",
    vibe: "Midnight kitchen crumbs",
    tilt: 4,
  },
  {
    href: "/fun/gifs",
    emoji: "🎥",
    title: "GIF Wall",
    blurb: "Reaction corkboard.",
    theme: "gifs",
    accent: "#c4a35a",
    vibe: "Corkboard + projector flicker",
    tilt: -2,
  },
  {
    href: "/fun/vibe-poll",
    emoji: "🔮",
    title: "Vibe Poll",
    blurb: "Rate the vibe 1–10.",
    theme: "poll",
    accent: "#5bd8a8",
    vibe: "Pulse graph dancefloor",
    tilt: 3,
  },
  {
    href: "/fun/regret",
    emoji: "🧾",
    title: "Regret-o-Meter",
    blurb: "Morning-after slider.",
    theme: "regret",
    accent: "#a33b2b",
    vibe: "Sunrise hangover clinic",
    tilt: -4,
  },
  {
    href: "/fun/blackjack",
    emoji: "🃏",
    title: "Blackjack",
    blurb: "Hit / stand mini-game.",
    theme: "games",
    accent: "#1f6f54",
    vibe: "Felt table under a lamp",
    tilt: 2,
  },
  {
    href: "/fun/chat",
    emoji: "💬",
    title: "Group Chat",
    blurb: "Shady Gen Z hangout thread.",
    theme: "chat",
    accent: "#e8a87c",
    vibe: "Late-night group chat energy",
    tilt: -3,
  },
  {
    href: "/fun/smokes",
    emoji: "🚬",
    title: "Sutta Counter",
    blurb: "Suttebaaz leaderboard.",
    theme: "smokes",
    accent: "#c45c4a",
    vibe: "Balcony smoke-break booth",
    tilt: 4,
  },
  {
    href: "/events",
    emoji: "📅",
    title: "Next Hang",
    blurb: "RSVP · host · who brings what.",
    theme: "events",
    accent: "#7eb8c9",
    vibe: "Invite board + bring list",
    tilt: -2,
  },
  {
    href: "/fun",
    emoji: "🌀",
    title: "Circle Lab",
    blurb: "All the extras.",
    theme: "lab",
    accent: "#3d8f7a",
    vibe: "Chaos lab with quirky experiments",
    tilt: -1,
  },
] as const;

export type PartyTheme = (typeof PARTY_ISLANDS)[number]["theme"] | "home" | "default";

/** Place islands evenly around a circle (percent coords, center = 50,50). */
export function circleLayout(
  count: number,
  radiusPercent = 38
): Array<{ x: number; y: number }> {
  return Array.from({ length: count }, (_, i) => {
    const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
    return {
      x: 50 + radiusPercent * Math.cos(angle),
      y: 50 + radiusPercent * Math.sin(angle),
    };
  });
}

export function themeForPath(pathname: string): PartyTheme {
  if (pathname === "/dashboard" || pathname === "/") return "home";
  return islandForPath(pathname)?.theme ?? "default";
}

export function islandForPath(pathname: string) {
  const matches = PARTY_ISLANDS.filter(
    (island) =>
      pathname === island.href || pathname.startsWith(`${island.href}/`)
  );
  return [...matches].sort((a, b) => b.href.length - a.href.length)[0];
}
