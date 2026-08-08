import { NextResponse } from "next/server";
import { createCircleForUser, joinCircleByInvite } from "@/lib/data/circle-queries";
import { getSessionContext } from "@/lib/session";
import { fail, ok } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const session = await getSessionContext();
    if (!session || session.demo) {
      return NextResponse.json(
        fail("Sign in with a real account to create or join a circle"),
        { status: 401 }
      );
    }

    const body = (await request.json()) as {
      action?: "create" | "join";
      name?: string;
      inviteCode?: string;
    };

    if (body.action === "create") {
      if (!body.name?.trim()) {
        return NextResponse.json(fail("Circle name is required"), { status: 400 });
      }
      const circle = await createCircleForUser({
        userId: session.user.id,
        name: body.name,
        ownerName: session.user.name,
        ownerEmail: session.user.email,
        avatarUrl: session.user.avatarUrl,
      });
      return NextResponse.json(ok(circle));
    }

    if (body.action === "join") {
      if (!body.inviteCode?.trim()) {
        return NextResponse.json(fail("Invite code is required"), { status: 400 });
      }
      const circle = await joinCircleByInvite({
        userId: session.user.id,
        inviteCode: body.inviteCode,
        name: session.user.name,
        email: session.user.email,
        avatarUrl: session.user.avatarUrl,
      });
      return NextResponse.json(ok(circle));
    }

    return NextResponse.json(fail("Invalid action"), { status: 400 });
  } catch (error) {
    return NextResponse.json(
      fail(error instanceof Error ? error.message : "Circle action failed"),
      { status: 500 }
    );
  }
}
