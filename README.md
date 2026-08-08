# Circle Web Portal

Privacy-first social hub for closed friend groups ("circles").

## Stack

- Next.js 16 (App Router + `proxy.ts`)
- TypeScript (strict)
- Tailwind CSS + Shadcn-style UI primitives
- Supabase Auth / Postgres / Realtime / private Storage
- Prisma ORM 7 (`@prisma/adapter-pg`)
- Zustand + TanStack Query
- Web Crypto (AES-GCM) + HTML5 Canvas vault viewer

## Features

- Google OAuth (Supabase) with demo-mode fallback
- Dashboard, events, shopping claims, check-ins
- Secure Photo Vault (`/api/vault/stream/[id]` + canvas viewer)
- Leaderboard, vibe generator, roast & toast, tab settlements
- Realtime-ready game state machine (Mafia, Trivia, Prediction League, Myth Buster)

## Quick start (demo)

```bash
npm install
npm run dev
```

Open http://127.0.0.1:3000 and click **Continue with Google** — without Supabase keys the app enters demo mode automatically.

## Production setup

1. Copy `.env.example` → `.env.local`
2. Create a Supabase project, enable Google provider
3. Run `supabase/schema.sql` in the SQL editor
4. Create a private Storage bucket named `vault`
5. Set `DATABASE_URL` to the Supabase Postgres connection string
6. Run `npx prisma generate`

```bash
npm run build
npm start
```

## Security notes

- Vault assets never use public storage URLs or `<img>` tags
- Canvas overlay blocks context menu / drag
- `canvas.toDataURL` / `toBlob` are overridden in the vault viewer
- Dynamic watermark stamps viewer identity onto pixels
- RLS policies scope all circle data by membership

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Local development server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test:unit` | Settlement + game state unit checks |
| `npm run prisma:generate` | Generate Prisma client |
