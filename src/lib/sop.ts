import type { SkillCategory, SkillSchema, SopStep } from "./types";

/** Human-readable SOP alongside machine skill JSON */
export function buildSopSteps(skill: {
  title: string;
  condition: string;
  action: string;
  category: SkillCategory;
  source_excerpt: string;
}): SopStep[] {
  const ownerByCategory: Record<SkillCategory, string> = {
    Discounting: "Account Executive / Sales Manager",
    Refunds: "Support Agent / CS Lead",
    Escalation: "L1 Support / On-call",
    "Incident Response": "SRE / Incident Commander",
    Other: "Ops owner",
  };

  return [
    {
      step: 1,
      title: "Detect trigger",
      detail: `Watch for: ${skill.condition}`,
      owner: "Tactix passive listeners",
    },
    {
      step: 2,
      title: "Validate context",
      detail: `Confirm category (${skill.category}) and that the source evidence still matches: “${skill.source_excerpt.slice(0, 120)}”`,
      owner: ownerByCategory[skill.category],
    },
    {
      step: 3,
      title: "Execute policy",
      detail: skill.action,
      owner: ownerByCategory[skill.category],
    },
    {
      step: 4,
      title: "Record provenance",
      detail: `Log skill application with timestamp, source conversation, and bi-temporal validity window.`,
      owner: "Tactix governance",
    },
    {
      step: 5,
      title: "Hand off / notify",
      detail: `If confidence flags exist or amount exceeds policy, route to the suggested owner instead of auto-acting.`,
      owner: "Routing Inbox",
    },
  ];
}

export function withSop(schema: SkillSchema): SkillSchema {
  if (schema.sop_steps?.length) return schema;
  return {
    ...schema,
    sop_steps: buildSopSteps(schema),
  };
}

export function sopMarkdown(schema: SkillSchema): string {
  const steps = schema.sop_steps?.length
    ? schema.sop_steps
    : buildSopSteps(schema);
  return [
    `# SOP: ${schema.title}`,
    ``,
    `**Category:** ${schema.category}`,
    `**Trigger (IF):** ${schema.condition}`,
    `**Policy (THEN):** ${schema.action}`,
    ``,
    `## Steps`,
    ...steps.map(
      (s) =>
        `${s.step}. **${s.title}**${s.owner ? ` _(Owner: ${s.owner})_` : ""}\n   ${s.detail}`
    ),
    ``,
    `## Source excerpt`,
    `> ${schema.source_excerpt}`,
  ].join("\n");
}
