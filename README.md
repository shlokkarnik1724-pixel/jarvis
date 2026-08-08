# Tactix AI — Company Brain MVP

Inspired by the “company brain” thesis: models are no longer the blocker — **scattered domain knowledge** is. Tactix pulls know-how from fragmented sources, structures it, keeps it current, and ships **executable skills files** for AI agents.

## What this MVP proves

| Video thesis | In product |
|---|---|
| Knowledge lives in Slack / email / tickets / heads | `/ingestion` + `/connectors` |
| Structure it into something agents can use | `/extract` → skill JSON + human SOP |
| Living map of how the company works | `/map` operating map |
| Keep it current | Bi-temporal graph (`valid_from` / `valid_to` / supersession) |
| Executable skills for agents | `/api/brain/pack` + LangChain / CrewAI / AutoGen exports |
| Not just a chatbot | Provenance-linked Ask Brain + sandbox runtime |

## Run

```bash
npm install
npm run dev
```

1. Open http://127.0.0.1:3000 → **Launch company brain MVP**
2. Tour: Thesis → Operating Map → Pending skills → Sandbox → export skills pack

## Demo path (90 seconds)

1. `/demo` seeds Acme Inc and opens the **thesis tour**
2. **Operating Map** — refunds, discounts, escalations, incidents as live IF/THEN skills
3. Approve a pending skill (VIP escalation or SEV-2 cutover)
4. Ask the brain / run the sandbox — only active skills apply
5. Download the company skills pack for LangChain / CrewAI / AutoGen

## Real auth (optional)

See `/setup` and `.env.example`. Run `supabase/schema.sql` then `supabase/schema_omniagent_upgrade.sql`.
