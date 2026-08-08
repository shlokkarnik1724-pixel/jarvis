import type { Skill } from "./types";
import { sopMarkdown } from "./sop";
import { isSkillActive } from "./graph";

/** OmniAgent_OS master system specification */
export const AGENT_SYSTEM_MANIFEST = {
  agent_system_manifest: {
    name: "OmniAgent_OS",
    product: "Tactix AI",
    ingestion_sources: [
      "slack",
      "zendesk",
      "gmail",
      "gong",
      "microsoft_teams",
      "zoho",
      "google_sheets",
      "zoom",
      "action_logs",
    ],
    memory_architecture: {
      type: "temporal_knowledge_graph",
      hybrid_retrieval: [
        "vector_embeddings",
        "keyword_bm25",
        "graph_traversal",
      ],
      conflict_resolution: "auto_invalidate_superseded_nodes",
      bi_temporal_fields: ["valid_from", "valid_to", "superseded_by"],
    },
    decision_engine: {
      policy_enforcement: "strict_json_schema",
      provenance_tracking: true,
      human_in_the_loop_required: true,
      bi_directional_verification: true,
    },
    output_targets: ["langchain", "crewai", "autogen", "direct_webhook"],
    layers: {
      ingestion: "Multi-Channel Passive Mining",
      extraction: "SOP & Skill Schema Builder",
      memory: "Bi-Temporal Context Graph",
      execution: "Autonomous Agent & Sandbox",
      governance: "Source-Linked Provenance",
    },
  },
} as const;

export function exportForFramework(
  skill: Skill,
  framework: "langchain" | "crewai" | "autogen" | "webhook" | "json" | "yaml"
): { filename: string; content: string; mime: string } {
  const schema = skill.jsonSchema;
  const active = isSkillActive(skill);

  if (framework === "json") {
    return {
      filename: `${skill.id}.skill.json`,
      content: JSON.stringify(
        {
          ...schema,
          id: skill.id,
          status: skill.status,
          valid_from: skill.validFrom,
          valid_to: skill.validTo,
          superseded_by: skill.supersededBy,
          active,
        },
        null,
        2
      ),
      mime: "application/json",
    };
  }

  if (framework === "yaml") {
    const yaml = [
      `id: ${skill.id}`,
      `title: ${JSON.stringify(schema.title)}`,
      `status: ${skill.status}`,
      `active: ${active}`,
      `valid_from: ${skill.validFrom}`,
      `valid_to: ${skill.validTo ?? "null"}`,
      `condition: ${JSON.stringify(schema.condition)}`,
      `action: ${JSON.stringify(schema.action)}`,
      `category: ${schema.category}`,
      `confidence: ${schema.confidence}`,
      `source_excerpt: ${JSON.stringify(schema.source_excerpt)}`,
    ].join("\n");
    return {
      filename: `${skill.id}.skill.yaml`,
      content: yaml,
      mime: "text/yaml",
    };
  }

  if (framework === "langchain") {
    const content = {
      name: schema.title,
      description: `Tactix skill ${skill.id} · ${schema.category}`,
      schema: {
        condition: schema.condition,
        action: schema.action,
        valid_from: skill.validFrom,
        valid_to: skill.validTo,
      },
      prompt: `You must follow this approved company skill.\nIF ${schema.condition}\nTHEN ${schema.action}\nProvenance: ${schema.source_excerpt}`,
      metadata: {
        tactix_skill_id: skill.id,
        active,
        framework: "langchain",
      },
    };
    return {
      filename: `${skill.id}.langchain.json`,
      content: JSON.stringify(content, null, 2),
      mime: "application/json",
    };
  }

  if (framework === "crewai") {
    const content = {
      role: "Company Policy Agent",
      goal: schema.action,
      backstory: `Approved Tactix skill "${schema.title}". Only apply when: ${schema.condition}`,
      tools: [],
      tactix: {
        skill_id: skill.id,
        valid_from: skill.validFrom,
        valid_to: skill.validTo,
        sop: sopMarkdown(schema),
      },
    };
    return {
      filename: `${skill.id}.crewai.json`,
      content: JSON.stringify(content, null, 2),
      mime: "application/json",
    };
  }

  if (framework === "autogen") {
    const content = {
      name: "tactix_policy_agent",
      system_message: [
        `You are bound to Tactix skill ${skill.id}.`,
        `IF ${schema.condition}`,
        `THEN ${schema.action}`,
        `Bi-temporal validity: from ${skill.validFrom} to ${skill.validTo || "present"}.`,
        `Source: ${schema.source_excerpt}`,
      ].join("\n"),
      llm_config: { config_list: [{ model: "gpt-4o-mini" }] },
    };
    return {
      filename: `${skill.id}.autogen.json`,
      content: JSON.stringify(content, null, 2),
      mime: "application/json",
    };
  }

  // webhook
  const content = {
    event: "tactix.skill.export",
    skill_id: skill.id,
    payload: schema,
    validity: {
      valid_from: skill.validFrom,
      valid_to: skill.validTo,
      active,
    },
    webhook_example: {
      method: "POST",
      url: "https://your-agent.example/hooks/tactix",
      headers: { "Content-Type": "application/json" },
    },
  };
  return {
    filename: `${skill.id}.webhook.json`,
    content: JSON.stringify(content, null, 2),
    mime: "application/json",
  };
}
