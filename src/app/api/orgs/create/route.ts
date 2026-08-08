import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession, refreshSessionForUser } from "@/lib/auth";
import { id, now, updateDb } from "@/lib/db";
import { buildDemoSeed } from "@/lib/seed";
import { isSupabaseConfigured, CONNECTOR_CATALOG } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  name: z.string().min(1),
  industry: z.enum(["SaaS", "Support", "Agency", "Other"]),
  teamSize: z.string().min(1),
  primaryUseCase: z.enum(["Support Ops", "Engineering", "Sales"]),
  seedExamples: z.boolean().optional(),
});

function inviteCode() {
  return `TX-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
}

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());

    if (isSupabaseConfigured()) {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { data: existing } = await supabase
        .from("memberships")
        .select("id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();
      if (existing) {
        return NextResponse.json(
          { error: "You already belong to a workspace" },
          { status: 400 }
        );
      }

      const code = inviteCode();
      const { data: org, error: orgErr } = await supabase
        .from("organizations")
        .insert({
          name: body.name.trim(),
          industry: body.industry,
          team_size: body.teamSize,
          primary_use_case: body.primaryUseCase,
          invite_code: code,
          created_by: user.id,
        })
        .select("*")
        .single();
      if (orgErr || !org) {
        return NextResponse.json(
          { error: orgErr?.message || "Failed to create org" },
          { status: 400 }
        );
      }

      const { error: memErr } = await supabase.from("memberships").insert({
        user_id: user.id,
        organization_id: org.id,
        role: "admin",
      });
      if (memErr) {
        return NextResponse.json({ error: memErr.message }, { status: 400 });
      }

      await supabase.from("connectors").insert(
        CONNECTOR_CATALOG.map((c) => ({
          organization_id: org.id,
          provider: c.provider,
          name: c.name,
          status: c.provider === "manual" ? "connected" : "disconnected",
          meta: { blurb: c.blurb, category: c.category },
        }))
      );

      await supabase.from("activities").insert({
        organization_id: org.id,
        message: `Workspace "${org.name}" created — connect Slack, Teams, Zoho, Sheets, Zoom to wake the brain`,
      });

      return NextResponse.json({ ok: true, organization: org });
    }

    // Local JSON mode
    const session = await requireSession();
    const org = await updateDb((db) => {
      const existing = db.memberships.find((m) => m.userId === session.userId);
      if (existing) throw new Error("ALREADY_IN_ORG");

      if (body.seedExamples !== false) {
        const seed = buildDemoSeed(session.userId);
        seed.org.name = body.name.trim();
        seed.org.industry = body.industry;
        seed.org.teamSize = body.teamSize;
        seed.org.primaryUseCase = body.primaryUseCase;
        seed.org.createdBy = session.userId;

        db.organizations.push(seed.org);
        db.memberships.push(seed.membership);
        db.connectors.push(...seed.connectors);
        db.dataSources.push(...seed.connectors);
        db.conversations.push(...seed.conversations);
        db.skills.push(...seed.skills);
        db.skillVersions.push(...seed.skillVersions);
        db.activities.push(...seed.activities);
        db.routingItems.push(...seed.routingItems);
        db.ingestionEvents.push(...(seed.ingestionEvents || []));
        return seed.org;
      }

      const organization = {
        id: id("org"),
        name: body.name.trim(),
        industry: body.industry,
        teamSize: body.teamSize,
        primaryUseCase: body.primaryUseCase,
        inviteCode: inviteCode(),
        createdBy: session.userId,
        createdAt: now(),
      };
      db.organizations.push(organization);
      db.memberships.push({
        id: id("mem"),
        userId: session.userId,
        organizationId: organization.id,
        role: "admin",
        createdAt: now(),
      });
      for (const c of CONNECTOR_CATALOG) {
        db.connectors.push({
          id: id("conn"),
          organizationId: organization.id,
          provider: c.provider,
          name: c.name,
          status: c.provider === "manual" ? "connected" : "disconnected",
          meta: { blurb: c.blurb, category: c.category },
          createdAt: now(),
        });
      }
      return organization;
    });

    await refreshSessionForUser(session.userId);
    return NextResponse.json({ ok: true, organization: org });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Failed to create workspace";
    if (message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (message === "ALREADY_IN_ORG") {
      return NextResponse.json(
        { error: "You already belong to a workspace" },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
