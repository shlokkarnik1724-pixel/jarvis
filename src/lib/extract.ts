import OpenAI from "openai";
import { z } from "zod";
import type { SkillCategory, SkillSchema } from "./types";
import { withSop } from "./sop";

export const skillSchemaZod = z.object({
  title: z.string(),
  condition: z.string(),
  action: z.string(),
  category: z.enum([
    "Refunds",
    "Escalation",
    "Discounting",
    "Incident Response",
    "Other",
  ]),
  confidence: z.number().min(0).max(1),
  source_excerpt: z.string(),
  flagged_fields: z.array(z.string()),
  sop_steps: z
    .array(
      z.object({
        step: z.number(),
        title: z.string(),
        detail: z.string(),
        owner: z.string().optional(),
      })
    )
    .optional(),
});

const SYSTEM_PROMPT = `You extract executable decision rules ("skills") AND human SOP steps from workplace conversations.
Return ONLY valid JSON matching this schema:
{
  "title": string,
  "condition": string (IF condition),
  "action": string (THEN action the agent should take),
  "category": "Refunds" | "Escalation" | "Discounting" | "Incident Response" | "Other",
  "confidence": number 0-1,
  "source_excerpt": exact quote from the conversation that justifies the rule,
  "flagged_fields": array of missing/ambiguous details,
  "sop_steps": [{ "step": number, "title": string, "detail": string, "owner": string }]
}
Focus on operational decision logic. Prefer one clear rule with 4-5 SOP steps.`;

function inferCategory(
  text: string,
  preferred?: SkillCategory
): SkillCategory {
  if (preferred && preferred !== "Other") return preferred;
  const t = text.toLowerCase();
  if (/(discount|pricing|deal|enterprise tier)/.test(t)) return "Discounting";
  if (/(refund|chargeback|money back|credit)/.test(t)) return "Refunds";
  if (/(escalat|vip|manager|tier.?2|priority)/.test(t)) return "Escalation";
  if (/(incident|outage|post.?mortem|pager|sev)/.test(t))
    return "Incident Response";
  return preferred || "Other";
}

function pickExcerpt(text: string): string {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const decisionLine =
    lines.find((l) =>
      /(cap at|permit|approve|no manager|policy|exception|go ahead)/i.test(l)
    ) ||
    lines.find((l) =>
      /(yes|allow|can |rule)/i.test(l)
    ) ||
    lines[Math.min(2, lines.length - 1)] ||
    text.slice(0, 160);
  return decisionLine.slice(0, 240);
}

/** Deterministic demo extractor so the MVP is runnable without an API key. */
export function demoExtractSkill(
  text: string,
  category?: SkillCategory
): SkillSchema {
  const resolved = inferCategory(text, category);
  const excerpt = pickExcerpt(text);
  const lower = text.toLowerCase();

  let title = "Operational Decision Rule";
  let condition = "A matching customer or incident scenario is detected";
  let action = "Apply the policy described in the source conversation";
  const flagged: string[] = [];

  if (resolved === "Discounting") {
    const cap =
      text.match(/cap(?:ped)?\s+at\s+(\d{1,2})\s*%/i) ||
      text.match(/up\s+to\s+(\d{1,2})\s*%/i) ||
      text.match(/(\d{1,2})\s*%\s+for\s+enterprise/i) ||
      [...text.matchAll(/(\d{1,2})\s*%/gi)].map((m) => m).at(-1);
    const percent = cap ? cap[1] : "15";
    title = "Enterprise Tier Discount Exception";
    condition = "Customer Tier = Enterprise";
    action = `Permit up to ${percent}% discount without manager sign-off`;
    if (!/expir|valid until|through/i.test(text)) {
      flagged.push("approval_expiry_date missing");
    }
    if (!/enterprise/i.test(text)) {
      flagged.push("customer_tier ambiguous — confirm Enterprise scope");
    }
  } else if (resolved === "Refunds") {
    title = "Refund Exception Policy";
    condition = /beyond|after|past/i.test(lower)
      ? "Customer requests refund outside standard window"
      : "Customer requests a refund for a qualifying issue";
    action = /partial/i.test(lower)
      ? "Issue a partial refund and document the exception"
      : "Approve refund per the exception discussed and notify finance";
    if (!/amount|\$\d|percent/i.test(text)) {
      flagged.push("refund_amount_limit missing");
    }
  } else if (resolved === "Escalation") {
    title = "Priority Escalation Rule";
    condition = /vip|enterprise/i.test(lower)
      ? "VIP or Enterprise customer reports a blocking issue"
      : "Issue severity or customer impact warrants escalation";
    action = "Escalate to the on-call manager and update the customer within the agreed SLA";
    if (!/sla|minute|hour/i.test(text)) {
      flagged.push("response_sla missing");
    }
  } else if (resolved === "Incident Response") {
    title = "Incident Response Runbook Step";
    condition = "A production incident matching the described severity is declared";
    action = "Follow the mitigation steps from the conversation and post status updates";
    flagged.push("severity_threshold not explicit");
  } else {
    title = "Captured Team Decision";
    condition = "Situation matches the discussion context";
    action = "Follow the agreed decision from the source thread";
    flagged.push("category unclear — please confirm");
  }

  const confidence =
    flagged.length === 0 ? 0.91 : flagged.length === 1 ? 0.84 : 0.72;

  return withSop({
    title,
    condition,
    action,
    category: resolved,
    confidence,
    source_excerpt: excerpt,
    flagged_fields: flagged,
  });
}

export async function extractSkillFromConversation(
  text: string,
  category?: SkillCategory
): Promise<{ skill: SkillSchema; provider: "openai" | "demo" }> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (!apiKey) {
    return { skill: demoExtractSkill(text, category), provider: "demo" };
  }

  try {
    const client = new OpenAI({ apiKey });
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `${category ? `Preferred category: ${category}\n\n` : ""}Conversation:\n${text}`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    const parsed = withSop(skillSchemaZod.parse(JSON.parse(raw)));
    return { skill: parsed, provider: "openai" };
  } catch {
    return { skill: demoExtractSkill(text, category), provider: "demo" };
  }
}

export async function simulateAgentResponse(input: {
  query: string;
  skill: SkillSchema;
  skillId: string;
  approvedAt: string;
  sourceRef: string;
}): Promise<{ response: string; provider: "openai" | "demo" }> {
  const citation = `This response was generated using Skill ${input.skillId}, approved on ${input.approvedAt}, sourced from ${input.sourceRef}.`;

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    const demo = [
      `Based on the approved skill **${input.skill.title}**:`,
      ``,
      `**Rule applied:** IF ${input.skill.condition} → THEN ${input.skill.action}`,
      ``,
      `For your question ("${input.query}"), the agent should follow this exact policy. Source excerpt: "${input.skill.source_excerpt}"`,
      ``,
      citation,
    ].join("\n");
    return { response: demo, provider: "demo" };
  }

  try {
    const client = new OpenAI({ apiKey });
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: `You are an enterprise AI agent. Answer using ONLY the approved skill below. Explicitly cite the skill title and source excerpt. End with this exact footer line:\n${citation}\n\nSkill JSON:\n${JSON.stringify(input.skill, null, 2)}`,
        },
        { role: "user", content: input.query },
      ],
    });
    return {
      response: completion.choices[0]?.message?.content || demoFallback(input, citation),
      provider: "openai",
    };
  } catch {
    return { response: demoFallback(input, citation), provider: "demo" };
  }
}

function demoFallback(
  input: { query: string; skill: SkillSchema },
  citation: string
): string {
  return [
    `Based on the approved skill **${input.skill.title}**:`,
    ``,
    `**Rule applied:** IF ${input.skill.condition} → THEN ${input.skill.action}`,
    ``,
    `For your question ("${input.query}"), apply this policy. Source: "${input.skill.source_excerpt}"`,
    ``,
    citation,
  ].join("\n");
}
