import { NextResponse } from "next/server";
import { z } from "zod";
import { requireOrgSession } from "@/lib/auth";
import { id, now, updateDb } from "@/lib/db";
import { skillSchemaZod } from "@/lib/extract";

const schema = z.object({
  action: z.enum(["approve", "reject", "edit_approve"]),
  skill: skillSchemaZod.optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireOrgSession();
    const { id: skillId } = await params;
    const body = schema.parse(await req.json());

    const skill = await updateDb((db) => {
      const existing = db.skills.find(
        (s) => s.id === skillId && s.organizationId === session.organizationId
      );
      if (!existing) throw new Error("NOT_FOUND");

      if (body.action === "reject") {
        existing.status = "rejected";
        existing.updatedAt = now();
        db.activities.push({
          id: id("act"),
          organizationId: session.organizationId,
          message: `Skill rejected: "${existing.title}"`,
          createdAt: now(),
        });
        return existing;
      }

      const nextSchema =
        body.action === "edit_approve" && body.skill
          ? body.skill
          : existing.jsonSchema;

      existing.jsonSchema = nextSchema;
      existing.title = nextSchema.title;
      existing.category = nextSchema.category;
      existing.confidence = nextSchema.confidence;
      existing.status = "approved";
      existing.updatedAt = now();

      db.skillVersions.push({
        id: id("ver"),
        skillId: existing.id,
        jsonSchema: nextSchema,
        editedBy: session.userId,
        createdAt: now(),
      });

      db.activities.push({
        id: id("act"),
        organizationId: session.organizationId,
        message: `Skill approved: "${existing.title}" (v${db.skillVersions.filter((v) => v.skillId === existing.id).length})`,
        createdAt: now(),
      });

      return existing;
    });

    return NextResponse.json({ ok: true, skill });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed";
    if (message === "NOT_FOUND") {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }
    if (message === "UNAUTHORIZED" || message === "NO_ORG") {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
