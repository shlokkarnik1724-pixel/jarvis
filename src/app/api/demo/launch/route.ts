import { NextResponse } from "next/server";
import {
  createSessionToken,
  hashPassword,
  setSessionCookie,
} from "@/lib/auth";
import { updateDb } from "@/lib/db";
import {
  DEMO_EMAIL,
  DEMO_PASSWORD,
  buildDemoSeed,
  ensureDemoUserShape,
} from "@/lib/seed";

/** One-click investor demo — resets/ensures a seeded Acme workspace. */
export async function POST() {
  try {
    const passwordHash = await hashPassword(DEMO_PASSWORD);

    const result = await updateDb((db) => {
      let user = db.users.find((u) => u.email === DEMO_EMAIL);
      if (!user) {
        user = ensureDemoUserShape(undefined, passwordHash);
        db.users.push(user);
      } else {
        user.passwordHash = passwordHash;
        user.name = "Investor Demo";
      }

      // Remove prior demo memberships/orgs owned by this user so demo is fresh
      const oldMemberships = db.memberships.filter((m) => m.userId === user!.id);
      const oldOrgIds = new Set(oldMemberships.map((m) => m.organizationId));

      db.memberships = db.memberships.filter((m) => m.userId !== user!.id);
      db.organizations = db.organizations.filter((o) => !oldOrgIds.has(o.id));
      db.dataSources = db.dataSources.filter((d) => !oldOrgIds.has(d.organizationId));
      db.conversations = db.conversations.filter(
        (c) => !oldOrgIds.has(c.organizationId)
      );
      db.skills = db.skills.filter((s) => !oldOrgIds.has(s.organizationId));
      db.skillVersions = db.skillVersions.filter((v) =>
        db.skills.some((s) => s.id === v.skillId)
      );
      db.activities = db.activities.filter((a) => !oldOrgIds.has(a.organizationId));
      db.agentTestRuns = db.agentTestRuns.filter(
        (r) => !oldOrgIds.has(r.organizationId)
      );

      const seed = buildDemoSeed(user.id);
      db.organizations.push(seed.org);
      db.memberships.push(seed.membership);
      db.dataSources.push(...seed.dataSources);
      db.conversations.push(...seed.conversations);
      db.skills.push(...seed.skills);
      db.skillVersions.push(...seed.skillVersions);
      db.activities.push(...seed.activities);

      return { user, org: seed.org };
    });

    const token = await createSessionToken({
      userId: result.user.id,
      email: result.user.email,
      name: result.user.name,
      organizationId: result.org.id,
      role: "admin",
    });
    await setSessionCookie(token);

    return NextResponse.json({
      ok: true,
      organization: { id: result.org.id, name: result.org.name },
      credentials: { email: DEMO_EMAIL, password: DEMO_PASSWORD },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Demo launch failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
