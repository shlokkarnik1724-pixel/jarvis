# Tactix AI / OmniAgent OS — Company Brain MVP

Hybrid platform that turns messy conversations into **self-updating, verifiable execution rules** with full provenance.

## Blueprint layers (implemented)

| Layer | In product |
|---|---|
| **Ingestion** | `/ingestion` — zero-touch listeners (Slack, Zendesk, Gmail, Gong) + passive tick simulator |
| **Extraction** | `/extract` + skill review — JSON/YAML skills **and** human SOP steps |
| **Memory** | `/graph` — bi-temporal knowledge graph (`valid_from` / `valid_to` / supersession) |
| **Execution** | `/simulator` sandbox + exports to LangChain, CrewAI, AutoGen, webhook |
| **Governance** | Split-screen source verification + approve/reject + audit trail |

Master manifest: `GET /api/manifest` → OmniAgent_OS JSON.

## Run

```bash
npm install
npm run dev
```

1. Open http://localhost:3000 → **Launch company brain demo**
2. Tour: Brain → Passive Ingestion → Knowledge Graph → Skill review (SOP + JSON) → Sandbox → export LangChain/CrewAI/AutoGen

## Real auth (Supabase + Google)

See `/setup` and `.env.example`. Run `supabase/schema.sql` then `supabase/schema_omniagent_upgrade.sql`.

## Investor demo script

1. **Passive Ingestion** — show listeners + “Simulate passive tick”
2. **Extract / Review** — split-screen source vs skill; switch to **Human SOP** tab
3. **Approve** — conflicting nodes auto-invalidate (bi-temporal)
4. **Knowledge Graph** — active vs superseded nodes with validity windows
5. **Sandbox Runtime** — ask a question; only active skills apply
6. **Export** — LangChain / CrewAI / AutoGen / Webhook packs
