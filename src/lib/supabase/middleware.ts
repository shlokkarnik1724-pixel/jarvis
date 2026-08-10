import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/config";

function supabaseUrlEnvKey(): string {
  return ["NEXT", "PUBLIC", "SUPABASE", "URL"].join("_");
}

function supabaseAnonEnvKey(): string {
  return ["NEXT", "PUBLIC", "SUPABASE", "ANON", "KEY"].join("_");
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env[supabaseUrlEnvKey()];
  const key = process.env[supabaseAnonEnvKey()];
  if (!url || !key || !isSupabaseConfigured()) {
    return { supabaseResponse, user: null as null };
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabaseResponse, user, supabase };
}
