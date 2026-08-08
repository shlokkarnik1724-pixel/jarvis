import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession, refreshSessionForUser } from "@/lib/auth";
import { id, now, updateDb } from "@/lib/db";

const schema = z.object({
  name: z.string().min(1),
  industry: z.enum(["SaaS", "Support", "Agency", "Other"]),
  teamSize: z.string().min(1),
  primaryUseCase: z.enum(["Support Ops", "Engineering", "Sales"]),
});

export async function POST(req: Request) {
  try {
    const session = await requireSession();
    const body = schema.parse(await req.json());

    const org = await updateDb((db) => {
      const existing = db.memberships.find((m) => m.userId === session.userId);
      if (existing) {
        throw new Error("ALREADY_IN_ORG");
      }

      const organization = {
        id: id("org"),
        name: body.name.trim(),
        industry: body.industry,
        teamSize: body.teamSize,
        primaryUseCase: body.primaryUseCase,
        inviteCode: id("inv").toUpperCase().replace("INV_", "TX-"),
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

      // Seed default data sources (manual connected; others coming soon)
      const sources = [
        { type: "manual" as const, name: "Paste Conversation", status: "connected" as const },
        { type: "slack" as const, name: "Slack", status: "coming_soon" as const },
        { type: "zendesk" as const, name: "Zendesk", status: "coming_soon" as const },
        { type: "email" as const, name: "Gmail / Outlook", status: "coming_soon" as const },
        { type: "fireflies" as const, name: "Fireflies / Gong", status: "coming_soon" as const },
      ];

      for (const s of sources) {
        db.dataSources.push({
          id: id("ds"),
          organizationId: organization.id,
          type: s.type,
          name: s.name,
          status: s.status,
          createdAt: now(),
        });
      }

      db.activities.push({
        id: id("act"),
        organizationId: organization.id,
        message: `Workspace "${organization.name}" created`,
        createdAt: now(),
      });

      return organization;
    });

    await refreshSessionForUser(session.userId);

    return NextResponse.json({ ok: true, organization: org });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create workspace";
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
