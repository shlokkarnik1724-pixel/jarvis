export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || "";
  if (!url || !key) return false;
  // Treat .env.example placeholders as unconfigured so local demo JWT works
  if (
    url.includes("YOUR_PROJECT") ||
    key === "eyJ..." ||
    key.startsWith("eyJ...") ||
    key.length < 40
  ) {
    return false;
  }
  try {
    const host = new URL(url).hostname;
    if (!host.includes("supabase")) return false;
  } catch {
    return false;
  }
  return true;
}

export function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    "http://localhost:3000"
  );
}

export const CONNECTOR_CATALOG = [
  {
    provider: "slack",
    name: "Slack",
    blurb: "Channels, threads, and decision messages",
    category: "Chat",
  },
  {
    provider: "whatsapp",
    name: "WhatsApp Web",
    blurb: "Customer chats + driver / dispatch messages",
    category: "Chat",
  },
  {
    provider: "freshdesk",
    name: "Freshdesk",
    blurb: "Support tickets, priorities, and macros",
    category: "Ops",
  },
  {
    provider: "google_sheets",
    name: "Google Sheets",
    blurb: "Shipments tracker, policy tables, refund logs",
    category: "Data",
  },
  {
    provider: "looker",
    name: "Looker Studio",
    blurb: "Live KPIs, SLA boards, anomaly signals",
    category: "Data",
  },
  {
    provider: "microsoft_teams",
    name: "Microsoft Teams",
    blurb: "Teams chats, channels, and meeting notes",
    category: "Chat",
  },
  {
    provider: "gmail",
    name: "Gmail",
    blurb: "Email threads with operational decisions",
    category: "Email",
  },
  {
    provider: "zoho",
    name: "Zoho",
    blurb: "CRM tickets, deals, and support desks",
    category: "Ops",
  },
  {
    provider: "zendesk",
    name: "Zendesk",
    blurb: "Support tickets and macros",
    category: "Ops",
  },
  {
    provider: "zoom",
    name: "Zoom",
    blurb: "Meeting transcripts and action items",
    category: "Meetings",
  },
  {
    provider: "manual",
    name: "Paste / Upload",
    blurb: "Drop any thread or transcript manually",
    category: "Universal",
  },
] as const;

export type ConnectorProvider = (typeof CONNECTOR_CATALOG)[number]["provider"];
