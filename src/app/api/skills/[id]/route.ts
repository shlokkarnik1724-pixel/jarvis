import { NextResponse } from "next/server";
import { requireOrgSession } from "@/lib/auth";
import { readDb } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireOrgSession();
    const { id } = await params;
    const db = await readDb();

    const skill = db.skills.find(
      (s) => s.id === id && s.organizationId === session.organizationId
    );
    if (!skill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    const conversation = db.conversations.find(
      (c) => c.id === skill.conversationId
    );
    const versions = db.skillVersions
      .filter((v) => v.skillId === skill.id)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    return NextResponse.json({ skill, conversation, versions });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed";
    if (message === "UNAUTHORIZED" || message === "NO_ORG") {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
