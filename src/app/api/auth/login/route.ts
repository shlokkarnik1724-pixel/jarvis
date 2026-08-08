import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createSessionToken,
  setSessionCookie,
  verifyPassword,
} from "@/lib/auth";
import { readDb } from "@/lib/db";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const email = body.email.toLowerCase().trim();
    const db = await readDb();
    const user = db.users.find((u) => u.email === email);

    if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const membership = db.memberships.find((m) => m.userId === user.id);
    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      organizationId: membership?.organizationId,
      role: membership?.role,
    });
    await setSessionCookie(token);

    return NextResponse.json({
      ok: true,
      needsOnboarding: !membership,
      organizationId: membership?.organizationId ?? null,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Login failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
