import { NextResponse } from "next/server";
import { z } from "zod";
import { requireOrgSession } from "@/lib/auth";
import { id, now, readDb, updateDb } from "@/lib/db";
import { CONNECTOR_CATALOG } from "@/lib/config";

export async function GET() {
  try {
    const session = await requireOrgSession();
    const db = await readDb();
    let connectors = (db.connectors || []).filter(
      (c) => c.organizationId === session.organizationId
    );

    // Ensure catalog exists for org
    if (connectors.length < CONNECTOR_CATALOG.length) {
      connectors = await updateDb((store) => {
        const existing = new Set(
          (store.connectors || [])
            .filter((c) => c.organizationId === session.organizationId)
            .map((c) => c.provider)
        );
        for (const item of CONNECTOR_CATALOG) {
          if (!existing.has(item.provider)) {
            store.connectors.push({
              id: id("conn"),
              organizationId: session.organizationId,
              provider: item.provider,
              name: item.name,
              status:
                item.provider === "manual" ? "connected" : "disconnected",
              meta: { blurb: item.blurb, category: item.category },
              createdAt: now(),
            });
          }
        }
        return store.connectors.filter(
          (c) => c.organizationId === session.organizationId
        );
      });
    }

    return NextResponse.json({
      connectors,
      catalog: CONNECTOR_CATALOG,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

const patchSchema = z.object({
  connectorId: z.string(),
  action: z.enum(["connect", "disconnect", "sync"]),
});

export async function POST(req: Request) {
  try {
    const session = await requireOrgSession();
    const body = patchSchema.parse(await req.json());

    const connector = await updateDb((db) => {
      const c = (db.connectors || []).find(
        (x) =>
          x.id === body.connectorId &&
          x.organizationId === session.organizationId
      );
      if (!c) throw new Error("NOT_FOUND");

      if (body.action === "connect") {
        c.status = "connected";
        c.lastSyncedAt = now();
        db.activities.push({
          id: id("act"),
          organizationId: session.organizationId,
          message: `Connected ${c.name} to the company brain`,
          createdAt: now(),
        });
      } else if (body.action === "disconnect") {
        c.status = "disconnected";
        db.activities.push({
          id: id("act"),
          organizationId: session.organizationId,
          message: `Disconnected ${c.name}`,
          createdAt: now(),
        });
      } else if (body.action === "sync") {
        c.status = "connected";
        c.lastSyncedAt = now();
        db.activities.push({
          id: id("act"),
          organizationId: session.organizationId,
          message: `Synced ${c.name} — scanning for decisions`,
          createdAt: now(),
        });
      }
      return c;
    });

    return NextResponse.json({ ok: true, connector });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
