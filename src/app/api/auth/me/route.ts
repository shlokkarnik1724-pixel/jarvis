import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { readDb } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const db = await readDb();
  const org = session.organizationId
    ? db.organizations.find((o) => o.id === session.organizationId)
    : null;

  return NextResponse.json({
    user: {
      id: session.userId,
      email: session.email,
      name: session.name,
      organizationId: session.organizationId ?? null,
      role: session.role ?? null,
      organization: org
        ? {
            id: org.id,
            name: org.name,
            industry: org.industry,
            inviteCode: org.inviteCode,
            primaryUseCase: org.primaryUseCase,
            teamSize: org.teamSize,
          }
        : null,
    },
  });
}
