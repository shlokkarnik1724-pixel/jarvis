import { NextResponse } from "next/server";
import { z } from "zod";
import { requireOrgSession } from "@/lib/auth";
import { id, now, readDb, updateDb } from "@/lib/db";
import { simulateAgentResponse } from "@/lib/extract";
import { formatDate } from "@/lib/utils";

const schema = z.object({
  query: z.string().min(3),
  skillId: z.string().optional(), // omit or "all" = all approved
});

export async function POST(req: Request) {
  try {
    const session = await requireOrgSession();
    const body = schema.parse(await req.json());
    const db = await readDb();

    const approved = db.skills.filter(
      (s) =>
        s.organizationId === session.organizationId && s.status === "approved"
    );

    if (approved.length === 0) {
      return NextResponse.json(
        { error: "Approve at least one skill before simulating" },
        { status: 400 }
      );
    }

    let skill =
      body.skillId && body.skillId !== "all"
        ? approved.find((s) => s.id === body.skillId)
        : approved[0];

    if (body.skillId === "all") {
      // Pick the best-matching skill by simple keyword overlap
      const q = body.query.toLowerCase();
      skill =
        approved
          .map((s) => {
            const blob = `${s.title} ${s.jsonSchema.condition} ${s.jsonSchema.action} ${s.category}`.toLowerCase();
            const score = q
              .split(/\s+/)
              .filter((w) => w.length > 3 && blob.includes(w)).length;
            return { s, score };
          })
          .sort((a, b) => b.score - a.score)[0]?.s || approved[0];
    }

    if (!skill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    const conversation = db.conversations.find(
      (c) => c.id === skill.conversationId
    );

    const { response, provider } = await simulateAgentResponse({
      query: body.query,
      skill: skill.jsonSchema,
      skillId: skill.id,
      approvedAt: formatDate(skill.updatedAt),
      sourceRef: conversation?.sourceRef || "source conversation",
    });

    await updateDb((store) => {
      store.agentTestRuns.push({
        id: id("run"),
        skillId: skill.id,
        organizationId: session.organizationId,
        userQuery: body.query,
        agentResponse: response,
        createdAt: now(),
      });
    });

    return NextResponse.json({
      ok: true,
      response,
      provider,
      skill: {
        id: skill.id,
        title: skill.title,
        sourceRef: conversation?.sourceRef,
        approvedAt: skill.updatedAt,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Simulation failed";
    if (message === "UNAUTHORIZED" || message === "NO_ORG") {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
