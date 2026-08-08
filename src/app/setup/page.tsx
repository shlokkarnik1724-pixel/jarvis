import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/config";
import { Badge } from "@/components/ui";

export default function SetupPage() {
  const configured = isSupabaseConfigured();

  return (
    <div className="atmosphere min-h-screen px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="font-display text-2xl">
          Tactix <span className="text-[var(--accent)]">AI</span>
        </Link>
        <h1 className="mt-8 font-display text-4xl tracking-tight">
          Connect Supabase + Google Auth
        </h1>
        <p className="mt-3 text-[var(--ink-muted)] max-w-2xl">
          Real login, Google OAuth, and multi-tenant company data live in your
          Supabase project. Follow these steps once — then every teammate can
          sign in.
        </p>

        <div className="mt-6">
          <Badge tone={configured ? "ok" : "warn"}>
            {configured
              ? "Supabase keys detected in environment"
              : "Supabase keys missing"}
          </Badge>
        </div>

        <ol className="mt-10 space-y-6 text-sm leading-relaxed">
          <li className="rounded-md border border-[var(--line)] bg-white p-5">
            <p className="font-display text-lg">1. Create a Supabase project</p>
            <p className="mt-2 text-[var(--ink-muted)]">
              Go to{" "}
              <a
                className="text-[var(--accent)] underline"
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
              >
                supabase.com/dashboard
              </a>{" "}
              → New project. Copy Project URL and anon public key into{" "}
              <code className="bg-[var(--bg)] px-1 rounded">.env.local</code>:
            </p>
            <pre className="mt-3 overflow-auto rounded bg-[var(--ink)] p-4 text-xs text-[#d7e8e4]">
{`NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
OPENAI_API_KEY=sk-...   # optional`}
            </pre>
          </li>
          <li className="rounded-md border border-[var(--line)] bg-white p-5">
            <p className="font-display text-lg">2. Run the database schema</p>
            <p className="mt-2 text-[var(--ink-muted)]">
              In Supabase → SQL Editor, paste and run{" "}
              <code className="bg-[var(--bg)] px-1 rounded">
                supabase/schema.sql
              </code>{" "}
              from this repo (creates orgs, memberships, connectors, skills,
              brain messages, RLS).
            </p>
          </li>
          <li className="rounded-md border border-[var(--line)] bg-white p-5">
            <p className="font-display text-lg">3. Enable Google Auth</p>
            <p className="mt-2 text-[var(--ink-muted)]">
              Supabase → Authentication → Providers → Google → Enable. Add Google
              Cloud OAuth Client ID/Secret. Authorized redirect URI:
            </p>
            <pre className="mt-3 overflow-auto rounded bg-[var(--bg)] p-3 text-xs">
              https://YOUR_PROJECT.supabase.co/auth/v1/callback
            </pre>
            <p className="mt-2 text-[var(--ink-muted)]">
              Also add{" "}
              <code className="bg-[var(--bg)] px-1 rounded">
                http://localhost:3000/auth/callback
              </code>{" "}
              under Authentication → URL Configuration → Redirect URLs.
            </p>
            <p className="mt-2 text-[var(--ink-muted)]">
              Tip for demos: Authentication → Providers → Email → disable
              “Confirm email” so signup is instant.
            </p>
          </li>
          <li className="rounded-md border border-[var(--line)] bg-white p-5">
            <p className="font-display text-lg">4. Restart & sign in</p>
            <pre className="mt-3 overflow-auto rounded bg-[var(--ink)] p-4 text-xs text-[#d7e8e4]">
{`npm run dev
# open http://localhost:3000/login
# Continue with Google  OR  email/password`}
            </pre>
          </li>
        </ol>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/login"
            className="rounded-md bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white"
          >
            Go to login
          </Link>
          <Link
            href="/"
            className="rounded-md border border-[var(--line)] bg-white px-4 py-2.5 text-sm"
          >
            Back home
          </Link>
        </div>
      </div>
    </div>
  );
}
