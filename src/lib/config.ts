function supabaseUrlEnvKey(): string {
  return ["NEXT", "PUBLIC", "SUPABASE", "URL"].join("_");
}

function supabaseAnonEnvKey(): string {
  return ["NEXT", "PUBLIC", "SUPABASE", "ANON", "KEY"].join("_");
}

function looksLikeHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function looksLikeSupabaseAnonKey(value: string): boolean {
  if (!value || value.includes("YOUR_ANON_KEY")) return false;
  // Reject env-name paste mistakes (e.g. anon key set to another env var name).
  if (/^NEXT_PUBLIC_[A-Z0-9_]+$/.test(value)) return false;
  // Real Supabase anon keys are JWTs; demo/placeholder keys are short strings.
  return value.startsWith("eyJ") && value.length > 40;
}

export function isSupabaseConfigured(): boolean {
  const url = process.env[supabaseUrlEnvKey()];
  const anonKey = process.env[supabaseAnonEnvKey()];
  return Boolean(
    url &&
      anonKey &&
      looksLikeHttpUrl(url) &&
      !url.includes("YOUR_PROJECT") &&
      looksLikeSupabaseAnonKey(anonKey)
  );
}

export function isDatabaseConfigured(): boolean {
  const url = process.env.DATABASE_URL;
  return Boolean(url && !url.includes("johndoe") && !url.includes("randompassword"));
}

export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000"
  );
}

export const DEMO_MODE = !isSupabaseConfigured();
