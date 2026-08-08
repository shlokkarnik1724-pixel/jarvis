export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  );
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
    provider: "microsoft_teams",
    name: "Microsoft Teams",
    blurb: "Teams chats, channels, and meeting notes",
    category: "Chat",
  },
  {
    provider: "google_chat",
    name: "Google Chat / Spaces",
    blurb: "Workspace conversations and spaces",
    category: "Chat",
  },
  {
    provider: "gmail",
    name: "Gmail",
    blurb: "Email threads with operational decisions",
    category: "Email",
  },
  {
    provider: "outlook",
    name: "Outlook",
    blurb: "Microsoft 365 mail and calendar context",
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
    provider: "google_sheets",
    name: "Google Sheets",
    blurb: "Policy tables, pricing grids, runbooks",
    category: "Data",
  },
  {
    provider: "zoom",
    name: "Zoom",
    blurb: "Meeting transcripts and action items",
    category: "Meetings",
  },
  {
    provider: "fireflies",
    name: "Fireflies / Gong",
    blurb: "Recorded calls → decision extraction",
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
