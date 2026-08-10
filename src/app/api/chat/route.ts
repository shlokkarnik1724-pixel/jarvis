import { NextResponse } from "next/server";
import {
  getMemberPartyProfile,
  listChatMessages,
  postChatMessage,
} from "@/lib/chat/store";
import { DEMO_MODE } from "@/lib/config";
import { listEvents, listMembers } from "@/lib/data/circle-queries";
import { getDemoEvents, getDemoMembers } from "@/lib/demo/store";
import { syncLabContext } from "@/lib/lab/store";
import { getSessionContext, requireCircleId } from "@/lib/session";
import { fail, ok } from "@/lib/utils";

async function prepare(session: NonNullable<Awaited<ReturnType<typeof getSessionContext>>>) {
  const circleId = requireCircleId(session);
  if (DEMO_MODE || session.demo) {
    syncLabContext(circleId, getDemoMembers(), getDemoEvents());
  } else {
    const [members, events] = await Promise.all([
      listMembers(circleId),
      listEvents(circleId, session.user.id),
    ]);
    syncLabContext(circleId, members, events);
  }
  return circleId;
}

export async function GET(request: Request) {
  try {
    const session = await getSessionContext();
    if (!session) return NextResponse.json(fail("Unauthorized"), { status: 401 });
    const circleId = await prepare(session);
    const profileId = new URL(request.url).searchParams.get("profile");
    if (profileId) {
      const profile = getMemberPartyProfile(circleId, profileId);
      if (!profile) return NextResponse.json(fail("Member not found"), { status: 404 });
      return NextResponse.json(ok(profile));
    }
    return NextResponse.json(ok({ messages: listChatMessages(circleId) }));
  } catch (error) {
    return NextResponse.json(
      fail(error instanceof Error ? error.message : "Chat load failed"),
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionContext();
    if (!session) return NextResponse.json(fail("Unauthorized"), { status: 401 });
    const circleId = await prepare(session);
    const body = (await request.json()) as { body?: string };
    const result = postChatMessage({
      circleId,
      userId: session.user.id,
      name: session.user.name,
      nickname: session.membership?.nickname ?? null,
      body: String(body.body ?? ""),
    });
    if ("error" in result) {
      return NextResponse.json(fail(result.error), { status: 400 });
    }
    return NextResponse.json(ok(result));
  } catch (error) {
    return NextResponse.json(
      fail(error instanceof Error ? error.message : "Chat send failed"),
      { status: 500 }
    );
  }
}
