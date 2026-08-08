export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("YOUR_PROJECT")
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
