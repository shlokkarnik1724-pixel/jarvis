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

    const systemPrompt = [
      "You are an enterprise AI agent. Apply this approved company skill exactly.",
      "",
      `Skill ID: ${skill.id}`,
      `Skill: ${skill.jsonSchema.title}`,
      `Status: ${skill.status}`,
      `IF ${skill.jsonSchema.condition}`,
      `THEN ${skill.jsonSchema.action}`,
      `Category: ${skill.jsonSchema.category}`,
      `Source: ${conversation?.sourceRef || "conversation"}`,
      `Source excerpt: "${skill.jsonSchema.source_excerpt}"`,
      "",
      "Cite this skill and its source when answering. Do not invent conflicting policies.",
    ].join("\n");

    const yaml = [
      `id: ${skill.id}`,
      `title: ${JSON.stringify(skill.jsonSchema.title)}`,
      `status: ${skill.status}`,
      `condition: ${JSON.stringify(skill.jsonSchema.condition)}`,
      `action: ${JSON.stringify(skill.jsonSchema.action)}`,
      `category: ${skill.jsonSchema.category}`,
      `confidence: ${skill.jsonSchema.confidence}`,
      `source_ref: ${JSON.stringify(conversation?.sourceRef || "")}`,
      `source_excerpt: ${JSON.stringify(skill.jsonSchema.source_excerpt)}`,
      `flagged_fields:`,
      ...(skill.jsonSchema.flagged_fields.length
        ? skill.jsonSchema.flagged_fields.map((f) => `  - ${JSON.stringify(f)}`)
        : ["  []"]),
    ].join("\n");

    // Simple conflict scan: same category approved skills with different actions
    const conflicts = db.skills
      .filter(
        (s) =>
          s.organizationId === session.organizationId &&
          s.id !== skill.id &&
          s.status === "approved" &&
          s.category === skill.category
      )
      .filter((s) => {
        const a = s.jsonSchema.condition.toLowerCase();
        const b = skill.jsonSchema.condition.toLowerCase();
        const overlap = a
          .split(/\s+/)
          .filter((w) => w.length > 4 && b.includes(w)).length;
        return overlap >= 2 && s.jsonSchema.action !== skill.jsonSchema.action;
      })
      .map((s) => ({
        id: s.id,
        title: s.title,
        action: s.jsonSchema.action,
      }));

    return NextResponse.json({
      skill,
      conversation,
      exports: {
        json: skill.jsonSchema,
        yaml,
        systemPrompt,
      },
      conflicts,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
