import { NextResponse } from "next/server";
import { DEMO_MODE } from "@/lib/config";
import { listEvents, listMembers } from "@/lib/data/circle-queries";
import { getDemoEvents, getDemoMembers } from "@/lib/demo/store";
import { syncLabContext } from "@/lib/lab/store";
import {
  addFlag,
  clockAttendance,
  dealCard,
  getBlackjackWins,
  handValue,
  hydrationNags,
  listAttendance,
  listDrinkTiers,
  listFlags,
  listRegrets,
  listSmokes,
  listVibePoll,
  listLiveLocations,
  listRideHomeSafety,
  recordBlackjackWin,
  setDesignatedDriver,
  setDrinkTier,
  setRegret,
  shareLocation,
  voteVibePoll,
  bumpSmoke,
  type DrinkTierKey,
} from "@/lib/party/systems";
import {
  addPlaylistTrack,
  bumpPlaylistPlay,
  listPlaylist,
} from "@/lib/party/playlist";
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
    const feature = new URL(request.url).searchParams.get("feature") ?? "bar";

    switch (feature) {
      case "bar":
        return NextResponse.json(
          ok({
            tiers: listDrinkTiers(circleId),
            nags: hydrationNags(circleId),
          })
        );
      case "flags":
        return NextResponse.json(
          ok({
            flags: listFlags(circleId),
            members: DEMO_MODE || session.demo ? getDemoMembers() : await listMembers(circleId),
          })
        );
      case "regret":
        return NextResponse.json(ok(listRegrets(circleId)));
      case "vibe-poll":
        return NextResponse.json(ok(listVibePoll(circleId)));
      case "lock":
        return NextResponse.json(
          ok({
            attendance: listAttendance(circleId),
            locations: listLiveLocations(circleId),
            rideHome: listRideHomeSafety(circleId),
          })
        );
      case "locations":
        return NextResponse.json(ok({ locations: listLiveLocations(circleId) }));
      case "ride-home":
        return NextResponse.json(ok({ rows: listRideHomeSafety(circleId) }));
      case "blackjack":
        return NextResponse.json(
          ok({ wins: getBlackjackWins(circleId, session.user.id) })
        );
      case "smokes":
        return NextResponse.json(ok({ rows: listSmokes(circleId) }));
      case "playlist":
        return NextResponse.json(ok(listPlaylist(circleId)));
      default:
        return NextResponse.json(fail("Unknown party feature"), { status: 400 });
    }
  } catch (error) {
    return NextResponse.json(
      fail(error instanceof Error ? error.message : "Party load failed"),
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionContext();
    if (!session) return NextResponse.json(fail("Unauthorized"), { status: 401 });
    const circleId = await prepare(session);
    const body = (await request.json()) as Record<string, unknown>;
    const feature = String(body.feature ?? "");
    const action = String(body.action ?? "");
    const name = session.membership?.nickname || session.user.name;

    if (feature === "bar" && action === "tier") {
      const tierKey = String(body.tierKey) as DrinkTierKey;
      const result = setDrinkTier({
        circleId,
        userId: session.user.id,
        name,
        tierKey,
      });
      if ("error" in result && result.error) {
        return NextResponse.json(fail(result.error), { status: 400 });
      }
      if (!("tiers" in result)) {
        return NextResponse.json(fail("Couldn’t set tier"), { status: 400 });
      }
      return NextResponse.json(
        ok({ tiers: result.tiers, nags: hydrationNags(circleId) })
      );
    }

    if (feature === "bar" && action === "dd") {
      const userId = body.userId ? String(body.userId) : null;
      return NextResponse.json(
        ok({
          tiers: setDesignatedDriver(circleId, userId),
          nags: hydrationNags(circleId),
        })
      );
    }

    if (feature === "flags" && action === "add") {
      const result = addFlag({
        circleId,
        targetId: String(body.targetId ?? ""),
        targetName: String(body.targetName ?? ""),
        flaggerName: name,
        flagType: String(body.flagType ?? ""),
      });
      if ("error" in result && result.error) {
        return NextResponse.json(fail(result.error), { status: 429 });
      }
      return NextResponse.json(ok(result));
    }

    if (feature === "regret" && action === "set") {
      return NextResponse.json(
        ok(
          setRegret({
            circleId,
            userId: session.user.id,
            name,
            score: Number(body.score ?? 0),
          })
        )
      );
    }

    if (feature === "vibe-poll" && action === "vote") {
      return NextResponse.json(
        ok(
          voteVibePoll({
            circleId,
            userId: session.user.id,
            name,
            score: body.score !== undefined ? Number(body.score) : undefined,
            slangId: body.slangId ? String(body.slangId) : undefined,
          })
        )
      );
    }

    if (feature === "lock" && action === "clock") {
      const result = clockAttendance({
        circleId,
        userId: session.user.id,
        name,
        action: body.clock === "out" ? "out" : "in",
        photoDataUrl: body.photoDataUrl ? String(body.photoDataUrl) : null,
        lat: typeof body.lat === "number" ? body.lat : null,
        lng: typeof body.lng === "number" ? body.lng : null,
        shareLocation: Boolean(body.shareLocation),
      });
      if ("error" in result && result.error) {
        return NextResponse.json(fail(result.error), { status: 400 });
      }
      return NextResponse.json(ok(result));
    }

    if (feature === "locations" && action === "share") {
      if (typeof body.lat !== "number" || typeof body.lng !== "number") {
        return NextResponse.json(fail("Location required"), { status: 400 });
      }
      return NextResponse.json(
        ok({
          locations: shareLocation({
            circleId,
            userId: session.user.id,
            name,
            lat: body.lat,
            lng: body.lng,
          }),
        })
      );
    }

    if (feature === "blackjack" && action === "deal") {
      const player = [dealCard(), dealCard()];
      const dealer = [dealCard(), dealCard()];
      return NextResponse.json(
        ok({
          player,
          dealer: [dealer[0], { rank: "?", suit: "?" }],
          dealerHidden: dealer,
          playerValue: handValue(player),
          wins: getBlackjackWins(circleId, session.user.id),
        })
      );
    }

    if (feature === "blackjack" && action === "hit") {
      const player = (body.player as Array<{ rank: string; suit: string }>) ?? [];
      const next = [...player, dealCard()];
      const value = handValue(next);
      return NextResponse.json(
        ok({
          player: next,
          playerValue: value,
          bust: value > 21,
        })
      );
    }

    if (feature === "blackjack" && action === "stand") {
      let dealer = (body.dealerHidden as Array<{ rank: string; suit: string }>) ?? [];
      const player = (body.player as Array<{ rank: string; suit: string }>) ?? [];
      while (handValue(dealer) < 17) dealer = [...dealer, dealCard()];
      const playerValue = handValue(player);
      const dealerValue = handValue(dealer);
      let outcome: "win" | "lose" | "push" = "lose";
      if (playerValue > 21) outcome = "lose";
      else if (dealerValue > 21 || playerValue > dealerValue) outcome = "win";
      else if (playerValue === dealerValue) outcome = "push";
      const wins =
        outcome === "win"
          ? recordBlackjackWin(circleId, session.user.id)
          : getBlackjackWins(circleId, session.user.id);
      return NextResponse.json(
        ok({ dealer, playerValue, dealerValue, outcome, wins })
      );
    }

    if (feature === "smokes" && action === "bump") {
      return NextResponse.json(
        ok({
          rows: bumpSmoke({
            circleId,
            userId: String(body.userId ?? session.user.id),
            kind: body.kind === "greens" ? "greens" : "cigarettes",
            delta: Number(body.delta ?? 1),
          }),
        })
      );
    }

    if (feature === "playlist" && action === "add") {
      const result = addPlaylistTrack({
        circleId,
        title: String(body.title ?? ""),
        artist: String(body.artist ?? ""),
        vibes: String(body.vibes ?? ""),
        addedBy: name,
        addedById: session.user.id,
      });
      if ("error" in result) {
        return NextResponse.json(fail(result.error), { status: 400 });
      }
      return NextResponse.json(ok(result));
    }

    if (feature === "playlist" && action === "play") {
      const result = bumpPlaylistPlay(circleId, String(body.trackId ?? ""));
      if ("error" in result) {
        return NextResponse.json(fail(result.error), { status: 404 });
      }
      return NextResponse.json(ok(result));
    }

    return NextResponse.json(fail("Unknown party action"), { status: 400 });
  } catch (error) {
    return NextResponse.json(
      fail(error instanceof Error ? error.message : "Party action failed"),
      { status: 500 }
    );
  }
}
