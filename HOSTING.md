# Hosting Circle Web Portal

## Live demo (this Cloud Agent session)

**Public URL:** https://again-favors-charts-implied.trycloudflare.com

1. Open the link
2. Click **Enter Circle (Demo)**
3. Explore dashboard, vault, tabs, games

Backup tunnel (may show a password page — enter `16.58.190.11`):  
https://wet-towns-juggle.loca.lt

> These tunnels stay live while this Cloud Agent run is active. For a permanent site, deploy below.

## Deploy to your own hosting (recommended)

### Option A — Vercel (fastest for Next.js)

1. Merge/pull branch `cursor/circle-web-portal-scaffold-2391`
2. Import the GitHub repo at https://vercel.com/new
3. Leave build command as default (`prisma generate && next build` via `vercel.json`)
4. Add env vars from `.env.example` (optional for demo mode — leave Supabase as placeholders to keep demo login)
5. Deploy → you get a permanent `*.vercel.app` URL

### Option B — Any Node host (Railway, Render, VPS)

```bash
npm install
npm run build
npm run start
```

Listens on `0.0.0.0:3000`. Set `PORT` if your host requires it.

### Option C — Cursor Desktop port forward

With the Cloud Agent connected in Cursor Desktop, open the plug icon (ports) and open forwarded **localhost:3000**.

## Demo vs production auth

| Mode | When | How to enter |
|---|---|---|
| Demo | Supabase URL still `YOUR_PROJECT` | **Enter Circle (Demo)** |
| Google OAuth | Real Supabase keys + Google provider | Same button starts Google login |

Run `supabase/schema.sql` and create a private Storage bucket named `vault` before enabling production auth.
