import { NextResponse } from "next/server";
import { DEMO_MODE } from "@/lib/config";
import { createEvent } from "@/lib/data/circle-queries";
import { getSessionContext, requireCircleId } from "@/lib/session";
import { fail, ok } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const session = await getSessionContext();
    if (!session) {
      return NextResponse.json(fail("Unauthorized"), { status: 401 });
    }
    if (DEMO_MODE || session.demo) {
      return NextResponse.json(
        fail("Create events after signing into a real circle"),
        { status: 400 }
      );
    }

    const body = (await request.json()) as {
      title?: string;
      date?: string;
      location?: string;
      tags?: string[];
    };

    if (!body.title?.trim() || !body.date) {
      return NextResponse.json(fail("title and date are required"), {
        status: 400,
      });
    }

    const created = await createEvent({
      circleId: requireCircleId(session),
      title: body.title,
      date: body.date,
      location: body.location,
      tags: body.tags,
    });

    return NextResponse.json(ok(created));
  } catch (error) {
    return NextResponse.json(
      fail(error instanceof Error ? error.message : "Failed to create event"),
      { status: 500 }
    );
  }
}
