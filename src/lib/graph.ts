import type { Skill } from "./types";

export type GraphNode = {
  id: string;
  label: string;
  status: string;
  category: string;
  validFrom: string;
  validTo: string | null;
  active: boolean;
};

export type GraphEdge = {
  from: string;
  to: string;
  relation: "supersedes" | "same_category" | "conflict";
};

/** Build a simple bi-temporal knowledge graph view of skills */
export function buildKnowledgeGraph(skills: Skill[]): {
  nodes: GraphNode[];
  edges: GraphEdge[];
  activeCount: number;
  supersededCount: number;
} {
  const now = Date.now();
  const nodes: GraphNode[] = skills.map((s) => {
    const validToMs = s.validTo ? new Date(s.validTo).getTime() : null;
    const active =
      s.status === "approved" &&
      (!validToMs || validToMs > now) &&
      !s.supersededBy;
    return {
      id: s.id,
      label: s.title,
      status: s.status,
      category: s.category,
      validFrom: s.validFrom || s.createdAt,
      validTo: s.validTo,
      active,
    };
  });

  const edges: GraphEdge[] = [];
  for (const s of skills) {
    if (s.supersededBy) {
      edges.push({
        from: s.supersededBy,
        to: s.id,
        relation: "supersedes",
      });
    }
  }

  // Same-category links for approved active nodes (memory traversal hint)
  const byCat = new Map<string, Skill[]>();
  for (const s of skills.filter((x) => x.status === "approved")) {
    if (!byCat.has(s.category)) byCat.set(s.category, []);
    byCat.get(s.category)!.push(s);
  }
  for (const list of byCat.values()) {
    for (let i = 0; i < list.length - 1; i++) {
      edges.push({
        from: list[i].id,
        to: list[i + 1].id,
        relation: "same_category",
      });
    }
  }

  return {
    nodes,
    edges,
    activeCount: nodes.filter((n) => n.active).length,
    supersededCount: nodes.filter(
      (n) => n.status === "superseded" || Boolean(n.validTo)
    ).length,
  };
}

/**
 * When approving a skill, auto-invalidate overlapping approved skills
 * in the same category with conflicting actions (bi-temporal supersession).
 */
export function applySupersession(
  skills: Skill[],
  approved: Skill,
  atIso: string
): { invalidated: Skill[] } {
  const invalidated: Skill[] = [];
  for (const s of skills) {
    if (s.id === approved.id) continue;
    if (s.organizationId !== approved.organizationId) continue;
    if (s.status !== "approved") continue;
    if (s.category !== approved.category) continue;
    if (s.validTo) continue;

    const a = s.jsonSchema.condition.toLowerCase();
    const b = approved.jsonSchema.condition.toLowerCase();
    const overlap = a
      .split(/\s+/)
      .filter((w) => w.length > 4 && b.includes(w)).length;
    const conflict =
      overlap >= 2 && s.jsonSchema.action !== approved.jsonSchema.action;

    if (conflict) {
      s.status = "superseded";
      s.validTo = atIso;
      s.supersededBy = approved.id;
      s.updatedAt = atIso;
      invalidated.push(s);
    }
  }
  return { invalidated };
}

export function isSkillActive(skill: Skill, at = Date.now()): boolean {
  if (skill.status !== "approved") return false;
  if (skill.supersededBy) return false;
  if (skill.validTo && new Date(skill.validTo).getTime() <= at) return false;
  const from = new Date(skill.validFrom || skill.createdAt).getTime();
  return from <= at;
}
