import { NextResponse } from "next/server";
import { DEMO_MODE } from "@/lib/config";
import { listEvents, listMembers } from "@/lib/data/circle-queries";
import { getDemoEvents, getDemoMembers } from "@/lib/demo/store";
import {
  addConfession,
  addJoke,
  bumpJoke,
  createPoll,
  getCurrencySnapshot,
  getLabHubSummary,
  getOrCreateBingoCard,
  getOrCreateRecoveryPlan,
  listActiveVibes,
  listBingoCards,
  listConfessions,
  listJokes,
  listPolls,
  listRecoveryPlans,
  markBingoCell,
  mostLikelyLeaderboard,
  reactConfession,
  setMomFriend,
  setVibeCheck,
  syncLabContext,
  updateRecoveryPlan,
  votePoll,
  vibePresets,
  getLabState,
} from "@/lib/lab/store";
import {
  addTruthDare,
  bumpSnack,
  checkInStreak,
  computeSuperlatives,
  drawTruthDare,
  getStreak,
  listGifs,
  listSnacks,
  listTruthDare,
  pinGif,
  searchGifs,
  spinRoulette,
  ROULETTE_DARES,
} from "@/lib/lab/islands-extra";
import { getSessionContext, requireCircleId } from "@/lib/session";
import { fail, ok } from "@/lib/utils";
import type { WellnessStatus } from "@/lib/types";

async function prepareLab(
  session: NonNullable<Awaited<ReturnType<typeof getSessionContext>>>
) {
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
    if (!session) {
      return NextResponse.json(fail("Unauthorized"), { status: 401 });
    }

    const circleId = await prepareLab(session);
    const { searchParams } = new URL(request.url);
    const feature = searchParams.get("feature") ?? "hub";
    const state = getLabState(circleId);

    switch (feature) {
      case "hub":
        return NextResponse.json(ok(getLabHubSummary(circleId, session.user.id)));
      case "vibes":
        return NextResponse.json(
          ok({
            vibes: listActiveVibes(circleId),
            presets: vibePresets(),
            members: state.members,
          })
        );
      case "jokes":
        return NextResponse.json(ok(listJokes(circleId)));
      case "currency":
        return NextResponse.json(ok(getCurrencySnapshot(circleId)));
      case "polls":
        return NextResponse.json(
          ok({
            polls: listPolls(circleId, session.user.id),
            legends: mostLikelyLeaderboard(circleId),
            members: state.members,
          })
        );
      case "confessions":
        return NextResponse.json(ok(listConfessions(circleId)));
      case "bingo":
        return NextResponse.json(
          ok({
            cards: listBingoCards(circleId, session.user.id),
            events: state.events,
          })
        );
      case "recovery":
        return NextResponse.json(
          ok({
            plans: listRecoveryPlans(circleId, session.user.id),
            events: state.events,
            members: state.members,
          })
        );
      case "snacks":
        return NextResponse.json(ok(listSnacks(circleId)));
      case "gifs":
        return NextResponse.json(
          ok({
            pins: listGifs(circleId),
            results: await searchGifs(
              searchParams.get("q") ?? "",
              searchParams.get("tag") ?? "all"
            ),
          })
        );
      case "streaks":
        return NextResponse.json(ok(getStreak(circleId)));
      case "roulette":
        return NextResponse.json(ok({ dares: ROULETTE_DARES }));
      case "truthdare":
        return NextResponse.json(ok(listTruthDare(circleId)));
      case "superlatives":
        return NextResponse.json(ok(computeSuperlatives(circleId)));
      default:
        return NextResponse.json(fail("Unknown lab feature"), { status: 400 });
    }
  } catch (error) {
    return NextResponse.json(
      fail(error instanceof Error ? error.message : "Lab load failed"),
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

    const circleId = await prepareLab(session);
    const body = (await request.json()) as Record<string, unknown>;
    const feature = String(body.feature ?? "");
    const action = String(body.action ?? "");

    if (feature === "vibes" && action === "set") {
      const emoji = String(body.emoji ?? "");
      const label = String(body.label ?? "");
      if (!emoji || !label) {
        return NextResponse.json(fail("Pick a vibe"), { status: 400 });
      }
      return NextResponse.json(
        ok(
          setVibeCheck({
            circleId,
            userId: session.user.id,
            emoji,
            label,
          })
        )
      );
    }

    if (feature === "jokes" && action === "add") {
      const term = String(body.term ?? "").trim();
      const definition = String(body.definition ?? "").trim();
      if (!term || !definition) {
        return NextResponse.json(fail("Term and definition required"), {
          status: 400,
        });
      }
      return NextResponse.json(
        ok(
          addJoke({
            circleId,
            term,
            definition,
            addedByName: session.membership?.nickname || session.user.name,
          })
        )
      );
    }

    if (feature === "jokes" && action === "bump") {
      const jokeId = String(body.jokeId ?? "");
      const joke = bumpJoke(circleId, jokeId, session.user.id);
      if (!joke) return NextResponse.json(fail("Joke not found"), { status: 404 });
      return NextResponse.json(ok(joke));
    }

    if (feature === "polls" && action === "create") {
      const prompt = String(body.prompt ?? "").trim();
      if (!prompt) return NextResponse.json(fail("Prompt required"), { status: 400 });
      return NextResponse.json(
        ok(
          createPoll({
            circleId,
            prompt,
            createdByName: session.membership?.nickname || session.user.name,
          })
        )
      );
    }

    if (feature === "polls" && action === "vote") {
      const pollId = String(body.pollId ?? "");
      const votedForUserId = String(body.votedForUserId ?? "");
      const poll = votePoll({
        circleId,
        pollId,
        voterId: session.user.id,
        votedForUserId,
      });
      if (!poll) return NextResponse.json(fail("Poll not found"), { status: 404 });
      return NextResponse.json(ok(poll));
    }

    if (feature === "confessions" && action === "add") {
      const text = String(body.text ?? "").trim();
      if (!text) return NextResponse.json(fail("Write something"), { status: 400 });
      const result = addConfession({
        circleId,
        userId: session.user.id,
        text,
      });
      if ("error" in result) {
        return NextResponse.json(fail(result.error), { status: 429 });
      }
      return NextResponse.json(ok(result));
    }

    if (feature === "confessions" && action === "react") {
      const confessionId = String(body.confessionId ?? "");
      const reaction = body.reaction === "skull" ? "skull" : "fire";
      const entry = reactConfession({ circleId, confessionId, reaction });
      if (!entry) return NextResponse.json(fail("Not found"), { status: 404 });
      return NextResponse.json(ok(entry));
    }

    if (feature === "bingo" && action === "deal") {
      const eventId = String(body.eventId ?? "");
      const card = getOrCreateBingoCard({
        circleId,
        eventId,
        userId: session.user.id,
      });
      if (!card) return NextResponse.json(fail("Event not found"), { status: 404 });
      return NextResponse.json(ok(card));
    }

    if (feature === "bingo" && action === "mark") {
      const cardId = String(body.cardId ?? "");
      const index = Number(body.index);
      const card = markBingoCell({
        circleId,
        cardId,
        index,
        userId: session.user.id,
      });
      if (!card) return NextResponse.json(fail("Card not found"), { status: 404 });
      return NextResponse.json(ok(card));
    }

    if (feature === "recovery" && action === "start") {
      const eventId = String(body.eventId ?? "");
      const drinkCount = Number(body.drinkCount ?? 5);
      const plan = getOrCreateRecoveryPlan({
        circleId,
        userId: session.user.id,
        eventId,
        drinkCount,
      });
      if (!plan) return NextResponse.json(fail("Event not found"), { status: 404 });
      return NextResponse.json(ok(plan));
    }

    if (feature === "recovery" && action === "update") {
      const planId = String(body.planId ?? "");
      const result = updateRecoveryPlan({
        circleId,
        planId,
        userId: session.user.id,
        taskIndex: typeof body.taskIndex === "number" ? body.taskIndex : undefined,
        symptoms: Array.isArray(body.symptoms)
          ? body.symptoms.map(String)
          : undefined,
        wellness:
          body.wellness === "fine" ||
          body.wellness === "rough" ||
          body.wellness === "help"
            ? (body.wellness as WellnessStatus)
            : undefined,
        logWater: Boolean(body.logWater),
        kitIndex: typeof body.kitIndex === "number" ? body.kitIndex : undefined,
      });
      if ("error" in result && result.error && !result.plan) {
        return NextResponse.json(fail(result.error), { status: 404 });
      }
      if ("plan" in result && result.plan) {
        return NextResponse.json(ok({ plan: result.plan, alert: result.alert }));
      }
      return NextResponse.json(ok({ plan: result }));
    }

    if (feature === "recovery" && action === "mom") {
      setMomFriend(circleId, session.user.id);
      return NextResponse.json(ok({ momFriendUserId: session.user.id }));
    }

    if (feature === "snacks" && action === "bump") {
      const snackName = String(body.snackName ?? "").trim();
      if (!snackName) {
        return NextResponse.json(fail("Snack name required"), { status: 400 });
      }
      return NextResponse.json(ok(bumpSnack(circleId, snackName)));
    }

    if (feature === "gifs" && action === "pin") {
      const url = String(body.url ?? "");
      const title = String(body.title ?? "gif");
      if (!url) return NextResponse.json(fail("GIF url required"), { status: 400 });
      return NextResponse.json(
        ok(
          pinGif({
            circleId,
            url,
            title,
            pinnedByName: session.membership?.nickname || session.user.name,
          })
        )
      );
    }

    if (feature === "gifs" && action === "search") {
      const q = String(body.q ?? "");
      const tag = String(body.tag ?? "all");
      return NextResponse.json(ok(await searchGifs(q, tag)));
    }

    if (feature === "streaks" && action === "checkin") {
      return NextResponse.json(ok(checkInStreak(circleId, session.user.id)));
    }

    if (feature === "roulette" && action === "spin") {
      return NextResponse.json(ok(spinRoulette()));
    }

    if (feature === "truthdare" && action === "draw") {
      return NextResponse.json(ok(drawTruthDare(circleId)));
    }

    if (feature === "truthdare" && action === "add") {
      const kind = body.kind === "truth" ? "truth" : "dare";
      const text = String(body.text ?? "").trim();
      if (!text) return NextResponse.json(fail("Write a prompt"), { status: 400 });
      return NextResponse.json(ok(addTruthDare({ circleId, kind, text })));
    }

    return NextResponse.json(fail("Unknown lab action"), { status: 400 });
  } catch (error) {
    return NextResponse.json(
      fail(error instanceof Error ? error.message : "Lab action failed"),
      { status: 500 }
    );
  }
}
