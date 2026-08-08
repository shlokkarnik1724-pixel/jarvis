import { NextResponse } from "next/server";
import { requireOrgSession } from "@/lib/auth";
import { readDb } from "@/lib/db";
import { isSkillActive } from "@/lib/graph";
import { exportForFramework, AGENT_SYSTEM_MANIFEST } from "@/lib/manifest";
import { sopMarkdown } from "@/lib/sop";

/**
 * Export the whole company brain as an executable skills pack —
 * the missing layer between raw company data and reliable AI automation.
 */
export async function GET(req: Request) {
  try {
    const session = await requireOrgSession();
    const { searchParams } = new URL(req.url);
    const framework = (searchParams.get("framework") || "json") as
      | "langchain"
      | "crewai"
      | "autogen"
      | "webhook"
      | "json"
      | "yaml";
    const activeOnly = searchParams.get("active") !== "0";

    const db = await readDb();
    const org = db.organizations.find((o) => o.id === session.organizationId);
    let skills = db.skills.filter(
      (s) => s.organizationId === session.organizationId
    );
    if (activeOnly) {
      skills = skills.filter((s) => isSkillActive(s));
    }

    const conversations = db.conversations.filter(
      (c) => c.organizationId === session.organizationId
    );
    const byConv = Object.fromEntries(conversations.map((c) => [c.id, c]));

    const operatingMap = {
      Discounting: skills.filter((s) => s.category === "Discounting"),
      Refunds: skills.filter((s) => s.category === "Refunds"),
      Escalation: skills.filter((s) => s.category === "Escalation"),
      "Incident Response": skills.filter(
        (s) => s.category === "Incident Response"
      ),
      Other: skills.filter((s) => s.category === "Other"),
    };

    const skillFiles = skills.map((skill) => {
      const pack = exportForFramework(skill, framework);
      const source = byConv[skill.conversationId];
      return {
        id: skill.id,
        title: skill.title,
        category: skill.category,
        status: skill.status,
        active: isSkillActive(skill),
        valid_from: skill.validFrom,
        valid_to: skill.validTo,
        source_ref: source?.sourceRef || null,
        filename: pack.filename,
        content: pack.content,
        sop: sopMarkdown(skill.jsonSchema),
        executable: {
          if: skill.jsonSchema.condition,
          then: skill.jsonSchema.action,
          confidence: skill.confidence,
          provenance: skill.jsonSchema.source_excerpt,
        },
      };
    });

    const pack = {
      company_brain: {
        name: org?.name || "Company Brain",
        product: "Tactix AI",
        thesis:
          "A living map of how the company works — structured into executable skills files for AI agents.",
        generated_at: new Date().toISOString(),
        framework,
        active_only: activeOnly,
        skill_count: skillFiles.length,
      },
      operating_map: Object.fromEntries(
        Object.entries(operatingMap).map(([k, v]) => [
          k,
          v.map((s) => ({
            id: s.id,
            title: s.title,
            if: s.jsonSchema.condition,
            then: s.jsonSchema.action,
            active: isSkillActive(s),
          })),
        ])
      ),
      skills: skillFiles,
      manifest: AGENT_SYSTEM_MANIFEST,
    };

    return NextResponse.json(pack);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
