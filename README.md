# Tactix AI — Investor MVP

**The Living Operating System for Enterprise AI Agents**

Turn Slack / support / email threads into versioned, approved decision skills — then simulate agents that cite the exact rule and source conversation.

---

## 60-second start (for investors / reviewers)

```bash
npm install
npm run dev
```

Open **http://localhost:3000** and click **Launch live demo**.

That opens a seeded **Acme Inc** workspace with:
- 2 approved skills + 2 pending reviews
- Live activity feed
- Working extract → review → simulator loop
- JSON / YAML / system-prompt export

No OpenAI key required (demo extraction engine is built in).  
Optional: set `OPENAI_API_KEY` in `.env.local` for live LLM calls.

Demo login (also created by Launch live demo):
- Email: `investor@demo.tactix.ai`
- Password: `demo1234`

---

## What you can demo

| Feature | Where |
|---|---|
| One-click seeded product tour | Landing → **Launch live demo** |
| Free Slack-to-Skill converter (lead magnet) | `/convert` — no account |
| Paste / upload conversation → extract skill | `/extract`, `/sources` |
| Split-view review + approve/reject + versioning | `/skills/[id]` |
| Conflict flags + confidence + missing fields | Skill review |
| Agent simulator with citations | `/simulator` |
| Export JSON / YAML / system prompt | Skill review + converter |
| Multi-tenant workspaces + invite codes | Onboarding + Settings |
| Pricing tiers | `/billing` |

---

## Investor walkthrough script

1. Open the app → **Launch live demo**
2. Dashboard shows living stats + activity (not an empty state)
3. Skill Library → open a **pending** skill → approve in split view
4. Click **Run Test** → ask: *“Can I offer this enterprise client a 15% discount?”*
5. Point at the citation footer (skill id, approval date, Slack source)
6. Optional: Extract a fresh thread, or show `/convert` as the free PLG wedge

---

## Share this repo

```bash
git clone <your-fork-or-this-repo>
cd jarvis
git checkout cursor/tactix-ai-mvp-fcc1
npm install
npm run dev
```

Or deploy to Vercel (Next.js) — no database provisioning required for the JSON-backed MVP store.

---

## Product thesis (from the blueprint)

Traditional RAG tells agents *what text exists*. Tactix extracts *how to decide*:

> IF Customer Tier = Enterprise → THEN permit up to 15% discount without manager sign-off

Human-in-the-loop approval + source traceability is the governance moat before any agent acts in production.
