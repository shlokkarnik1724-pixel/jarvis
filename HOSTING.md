# Make Circle a real shared app for friends

This turns the demo into a multi-user product: Google or email login, create/join a circle, shared events/vault/tabs/games.

## 1) Create a free Supabase project

1. Go to https://supabase.com → New project
2. **Authentication → Providers**
   - Enable **Email** (turn OFF “Confirm email” for fastest friend invites, or leave ON)
   - Optionally enable **Google** (add Google Cloud OAuth client IDs)
3. **SQL → New query** — run in order:
   - `supabase/schema.sql`
   - `supabase/schema_bootstrap.sql`
4. **Storage** — confirm private bucket `vault` exists (created by schema)

## 2) Copy keys into hosting (Vercel)

In Supabase: **Project Settings → API** and **Database**

| Env var | Where |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` `public` key |
| `SUPABASE_SERVICE_ROLE_KEY` | `service_role` key (keep secret) |
| `DATABASE_URL` | Database → URI (use connection pooling URI if offered) |
| `NEXT_PUBLIC_SITE_URL` | `https://YOUR-APP.vercel.app` |
| `NEXT_PUBLIC_APP_URL` | same as above |

Also add the same redirect URL in Supabase Auth:
`https://YOUR-APP.vercel.app/auth/callback`

## 3) Deploy

1. Merge PR branch `cursor/circle-web-portal-scaffold-2391`
2. Import repo on https://vercel.com/new
3. Paste env vars → Deploy

## 4) Use it with friends

1. You open the Vercel URL → **Create account** (email) or Google
2. **Create a circle** on onboarding
3. Open **Settings** → copy **invite code**
4. Friend signs up → **Join with invite code**
5. Shared events, vault uploads, tabs, games, roast/toast all persist in Supabase

## 5) Local run with real auth

```bash
cp .env.example .env.local
# fill real Supabase keys
npm install
npm run dev
```

Demo mode only runs when Supabase URL still contains `YOUR_PROJECT`.

## Auth options

- **Email/password** — best for circulating with friends quickly
- **Google OAuth** — enable in Supabase + Google Cloud console
- **Preview demo** — local/demo only; not for real friend groups
