# Make Circle a real shared app for friends

## Your current Vercel URL

https://jarvis-shlokkarnik1724-5935s-projects.vercel.app

If that redirects to a Vercel login page, Deployment Protection is still ON.

### Make it public (required for friends)
1. Vercel → project **jarvis** → **Settings** → **Deployment Protection**
2. Turn **Production** protection **Off**
3. Open the URL again — you should see Circle login

### Add Supabase env (required for real accounts)
Vercel → **Settings** → **Environment Variables** (Production):

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | from Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key |
| `DATABASE_URL` | Supabase Database URI |
| `NEXT_PUBLIC_SITE_URL` | `https://jarvis-shlokkarnik1724-5935s-projects.vercel.app` |
| `NEXT_PUBLIC_APP_URL` | same as SITE_URL |

Then **Deployments → … → Redeploy** (required — `NEXT_PUBLIC_*` vars only apply after a new build).

In Supabase SQL editor run:
1. `supabase/schema.sql`
2. `supabase/schema_bootstrap.sql`

Auth → Email enabled (optional: disable Confirm email for faster friend invites).  
Auth → URL config: Site URL + redirect `https://jarvis-shlokkarnik1724-5935s-projects.vercel.app/auth/callback`

## Friend flow
1. You open the Vercel URL → Create account
2. Create a circle
3. Settings → copy invite code
4. Friends sign up → Join with invite code
