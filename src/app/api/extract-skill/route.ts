import { NextResponse } from "next/server";
import { z } from "zod";
import { requireOrgSession } from "@/lib/auth";
import { id, now, updateDb } from "@/lib/db";
import { extractSkillFromConversation } from "@/lib/extract";
import type { SkillCategory } from "@/lib/types";

const schema = z.object({
  text: z.string().min(20, "Paste a longer conversation"),
  category: z
    .enum([
      "Refunds",
      "Escalation",
      "Discounting",
      "Incident Response",
      "Other",
    ])
    .optional(),
  sourceRef: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await requireOrgSession();
    const body = schema.parse(await req.json());

    const { skill: extracted, provider } = await extractSkillFromConversation(
      body.text,
      body.category as SkillCategory | undefined
    );

    const result = await updateDb((db) => {
      const manualSource =
        (db.connectors || db.dataSources).find(
          (d) =>
            d.organizationId === session.organizationId &&
            d.provider === "manual"
        ) ||
        (() => {
          const ds = {
            id: id("conn"),
            organizationId: session.organizationId,
            provider: "manual",
            name: "Paste Conversation",
            status: "connected" as const,
            createdAt: now(),
          };
          db.connectors.push(ds);
          db.dataSources.push(ds);
          return ds;
        })();

      const conversation = {
        id: id("conv"),
        organizationId: session.organizationId,
        dataSourceId: manualSource.id,
        connectorId: manualSource.id,
        rawText: body.text,
        sourceRef: body.sourceRef?.trim() || "Manual paste",
        createdAt: now(),
      };
      db.conversations.push(conversation);

      const skill = {
        id: id("skl"),
        organizationId: session.organizationId,
        conversationId: conversation.id,
        title: extracted.title,
        jsonSchema: extracted,
        status: "pending" as const,
        confidence: extracted.confidence,
        category: extracted.category,
        createdAt: now(),
        updatedAt: now(),
      };
      db.skills.push(skill);

      db.skillVersions.push({
        id: id("ver"),
        skillId: skill.id,
        jsonSchema: extracted,
        editedBy: session.userId,
        createdAt: now(),
      });

      db.activities.push({
        id: id("act"),
        organizationId: session.organizationId,
        message: `New skill extracted: "${skill.title}" from ${conversation.sourceRef}`,
        createdAt: now(),
      });

      return { skill, conversation, provider };
    });

    return NextResponse.json({
      ok: true,
      skillId: result.skill.id,
      skill: result.skill,
      provider: result.provider,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Extraction failed";
    if (message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (message === "NO_ORG") {
      return NextResponse.json(
        { error: "Create or join a workspace first" },
        { status: 403 }
      );
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
