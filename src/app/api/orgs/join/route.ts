import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession, refreshSessionForUser } from "@/lib/auth";
import { id, now, updateDb } from "@/lib/db";

const schema = z.object({
  inviteCode: z.string().min(3),
});

export async function POST(req: Request) {
  try {
    const session = await requireSession();
    const body = schema.parse(await req.json());
    const code = body.inviteCode.trim().toUpperCase();

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
    if (message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (message === "INVALID_INVITE") {
      return NextResponse.json({ error: "Invalid invite code" }, { status: 404 });
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
