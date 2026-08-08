import { NextResponse } from "next/server";
import { requireOrgSession } from "@/lib/auth";
import { readDb } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await requireOrgSession();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");

    const db = await readDb();
    let skills = db.skills.filter(
      (s) => s.organizationId === session.organizationId
    );

    if (status && status !== "all") {
      skills = skills.filter((s) => s.status === status);
    }
    if (category && category !== "all") {
      skills = skills.filter((s) => s.category === category);
    }

    skills.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    const enriched = skills.map((s) => {
      const conv = db.conversations.find((c) => c.id === s.conversationId);
      return {
        ...s,
        sourceRef: conv?.sourceRef ?? "Unknown",
      };
    });

    return NextResponse.json({ skills: enriched });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed";
    if (message === "UNAUTHORIZED" || message === "NO_ORG") {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
