import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createSessionToken,
  hashPassword,
  setSessionCookie,
} from "@/lib/auth";
import { id, now, updateDb } from "@/lib/db";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const email = body.email.toLowerCase().trim();
    const passwordHash = await hashPassword(body.password);

    const user = await updateDb((db) => {
      if (db.users.some((u) => u.email === email)) {
        throw new Error("EMAIL_TAKEN");
      }
      const created = {
        id: id("usr"),
        email,
        name: body.name.trim(),
        passwordHash,
        createdAt: now(),
      };
      db.users.push(created);
      return created;
    });

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });
    await setSessionCookie(token);

    return NextResponse.json({
      ok: true,
      user: { id: user.id, email: user.email, name: user.name },
      needsOnboarding: true,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Signup failed";
    if (message === "EMAIL_TAKEN") {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
