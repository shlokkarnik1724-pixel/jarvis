import { NextResponse } from "next/server";
import { DEMO_MODE } from "@/lib/config";
import { getDemoMembers, updateDemoNickname } from "@/lib/demo/store";
import { getSessionContext } from "@/lib/session";
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

    return NextResponse.json(ok([]));
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

    return NextResponse.json(fail("Supabase member update not yet wired"), {
      status: 501,
    });
  } catch (error) {
    return NextResponse.json(
      fail(error instanceof Error ? error.message : "Member update failed"),
      { status: 500 }
    );
  }
}
