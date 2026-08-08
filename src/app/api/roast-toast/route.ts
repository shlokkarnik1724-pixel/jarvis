import { NextResponse } from "next/server";
import { DEMO_MODE } from "@/lib/config";
import {
  addDemoRoast,
  getDemoRoasts,
  voteDemoRoast,
} from "@/lib/demo/store";
import { addRoast, listRoasts, voteRoast } from "@/lib/data/circle-queries";
import { getSessionContext, requireCircleId } from "@/lib/session";
import { fail, ok } from "@/lib/utils";

export async function GET() {
  try {
    const session = await getSessionContext();
    if (!session) {
      return NextResponse.json(fail("Unauthorized"), { status: 401 });
    }

    if (DEMO_MODE || session.demo) {
      return NextResponse.json(ok(getDemoRoasts()));
    }

    return NextResponse.json(
      ok(await listRoasts(requireCircleId(session), session.user.id))
    );
  } catch (error) {
    return NextResponse.json(
      fail(error instanceof Error ? error.message : "Failed to load roast/toast"),
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
      kind?: "roast" | "toast";
      body?: string;
      id?: string;
      vote?: number;
    };

    if (DEMO_MODE || session.demo) {
      if (body.id && typeof body.vote === "number") {
        const vote = body.vote === -1 ? -1 : 1;
        const updated = voteDemoRoast(body.id, vote);
        if (!updated) {
          return NextResponse.json(fail("Entry not found"), { status: 404 });
        }
        return NextResponse.json(ok(updated));
      }

      if ((body.kind === "roast" || body.kind === "toast") && body.body?.trim()) {
        const entry = addDemoRoast({
          kind: body.kind,
          body: body.body.trim(),
        });
        return NextResponse.json(ok(entry));
      }

      return NextResponse.json(fail("Invalid roast/toast payload"), {
        status: 400,
      });
    }

    if (body.id && typeof body.vote === "number") {
      const updated = await voteRoast(
        body.id,
        session.user.id,
        body.vote === -1 ? -1 : 1
      );
      return NextResponse.json(ok(updated));
    }

    if ((body.kind === "roast" || body.kind === "toast") && body.body?.trim()) {
      const entry = await addRoast({
        circleId: requireCircleId(session),
        kind: body.kind,
        body: body.body.trim(),
      });
      return NextResponse.json(ok(entry));
    }

    return NextResponse.json(fail("Invalid roast/toast payload"), {
      status: 400,
    });
  } catch (error) {
    return NextResponse.json(
      fail(error instanceof Error ? error.message : "Roast/toast failed"),
      { status: 500 }
    );
  }
}
