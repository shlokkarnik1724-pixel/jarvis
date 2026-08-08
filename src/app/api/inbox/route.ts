import { NextResponse } from "next/server";
import { z } from "zod";
import { requireOrgSession } from "@/lib/auth";
import { now, readDb, updateDb } from "@/lib/db";

export async function GET() {
  try {
    const session = await requireOrgSession();
    const db = await readDb();
    const items = (db.routingItems || [])
      .filter((r) => r.organizationId === session.organizationId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    return NextResponse.json({ items });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

const schema = z.object({
  id: z.string(),
  status: z.enum(["open", "routed", "done"]),
});

export async function PATCH(req: Request) {
  try {
    const session = await requireOrgSession();
    const body = schema.parse(await req.json());
    const item = await updateDb((db) => {
      const found = (db.routingItems || []).find(
        (r) => r.id === body.id && r.organizationId === session.organizationId
      );
      if (!found) throw new Error("NOT_FOUND");
      found.status = body.status;
      return found;
    });
    return NextResponse.json({ ok: true, item, updatedAt: now() });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
