import { NextResponse } from "next/server";
import { DEMO_MODE } from "@/lib/config";
import {
  createDemoGame,
  getDemoGame,
  getDemoGames,
  updateDemoGame,
} from "@/lib/demo/store";
import {
  createGame,
  getGame,
  listGames,
  updateGame,
} from "@/lib/data/circle-queries";
import { applyGameAction } from "@/lib/games/state-machine";
import { getSessionContext, requireCircleId } from "@/lib/session";
import type { GameType } from "@/lib/types";
import { fail, ok } from "@/lib/utils";

const GAME_TYPES: GameType[] = [
  "mafia",
  "trivia",
  "prediction_league",
  "myth_buster",
];

export async function GET() {
  try {
    const session = await getSessionContext();
    if (!session) {
      return NextResponse.json(fail("Unauthorized"), { status: 401 });
    }

    if (DEMO_MODE || session.demo) {
      return NextResponse.json(ok(getDemoGames()));
    }

    return NextResponse.json(ok(await listGames(requireCircleId(session))));
  } catch (error) {
    return NextResponse.json(
      fail(error instanceof Error ? error.message : "Failed to list games"),
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
      gameType?: GameType;
      gameId?: string;
      action?: { type: string; payload?: Record<string, unknown> };
    };

    if (DEMO_MODE || session.demo) {
      if (body.gameId && body.action) {
        const existing = getDemoGame(body.gameId);
        if (!existing) {
          return NextResponse.json(fail("Game not found"), { status: 404 });
        }
        const nextState = applyGameAction(
          existing.gameType,
          existing.state,
          body.action
        );
        const status =
          typeof nextState.phase === "string" && nextState.phase === "ended"
            ? "completed"
            : existing.status === "lobby" && body.action.type === "start"
              ? "active"
              : existing.status;
        const updated = updateDemoGame(body.gameId, nextState, status);
        return NextResponse.json(ok(updated));
      }

      if (body.gameType && GAME_TYPES.includes(body.gameType)) {
        return NextResponse.json(ok(createDemoGame(body.gameType)));
      }

      return NextResponse.json(fail("Invalid game request"), { status: 400 });
    }

    if (body.gameId && body.action) {
      const existing = await getGame(body.gameId);
      if (!existing) {
        return NextResponse.json(fail("Game not found"), { status: 404 });
      }
      const nextState = applyGameAction(
        existing.gameType,
        existing.state,
        body.action
      );
      const status =
        typeof nextState.phase === "string" && nextState.phase === "ended"
          ? "completed"
          : existing.status === "lobby" && body.action.type === "start"
            ? "active"
            : existing.status;
      const updated = await updateGame(body.gameId, nextState, status);
      return NextResponse.json(ok(updated));
    }

    if (body.gameType && GAME_TYPES.includes(body.gameType)) {
      const created = await createGame(requireCircleId(session), body.gameType);
      return NextResponse.json(ok(created));
    }

    return NextResponse.json(fail("Invalid game request"), { status: 400 });
  } catch (error) {
    return NextResponse.json(
      fail(error instanceof Error ? error.message : "Game action failed"),
      { status: 500 }
    );
  }
}
