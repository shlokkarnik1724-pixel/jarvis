import { NextResponse } from "next/server";
import { DEMO_MODE } from "@/lib/config";
import {
  checkInDemo,
  claimDemoItem,
  getDemoEvent,
  getDemoShopping,
} from "@/lib/demo/store";
import { getSessionContext } from "@/lib/session";
import { fail, ok } from "@/lib/utils";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const session = await getSessionContext();
    if (!session) {
      return NextResponse.json(fail("Unauthorized"), { status: 401 });
    }

    const { id } = await context.params;

    if (DEMO_MODE || session.demo) {
      const event = getDemoEvent(id);
      if (!event) {
        return NextResponse.json(fail("Event not found"), { status: 404 });
      }
      return NextResponse.json(
        ok({ event, shopping: getDemoShopping(id) })
      );
    }

    return NextResponse.json(fail("Not found"), { status: 404 });
  } catch (error) {
    return NextResponse.json(
      fail(error instanceof Error ? error.message : "Failed to load event"),
      { status: 500 }
    );
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const session = await getSessionContext();
    if (!session) {
      return NextResponse.json(fail("Unauthorized"), { status: 401 });
    }

    const { id } = await context.params;
    const body = (await request.json()) as {
      action?: "checkin" | "claim";
      itemId?: string;
    };

    if (DEMO_MODE || session.demo) {
      if (body.action === "checkin") {
        const event = checkInDemo(id, session.user.id);
        if (!event) {
          return NextResponse.json(fail("Event not found"), { status: 404 });
        }
        return NextResponse.json(ok(event));
      }

      if (body.action === "claim" && body.itemId) {
        const item = claimDemoItem(body.itemId, session.user.id);
        if (!item) {
          return NextResponse.json(fail("Item not found"), { status: 404 });
        }
        return NextResponse.json(ok(item));
      }

      return NextResponse.json(fail("Invalid action"), { status: 400 });
    }

    return NextResponse.json(fail("Supabase event actions not yet wired"), {
      status: 501,
    });
  } catch (error) {
    return NextResponse.json(
      fail(error instanceof Error ? error.message : "Event action failed"),
      { status: 500 }
    );
  }
}
