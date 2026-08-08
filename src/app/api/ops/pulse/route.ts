import { NextResponse } from "next/server";
import { z } from "zod";
import { requireOrgSession } from "@/lib/auth";
import { id, now, readDb, updateDb } from "@/lib/db";
import {
  analyzeAndCorrectRequest,
  buildSourcePulses,
  type OpsSource,
} from "@/lib/ops-engine";

const LIVE_FEEDS: { source: OpsSource; channel: string; rawText: string }[] = [
  {
    source: "slack",
    channel: "#ops",
    rawText:
      "Ops: Warehouse says 12 orders missing SKU in today's Sheet export — blocking labels.",
  },
  {
    source: "freshdesk",
    channel: "Ticket #90501",
    rawText:
      "Customer angry about late delivery. Order mentioned but no TRK id in ticket body.",
  },
  {
    source: "google_sheets",
    channel: "Shipments Tracker · row 201",
    rawText:
      "Ship 8 units to Pune, adress line blank, pin code 41100, mark urgnt",
  },
  {
    source: "whatsapp",
    channel: "Customer Line",
    rawText: "where is my package ORD-7781? still waiting",
  },
  {
    source: "looker",
    channel: "Ops Dashboard",
    rawText:
      "Alert: on-time delivery KPI dropped 9pts week-over-week — red on regional board.",
  },
];

export async function GET() {
  try {
    const session = await requireOrgSession();
    const db = await readDb();
    const requests = (db.opsRequests || [])
      .filter((r) => r.organizationId === session.organizationId)
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

    const ts = now();
    const sources = buildSourcePulses(ts);
    const open = requests.filter(
      (r) => !["resolved", "rejected", "shipped"].includes(r.status)
    );
    const correctionsToday = requests.filter(
      (r) => r.corrections.length > 0
    ).length;
    const shipmentsInFlight = requests.filter(
      (r) =>
        r.shipment &&
        ["intake", "validated", "routed", "in_progress"].includes(
          r.shipment.stage
        )
    ).length;

    const stream = [
      ...requests.slice(0, 8).map((r) => ({
        id: r.id,
        source: r.source,
        message: `${r.detectedIntent} · ${r.status.replaceAll("_", " ")}`,
        at: r.updatedAt,
        tone:
          r.status === "needs_correction"
            ? ("warn" as const)
            : r.priority === "urgent"
              ? ("action" as const)
              : ("info" as const),
      })),
      {
        id: "sys",
        source: "looker" as OpsSource,
        message: "Neural sync across Sheets ↔ Freshdesk ↔ WhatsApp",
        at: ts,
        tone: "ok" as const,
      },
    ];

    return NextResponse.json({
      organizationId: session.organizationId,
      generatedAt: ts,
      neuralLoad: Math.min(
        98,
        35 + open.length * 8 + correctionsToday * 3
      ),
      sourcesOnline: sources.filter((s) => s.status !== "offline").length,
      openRequests: open.length,
      correctionsToday,
      shipmentsInFlight,
      sources,
      stream,
      requests,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

const pulseSchema = z.object({
  action: z.enum(["tick", "ingest"]).default("tick"),
  source: z
    .enum([
      "slack",
      "google_sheets",
      "freshdesk",
      "looker",
      "whatsapp",
      "email",
      "zoom",
    ])
    .optional(),
  channel: z.string().optional(),
  rawText: z.string().optional(),
});

/** Simulate a live pull from business systems + AI detect/correct. */
export async function POST(req: Request) {
  try {
    const session = await requireOrgSession();
    const body = pulseSchema.parse(await req.json().catch(() => ({})));

    const created = await updateDb((db) => {
      const skills = db.skills.filter(
        (s) => s.organizationId === session.organizationId
      );

      const feed =
        body.rawText && body.source
          ? {
              source: body.source,
              channel: body.channel || body.source,
              rawText: body.rawText,
            }
          : LIVE_FEEDS[Math.floor(Math.random() * LIVE_FEEDS.length)];

      const analyzed = analyzeAndCorrectRequest({
        ...feed,
        skills,
      });
      const ts = now();
      const request = {
        id: id("ops"),
        organizationId: session.organizationId!,
        ...analyzed,
        createdAt: ts,
        updatedAt: ts,
      };
      db.opsRequests.push(request);
      db.activities.push({
        id: id("act"),
        organizationId: session.organizationId!,
        message: `Brain pulled ${feed.source} → ${analyzed.detectedIntent}`,
        createdAt: ts,
      });
      db.ingestionEvents.push({
        id: id("ing"),
        organizationId: session.organizationId!,
        source: feed.source,
        channel: feed.channel,
        summary: analyzed.detectedIntent,
        rawSnippet: feed.rawText.slice(0, 180),
        decisionDetected: true,
        skillId: analyzed.skillId || null,
        createdAt: ts,
      });
      return request;
    });

    return NextResponse.json({ ok: true, request: created });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Pulse failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
