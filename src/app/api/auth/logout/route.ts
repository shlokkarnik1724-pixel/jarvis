import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      await supabase.auth.signOut();
    } catch {
      // continue clearing local cookie too
    }
  }
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
