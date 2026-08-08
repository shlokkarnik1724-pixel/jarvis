import { NextResponse } from "next/server";
import { DEMO_MODE } from "@/lib/config";
import {
  getDemoMembers,
  updateDemoNickname,
} from "@/lib/demo/store";
import { listMembers, updateNickname } from "@/lib/data/circle-queries";
import { getSessionContext, requireCircleId } from "@/lib/session";
import { fail, ok } from "@/lib/utils";

export async function GET() {
  try {
    const session = await getSessionContext();
    if (!session) {
      return NextResponse.json(fail("Unauthorized"), { status: 401 });
    }

    if (DEMO_MODE || session.demo) {
      return NextResponse.json(ok(getDemoMembers()));
    }

    return NextResponse.json(ok(await listMembers(requireCircleId(session))));
  } catch (error) {
    return NextResponse.json(
      fail(error instanceof Error ? error.message : "Failed to load members"),
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionContext();
    if (!session) {
      return NextResponse.json(fail("Unauthorized"), { status: 401 });
    }

    const body = (await request.json()) as {
      targetId?: string;
      nickname?: string;
    };

    if (!body.targetId || !body.nickname?.trim()) {
      return NextResponse.json(fail("targetId and nickname are required"), {
        status: 400,
      });
    }

    if (DEMO_MODE || session.demo) {
      const updated = updateDemoNickname(body.targetId, body.nickname.trim());
      if (!updated) {
        return NextResponse.json(fail("Member not found"), { status: 404 });
      }
      return NextResponse.json(ok(updated));
    }

    const updated = await updateNickname({
      circleId: requireCircleId(session),
      targetId: body.targetId,
      editorId: session.user.id,
      nickname: body.nickname.trim(),
    });
    return NextResponse.json(ok(updated));
  } catch (error) {
    return NextResponse.json(
      fail(error instanceof Error ? error.message : "Member update failed"),
      { status: 500 }
    );
  }
}
