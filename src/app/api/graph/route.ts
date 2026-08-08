import { NextResponse } from "next/server";
import { requireOrgSession } from "@/lib/auth";
import { readDb } from "@/lib/db";
import { buildKnowledgeGraph } from "@/lib/graph";
import { AGENT_SYSTEM_MANIFEST } from "@/lib/manifest";

export async function GET() {
  try {
    const session = await requireOrgSession();
    const db = await readDb();
    const skills = db.skills.filter(
      (s) => s.organizationId === session.organizationId
    );
    const graph = buildKnowledgeGraph(skills);

    return NextResponse.json({
      ...graph,
      retrieval: {
        hybrid: ["vector_embeddings", "keyword_bm25", "graph_traversal"],
        conflict_resolution: "auto_invalidate_superseded_nodes",
      },
      manifest: AGENT_SYSTEM_MANIFEST,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
