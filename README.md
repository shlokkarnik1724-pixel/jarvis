# Tactix AI — Company Brain MVP

The living operating system for enterprise teams: connect **Slack, Microsoft Teams, Google, Zoho, Sheets, Zoom** (and more), then let AI arrange decisions, answer questions, and route work to the right person.

## What this MVP is

| Layer | What you get |
|---|---|
| **Auth** | Supabase Auth — email/password + **Continue with Google** |
| **Data** | Supabase Postgres + RLS by `organization_id` (`supabase/schema.sql`) |
| **Brain** | Ask the company brain across approved skills + sources |
| **Connectors** | Slack, Teams, Google Chat, Gmail, Outlook, Zoho, Zendesk, Sheets, Zoom, Fireflies, paste/upload |
| **Inbox** | AI routing — deliver info to the right owner |
| **Skills** | Extract → review → approve → export JSON/YAML/system prompt |
| **Agents** | Simulator that cites approved skills |

## 1) Connect Supabase (required for real login / Google)

1. Create a project at [supabase.com](https://supabase.com/dashboard)
2. Copy URL + anon key into `.env.local` (see `.env.example`)
3. Run `supabase/schema.sql` in the SQL Editor
4. Auth → Providers → **Google** → enable (add Google Cloud OAuth client)
5. Auth → URL Config → allow `http://localhost:3000/auth/callback`
6. For fast demos: disable **Confirm email** under Email provider

```bash
cp .env.example .env.local
# fill NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY
npm install
npm run dev
```

Open http://localhost:3000/setup for the checklist, then http://localhost:3000/login → **Continue with Google**.

## 2) Preview without Supabase (local demo)

```bash
npm install && npm run dev
```

Click **Launch company brain demo** — seeded Acme workspace with connectors, skills, routing inbox, and Ask Brain. Local JWT auth is used only when Supabase keys are missing.

## Investor walkthrough

1. Landing → Launch company brain demo  
2. **Company Brain** — ask “What’s our Enterprise discount policy?”  
3. **Connectors** — show Slack / Teams / Zoho / Sheets / Zoom connected  
4. **Routing Inbox** — route a VIP issue to the right owner  
5. **Extract / Skills** — paste a thread → approve → export  
6. **Agent Test** — question cites the approved skill  
7. For real auth: Connect Supabase + Google on `/setup`

## Repo / PR

Branch: `cursor/tactix-ai-mvp-fcc1`
