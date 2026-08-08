import { NextResponse } from "next/server";
import { requireOrgSession } from "@/lib/auth";
import { readDb } from "@/lib/db";

export async function GET() {
  try {
    const session = await requireOrgSession();
    const db = await readDb();
    const orgId = session.organizationId;

    const skills = db.skills.filter((s) => s.organizationId === orgId);
    const sources = db.dataSources.filter(
      (d) => d.organizationId === orgId && d.status === "connected"
    );
    const connectors = (db.connectors || []).filter(
      (d) => d.organizationId === orgId && d.status === "connected"
    );
    const activities = db.activities
      .filter((a) => a.organizationId === orgId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 12);

    const members = db.memberships
      .filter((m) => m.organizationId === orgId)
      .map((m) => {
        const user = db.users.find((u) => u.id === m.userId);
        return {
          id: m.id,
          role: m.role,
          name: user?.name ?? "Unknown",
          email: user?.email ?? "",
          joinedAt: m.createdAt,
        };
      });

    const org = db.organizations.find((o) => o.id === orgId);

    return NextResponse.json({
      stats: {
        extracted: skills.length,
        pending: skills.filter((s) => s.status === "pending").length,
        approved: skills.filter((s) => s.status === "approved").length,
        rejected: skills.filter((s) => s.status === "rejected").length,
        dataSources: Math.max(sources.length, connectors.length),
        connectors: connectors.length,
      },
      activities,
      members,
      dataSources: db.dataSources.filter((d) => d.organizationId === orgId),
      connectors: (db.connectors || []).filter(
        (d) => d.organizationId === orgId
      ),
      organization: org,
      routingOpen: (db.routingItems || []).filter(
        (r) => r.organizationId === orgId && r.status === "open"
      ).length,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed";
    if (message === "UNAUTHORIZED" || message === "NO_ORG") {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
