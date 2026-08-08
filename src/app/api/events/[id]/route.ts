import { NextResponse } from "next/server";
import { DEMO_MODE } from "@/lib/config";
import {
  checkInDemo,
  claimDemoItem,
  getDemoEvent,
  getDemoShopping,
} from "@/lib/demo/store";
import {
  addShoppingItem,
  checkInEvent,
  claimShoppingItem,
  createEvent,
  getEventDetail,
} from "@/lib/data/circle-queries";
import { getSessionContext, requireCircleId } from "@/lib/session";
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
      return NextResponse.json(ok({ event, shopping: getDemoShopping(id) }));
    }

    const detail = await getEventDetail(id, session.user.id);
    if (!detail) {
      return NextResponse.json(fail("Event not found"), { status: 404 });
    }
    return NextResponse.json(ok(detail));
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
      action?: "checkin" | "claim" | "create" | "add_item";
      itemId?: string;
      itemName?: string;
      quantity?: string;
      title?: string;
      date?: string;
      location?: string;
      tags?: string[];
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

    if (body.action === "create") {
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
    }

    if (body.action === "checkin") {
      const detail = await checkInEvent(id, session.user.id);
      return NextResponse.json(ok(detail?.event));
    }

    if (body.action === "claim" && body.itemId) {
      const item = await claimShoppingItem(id, body.itemId, session.user.id);
      return NextResponse.json(ok(item));
    }

    if (body.action === "add_item" && body.itemName?.trim()) {
      const item = await addShoppingItem({
        eventId: id,
        itemName: body.itemName,
        quantity: body.quantity,
      });
      return NextResponse.json(ok(item));
    }

    return NextResponse.json(fail("Invalid action"), { status: 400 });
  } catch (error) {
    return NextResponse.json(
      fail(error instanceof Error ? error.message : "Event action failed"),
      { status: 500 }
    );
  }
}
