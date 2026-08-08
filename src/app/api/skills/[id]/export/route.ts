import { NextResponse } from "next/server";
import { requireOrgSession } from "@/lib/auth";
import { readDb } from "@/lib/db";
import { sopMarkdown } from "@/lib/sop";
import { exportForFramework, AGENT_SYSTEM_MANIFEST } from "@/lib/manifest";
import { isSkillActive } from "@/lib/graph";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireOrgSession();
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const framework = (searchParams.get("framework") || "json") as
      | "langchain"
      | "crewai"
      | "autogen"
      | "webhook"
      | "json"
      | "yaml";

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

    const conflicts = db.skills
      .filter(
        (s) =>
          s.organizationId === session.organizationId &&
          s.id !== skill.id &&
          (s.status === "approved" || s.status === "superseded") &&
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
        status: s.status,
        validTo: s.validTo,
      }));

    const pack = exportForFramework(skill, framework);

    return NextResponse.json({
      skill,
      conversation,
      active: isSkillActive(skill),
      sopMarkdown: sopMarkdown(skill.jsonSchema),
      exports: {
        json: skill.jsonSchema,
        yaml: exportForFramework(skill, "yaml").content,
        systemPrompt: [
          "You are an enterprise AI agent bound to an approved Tactix skill.",
          `Skill ID: ${skill.id}`,
          `IF ${skill.jsonSchema.condition}`,
          `THEN ${skill.jsonSchema.action}`,
          `Valid from ${skill.validFrom} to ${skill.validTo || "present"}`,
          `Source: ${conversation?.sourceRef || "conversation"}`,
          `Excerpt: "${skill.jsonSchema.source_excerpt}"`,
        ].join("\n"),
        sop: sopMarkdown(skill.jsonSchema),
        langchain: exportForFramework(skill, "langchain").content,
        crewai: exportForFramework(skill, "crewai").content,
        autogen: exportForFramework(skill, "autogen").content,
        webhook: exportForFramework(skill, "webhook").content,
        pack,
      },
      conflicts,
      manifest: AGENT_SYSTEM_MANIFEST,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
