import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession, refreshSessionForUser } from "@/lib/auth";
import { id, now, updateDb } from "@/lib/db";
import { isSupabaseConfigured } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  inviteCode: z.string().min(3),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const code = body.inviteCode.trim().toUpperCase();

    if (isSupabaseConfigured()) {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { data: organization } = await supabase
        .from("organizations")
        .select("*")
        .eq("invite_code", code)
        .maybeSingle();
      if (!organization) {
        return NextResponse.json({ error: "Invalid invite code" }, { status: 404 });
      }

      const { error } = await supabase.from("memberships").insert({
        user_id: user.id,
        organization_id: organization.id,
        role: "member",
      });
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      await supabase.from("activities").insert({
        organization_id: organization.id,
        message: `${user.email} joined the workspace`,
      });

      return NextResponse.json({
        ok: true,
        organization: { id: organization.id, name: organization.name },
      });
    }

    const session = await requireSession();
    const org = await updateDb((db) => {
      const existing = db.memberships.find((m) => m.userId === session.userId);
      if (existing) throw new Error("ALREADY_IN_ORG");

      const organization = db.organizations.find(
        (o) => o.inviteCode.toUpperCase() === code
      );
      if (!organization) throw new Error("INVALID_INVITE");

      db.memberships.push({
        id: id("mem"),
        userId: session.userId,
        organizationId: organization.id,
        role: "member",
        createdAt: now(),
      });

      db.activities.push({
        id: id("act"),
        organizationId: organization.id,
        message: `${session.name} joined the workspace`,
        createdAt: now(),
      });

      return organization;
    });

    await refreshSessionForUser(session.userId);
    return NextResponse.json({
      ok: true,
      organization: { id: org.id, name: org.name },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to join workspace";
    if (message === "INVALID_INVITE") {
      return NextResponse.json({ error: "Invalid invite code" }, { status: 404 });
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
