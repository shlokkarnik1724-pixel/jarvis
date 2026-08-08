import { NextResponse } from "next/server";
import { z } from "zod";
import { requireOrgSession } from "@/lib/auth";
import { id, now, updateDb } from "@/lib/db";

const schema = z.object({
  requestId: z.string(),
  action: z.enum([
    "apply_corrections",
    "approve",
    "execute",
    "ship",
    "resolve",
    "reject",
  ]),
});

export async function POST(req: Request) {
  try {
    const session = await requireOrgSession();
    const body = schema.parse(await req.json());

    const result = await updateDb((db) => {
      const item = (db.opsRequests || []).find(
        (r) =>
          r.id === body.requestId &&
          r.organizationId === session.organizationId
      );
      if (!item) throw new Error("NOT_FOUND");
      const ts = now();

      if (body.action === "apply_corrections") {
        item.status = "corrected";
        if (item.shipment && item.shipment.stage === "intake") {
          item.shipment.stage = "validated";
          item.shipment.trackingNote = "Corrections applied by company brain";
        }
      } else if (body.action === "approve") {
        item.status = "approved";
      } else if (body.action === "execute") {
        item.status = "executing";
        if (item.shipment) {
          item.shipment.stage = "in_progress";
          item.shipment.trackingNote = "Executing via connected systems";
        }
        // Mirror into routing inbox
        db.routingItems.push({
          id: id("rte"),
          organizationId: session.organizationId!,
          title: item.title,
          summary: item.suggestedAction,
          suggestedOwner: item.shipment?.owner || "Ops",
          channel: item.source,
          priority: item.priority,
          status: "routed",
          sourceRef: item.channel,
          createdAt: ts,
        });
      } else if (body.action === "ship") {
        item.status = "shipped";
        if (item.shipment) {
          item.shipment.stage = "fulfilled";
          item.shipment.trackingNote = "Marked fulfilled by brain";
        }
      } else if (body.action === "resolve") {
        item.status = "resolved";
      } else if (body.action === "reject") {
        item.status = "rejected";
        if (item.shipment) item.shipment.stage = "blocked";
      }

      item.updatedAt = ts;
      db.activities.push({
        id: id("act"),
        organizationId: session.organizationId!,
        message: `Ops ${body.action.replaceAll("_", " ")} · ${item.title}`,
        createdAt: ts,
      });
      return item;
    });

    return NextResponse.json({ ok: true, request: result });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Action failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
