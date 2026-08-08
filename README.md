# Tactix AI

Multi-tenant MVP that turns Slack/email/support conversations into structured, approved **skills** for AI agents.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS
- Local JSON datastore (org-scoped, demo-friendly — no Supabase required to run)
- OpenAI structured extraction when `OPENAI_API_KEY` is set; deterministic demo engine otherwise
- Cookie sessions (email/password)

## Run locally

```bash
npm install
cp .env.example .env.local   # already present in cloud agents
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo path (investor / design partner)

1. **Start Free** → sign up
2. **Create workspace** (e.g. Acme Inc)
3. **Paste a conversation** (sample threads are one click away)
4. Watch **Extract Skill** processing animation
5. **Approve** on the split-view Skill Review screen
6. Open **Simulator** and ask: *“Can I offer this enterprise client a discount?”*

Optional: set `OPENAI_API_KEY` in `.env.local` for live LLM extraction & simulation.

## Screens

| Route | Purpose |
|---|---|
| `/` | Landing |
| `/signup`, `/login` | Auth |
| `/onboarding` | Create / join workspace |
| `/sources` | Connect sources + paste conversation |
| `/dashboard` | Stats + activity |
| `/extract` | Full extract flow |
| `/skills`, `/skills/[id]` | Library + review |
| `/simulator` | Agent playground |
| `/settings` | Team, invite code, API key stub |
| `/billing` | Static pricing tiers |

## Data model

Organizations own conversations, skills, versions, data sources, and memberships. Every API call is scoped by the session `organizationId`.
