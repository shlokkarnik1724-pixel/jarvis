import { NextResponse } from "next/server";
import { z } from "zod";
import { requireOrgSession } from "@/lib/auth";
import { updateDb } from "@/lib/db";

const schema = z.object({
  name: z.string().min(1).optional(),
  industry: z.string().min(1).optional(),
});

export async function PATCH(req: Request) {
  try {
    const session = await requireOrgSession();
    if (session.role !== "admin") {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }
    const body = schema.parse(await req.json());

    const org = await updateDb((db) => {
      const organization = db.organizations.find(
        (o) => o.id === session.organizationId
      );
      if (!organization) throw new Error("NOT_FOUND");
      if (body.name) organization.name = body.name.trim();
      if (body.industry) organization.industry = body.industry;
      return organization;
    });

    return NextResponse.json({ ok: true, organization: org });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
