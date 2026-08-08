import { NextResponse } from "next/server";
import { z } from "zod";
import { requireOrgSession } from "@/lib/auth";
import { getAppSession } from "@/lib/session";
import { id, now, readDb, updateDb } from "@/lib/db";
import { isSupabaseConfigured } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";

const schema = z.object({
  question: z.string().min(3),
});

function localAnswer(question: string, orgId: string) {
  return readDb().then((db) => {
    const skills = db.skills.filter(
      (s) => s.organizationId === orgId && s.status === "approved"
    );
    const conversations = db.conversations.filter(
      (c) => c.organizationId === orgId
    );

    const q = question.toLowerCase();
    const scored = skills
      .map((s) => {
        const blob =
          `${s.title} ${s.jsonSchema.condition} ${s.jsonSchema.action} ${s.category}`.toLowerCase();
        const score = q
          .split(/\s+/)
          .filter((w) => w.length > 3 && blob.includes(w)).length;
        return { s, score };
      })
      .sort((a, b) => b.score - a.score);

    const top = scored[0]?.score ? scored[0].s : skills[0];
    const conv = top
      ? conversations.find((c) => c.id === top.conversationId)
      : null;

    if (!top) {
      return {
        answer:
          "I don’t have approved skills yet. Connect sources or extract & approve a skill, then ask again.",
        citations: [] as { skillId?: string; title: string; sourceRef?: string }[],
      };
    }

    const answer = [
      `Here’s what the company brain knows:`,
      ``,
      `**${top.title}**`,
      `IF ${top.jsonSchema.condition}`,
      `THEN ${top.jsonSchema.action}`,
      ``,
      `This came from ${conv?.sourceRef || "a connected workspace conversation"}.`,
      `I can also route this to the right owner — check the Inbox for suggested assignees.`,
    ].join("\n");

    return {
      answer,
      citations: [
        {
          skillId: top.id,
          title: top.title,
          sourceRef: conv?.sourceRef,
        },
      ],
    };
  });
}

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());

    // Prefer local org session (demo) or supabase membership
    let orgId: string | undefined;
    let userId: string | undefined;

    if (isSupabaseConfigured()) {
      const session = await getAppSession();
      if (!session?.organizationId) {
        // fall through to local
      } else {
        orgId = session.organizationId;
        userId = session.userId;
      }
    }

    if (!orgId) {
      const local = await requireOrgSession();
      orgId = local.organizationId;
      userId = local.userId;
    }

    let answer: string;
    let citations: { skillId?: string; title: string; sourceRef?: string }[];

    const apiKey = process.env.OPENAI_API_KEY?.trim();
    const db = await readDb();
    const skills = db.skills.filter(
      (s) => s.organizationId === orgId && s.status === "approved"
    );
    const context = skills
      .map(
        (s) =>
          `- ${s.title}: IF ${s.jsonSchema.condition} THEN ${s.jsonSchema.action} (source skill ${s.id})`
      )
      .join("\n");

    if (apiKey && skills.length) {
      try {
        const client = new OpenAI({ apiKey });
        const completion = await client.chat.completions.create({
          model: "gpt-4o-mini",
          temperature: 0.2,
          messages: [
            {
              role: "system",
              content: `You are Tactix, the company brain. Answer using ONLY approved skills below. Cite skill titles. If unknown, say what connector to check (Slack, Teams, Zoho, Sheets, Zoom).\n\nApproved skills:\n${context}`,
            },
            { role: "user", content: body.question },
          ],
        });
        answer =
          completion.choices[0]?.message?.content ||
          (await localAnswer(body.question, orgId)).answer;
        citations = skills.slice(0, 2).map((s) => ({
          skillId: s.id,
          title: s.title,
        }));
      } catch {
        const local = await localAnswer(body.question, orgId);
        answer = local.answer;
        citations = local.citations;
      }
    } else {
      const local = await localAnswer(body.question, orgId);
      answer = local.answer;
      citations = local.citations;
    }

    await updateDb((store) => {
      store.brainMessages.push(
        {
          id: id("brn"),
          organizationId: orgId!,
          userId,
          role: "user",
          content: body.question,
          citations: [],
          createdAt: now(),
        },
        {
          id: id("brn"),
          organizationId: orgId!,
          userId,
          role: "assistant",
          content: answer,
          citations,
          createdAt: now(),
        }
      );
    });

    if (isSupabaseConfigured() && orgId) {
      try {
        const supabase = await createClient();
        await supabase.from("brain_messages").insert([
          {
            organization_id: orgId,
            user_id: userId,
            role: "user",
            content: body.question,
            citations: [],
          },
          {
            organization_id: orgId,
            user_id: userId,
            role: "assistant",
            content: answer,
            citations,
          },
        ]);
      } catch {
        // local store already saved
      }
    }

    return NextResponse.json({ ok: true, answer, citations });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Brain failed";
    if (message === "UNAUTHORIZED" || message === "NO_ORG") {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function GET() {
  try {
    const local = await requireOrgSession();
    const db = await readDb();
    const messages = (db.brainMessages || [])
      .filter((m) => m.organizationId === local.organizationId)
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
      .slice(-40);
    return NextResponse.json({ messages });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
