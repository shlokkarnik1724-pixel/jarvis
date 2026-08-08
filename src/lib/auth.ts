import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { readDb } from "./db";
import type { SessionPayload } from "./types";

const COOKIE_NAME = "tactix_session";

function getSecret() {
  const secret = process.env.AUTH_SECRET || "tactix-dev-secret-change-me";
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(
  payload: SessionPayload
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export function sessionCookieOptions(token: string, secure?: boolean) {
  return {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax" as const,
    // Public tunnels (Cloudflare) are HTTPS even in next dev
    secure:
      typeof secure === "boolean"
        ? secure
        : process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}

export async function setSessionCookie(
  token: string,
  opts?: { secure?: boolean }
): Promise<void> {
  const cookieStore = await cookies();
  const options = sessionCookieOptions(token, opts?.secure);
  cookieStore.set(options.name, options.value, {
    httpOnly: options.httpOnly,
    sameSite: options.sameSite,
    secure: options.secure,
    path: options.path,
    maxAge: options.maxAge,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export async function requireOrgSession(): Promise<
  SessionPayload & { organizationId: string; role: NonNullable<SessionPayload["role"]> }
> {
  const session = await requireSession();
  if (!session.organizationId || !session.role) {
    throw new Error("NO_ORG");
  }
  return session as SessionPayload & {
    organizationId: string;
    role: NonNullable<SessionPayload["role"]>;
  };
}

export async function refreshSessionForUser(
  userId: string
): Promise<SessionPayload | null> {
  const db = await readDb();
  const user = db.users.find((u) => u.id === userId);
  if (!user) return null;

  const membership = db.memberships.find((m) => m.userId === userId);
  const payload: SessionPayload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    organizationId: membership?.organizationId,
    role: membership?.role,
  };
  const token = await createSessionToken(payload);
  await setSessionCookie(token);
  return payload;
}
