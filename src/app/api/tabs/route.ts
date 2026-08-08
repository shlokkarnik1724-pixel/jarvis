import { NextResponse } from "next/server";
import {
  addTab,
  listTabs,
} from "@/lib/data/circle-queries";
import { DEMO_MODE } from "@/lib/config";
import { addDemoTab, getDemoTabs } from "@/lib/demo/store";
import { getSessionContext, requireCircleId } from "@/lib/session";
import { settleDebts } from "@/lib/utils/settlements";
import { fail, ok } from "@/lib/utils";

export async function GET() {
  try {
    const session = await getSessionContext();
    if (!session) {
      return NextResponse.json(fail("Unauthorized"), { status: 401 });
    }

    const tabs =
      DEMO_MODE || session.demo
        ? getDemoTabs()
        : await listTabs(requireCircleId(session));

    const settlements = settleDebts(
      tabs.map((tab) => ({
        payerId: tab.payerId,
        payerName: tab.payerName,
        amount: tab.amount,
      }))
    );
    return NextResponse.json(ok({ tabs, settlements }));
  } catch (error) {
    return NextResponse.json(
      fail(error instanceof Error ? error.message : "Failed to load tabs"),
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
      amount?: number | string;
      description?: string;
    };

    const amount = Number(body.amount);
    const description = body.description?.trim() ?? "";

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(fail("Amount must be a positive decimal"), {
        status: 400,
      });
    }
    if (!description) {
      return NextResponse.json(fail("Description is required"), { status: 400 });
    }

    if (DEMO_MODE || session.demo) {
      const entry = addDemoTab({
        payerId: session.user.id,
        payerName: session.user.name,
        amount: Math.round(amount * 100) / 100,
        description,
      });
      return NextResponse.json(ok(entry));
    }

    const entry = await addTab({
      circleId: requireCircleId(session),
      payerId: session.user.id,
      amount: Math.round(amount * 100) / 100,
      description,
    });
    return NextResponse.json(ok(entry));
  } catch (error) {
    return NextResponse.json(
      fail(error instanceof Error ? error.message : "Failed to add tab"),
      { status: 500 }
    );
  }
}
