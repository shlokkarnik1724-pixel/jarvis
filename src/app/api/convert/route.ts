import { NextResponse } from "next/server";
import { z } from "zod";
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
});

/** Public lead-magnet converter — no auth required. */
export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const { skill, provider } = await extractSkillFromConversation(
      body.text,
      body.category as SkillCategory | undefined
    );

    const systemPrompt = [
      "You are an enterprise AI agent. Apply this approved company skill exactly.",
      "",
      `Skill: ${skill.title}`,
      `IF ${skill.condition}`,
      `THEN ${skill.action}`,
      `Category: ${skill.category}`,
      `Source excerpt: "${skill.source_excerpt}"`,
      "",
      "Cite this skill when answering. Do not invent conflicting policies.",
    ].join("\n");

    const yaml = [
      `title: ${JSON.stringify(skill.title)}`,
      `condition: ${JSON.stringify(skill.condition)}`,
      `action: ${JSON.stringify(skill.action)}`,
      `category: ${skill.category}`,
      `confidence: ${skill.confidence}`,
      `source_excerpt: ${JSON.stringify(skill.source_excerpt)}`,
      `flagged_fields:`,
      ...(skill.flagged_fields.length
        ? skill.flagged_fields.map((f) => `  - ${JSON.stringify(f)}`)
        : ["  []"]),
    ].join("\n");

    return NextResponse.json({
      ok: true,
      skill,
      provider,
      exports: {
        json: skill,
        yaml,
        systemPrompt,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Conversion failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
