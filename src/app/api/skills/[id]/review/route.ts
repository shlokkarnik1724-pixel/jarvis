import { NextResponse } from "next/server";
import { z } from "zod";
import { requireOrgSession } from "@/lib/auth";
import { id, now, updateDb } from "@/lib/db";
import { skillSchemaZod } from "@/lib/extract";
import { withSop } from "@/lib/sop";
import { applySupersession } from "@/lib/graph";

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

    const result = await updateDb((db) => {
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
        return { skill: existing, invalidated: [] as string[] };
      }

      const nextSchema = withSop(
        body.action === "edit_approve" && body.skill
          ? body.skill
          : existing.jsonSchema
      );
      const at = now();

      existing.jsonSchema = nextSchema;
      existing.title = nextSchema.title;
      existing.category = nextSchema.category;
      existing.confidence = nextSchema.confidence;
      existing.status = "approved";
      existing.validFrom = existing.validFrom || at;
      existing.validTo = null;
      existing.supersededBy = null;
      existing.updatedAt = at;

      const { invalidated } = applySupersession(db.skills, existing, at);

      db.skillVersions.push({
        id: id("ver"),
        skillId: existing.id,
        jsonSchema: nextSchema,
        editedBy: session.userId,
        createdAt: at,
      });

      db.activities.push({
        id: id("act"),
        organizationId: session.organizationId,
        message: `Skill approved: "${existing.title}" (v${db.skillVersions.filter((v) => v.skillId === existing.id).length})${
          invalidated.length
            ? ` · auto-invalidated ${invalidated.length} superseded policy(s)`
            : ""
        }`,
        createdAt: at,
      });

      return {
        skill: existing,
        invalidated: invalidated.map((s) => s.id),
      };
    });

    return NextResponse.json({
      ok: true,
      skill: result.skill,
      invalidated: result.invalidated,
    });
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
