import { NextResponse } from "next/server";
import { requireOrgSession } from "@/lib/auth";
import { id, now, readDb, updateDb } from "@/lib/db";

const PASSIVE_SNIPPETS = [
  {
    source: "slack",
    channel: "#support-escalations",
    summary: "Passive listener detected refund exception language",
    rawSnippet:
      "Marcus: For Enterprise + P1 outage we can refund outside the 30-day window.",
    decisionDetected: true,
  },
  {
    source: "zendesk",
    channel: "Ticket #9912",
    summary: "Ticket macro drift — agent asked for manager override",
    rawSnippet:
      "Customer requests goodwill credit after shipping delay. Agent: checking policy…",
    decisionDetected: false,
  },
  {
    source: "gmail",
    channel: "cs-leads@",
    summary: "Email thread contains VIP handling guidance",
    rawSnippet:
      "Please escalate any VIP blockers to on-call within 15 minutes.",
    decisionDetected: true,
  },
  {
    source: "gong",
    channel: "Call · Acme renewal",
    summary: "Gong call: discount ceiling restated by manager",
    rawSnippet: "We cap Enterprise at 15% without manager approval.",
    decisionDetected: true,
  },
  {
    source: "microsoft_teams",
    channel: "VIP Support",
    summary: "Teams message matched escalation skill pattern",
    rawSnippet: "NovaCorp checkout is down — escalating now.",
    decisionDetected: true,
  },
];

export async function GET() {
  try {
    const session = await requireOrgSession();
    const db = await readDb();
    const events = (db.ingestionEvents || [])
      .filter((e) => e.organizationId === session.organizationId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 40);

    const listeners = [
      { source: "slack", status: "listening" },
      { source: "zendesk", status: "listening" },
      { source: "gmail", status: "listening" },
      { source: "gong", status: "listening" },
      { source: "action_logs", status: "armed" },
    ];

    return NextResponse.json({
      listeners,
      events,
      zeroTouch: true,
      description:
        "Background listeners monitor Slack, Email, Zendesk, and Gong — extracting raw decisions without manual documentation.",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

/** Simulate a passive ingestion tick (demoable zero-touch mining) */
export async function POST() {
  try {
    const session = await requireOrgSession();
    const pick =
      PASSIVE_SNIPPETS[Math.floor(Math.random() * PASSIVE_SNIPPETS.length)];

    const event = await updateDb((db) => {
      const ev = {
        id: id("ing"),
        organizationId: session.organizationId,
        source: pick.source,
        channel: pick.channel,
        summary: pick.summary,
        rawSnippet: pick.rawSnippet,
        decisionDetected: pick.decisionDetected,
        skillId: null as string | null,
        createdAt: now(),
      };
      db.ingestionEvents = db.ingestionEvents || [];
      db.ingestionEvents.push(ev);
      db.activities.push({
        id: id("act"),
        organizationId: session.organizationId,
        message: `Passive ingest · ${pick.source}: ${pick.summary}`,
        createdAt: now(),
      });
      return ev;
    });

    return NextResponse.json({ ok: true, event });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
