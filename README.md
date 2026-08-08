# Tactix AI — JARVIS Company Brain MVP

One AI brain for the whole business: pull Slack, Google Sheets, Freshdesk, Looker Studio, and WhatsApp — detect requests, correct messy data, run shipments/ops.

## Run

```bash
npm install
npm run dev
```

Open http://127.0.0.1:3000 → **Launch company brain** → Command Center.

## What the brain does

1. **Pull** live feeds from connected business systems
2. **Detect** requests (shipments, refunds, discounts, escalations, WISMO, KPI alerts)
3. **Correct** typos, missing SKUs, bad discount %, incomplete tracking IDs
4. **Execute** — approve → route → ship / resolve from one HUD

## Demo path

1. `/demo` boots Acme with Slack + Sheets + Freshdesk + Looker + WhatsApp connected
2. **Command Center** — neural orbit, live request stream, apply corrections, execute
3. Paste any message from WhatsApp/Slack/Sheet/Freshdesk/Looker into **Feed the brain**
4. Hit **Neural pull** to simulate the next live event
