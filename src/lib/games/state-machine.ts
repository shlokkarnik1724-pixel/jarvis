import type { GameType } from "@/lib/types";

export type MafiaRole = "mafia" | "villager" | "doctor" | "detective";
export type MafiaPhase = "lobby" | "night" | "day" | "vote" | "ended";

export interface PlayerRef {
  userId: string;
  name: string;
  alive: boolean;
}

export interface MafiaState {
  phase: MafiaPhase;
  players: Array<PlayerRef & { role?: MafiaRole }>;
  nightActions: Record<string, string>;
  votes: Record<string, string>;
  winner: "mafia" | "village" | null;
  log: string[];
}

export interface TriviaQuestion {
  id: string;
  prompt: string;
  choices: string[];
  answerIndex: number;
}

export interface TriviaState {
  phase: "lobby" | "question" | "reveal" | "ended";
  questions: TriviaQuestion[];
  currentIndex: number;
  scores: Record<string, number>;
  answers: Record<string, number>;
}

export interface PredictionState {
  phase: "lobby" | "open" | "locked" | "settled";
  prompt: string;
  options: string[];
  bets: Record<string, { optionIndex: number; stake: number }>;
  resultIndex: number | null;
  payouts: Record<string, number>;
}

export interface MythBusterState {
  phase: "lobby" | "claim" | "vote" | "reveal" | "ended";
  subjectUserId: string | null;
  claim: string;
  truth: boolean | null;
  votes: Record<string, boolean>;
  scores: Record<string, number>;
}

export type GameStateMap = {
  mafia: MafiaState;
  trivia: TriviaState;
  prediction_league: PredictionState;
  myth_buster: MythBusterState;
};

export function createInitialState(gameType: GameType): GameStateMap[GameType] {
  switch (gameType) {
    case "mafia":
      return {
        phase: "lobby",
        players: [],
        nightActions: {},
        votes: {},
        winner: null,
        log: ["Lobby opened. Waiting for players."],
      } satisfies MafiaState;
    case "trivia":
      return {
        phase: "lobby",
        questions: [],
        currentIndex: 0,
        scores: {},
        answers: {},
      } satisfies TriviaState;
    case "prediction_league":
      return {
        phase: "lobby",
        prompt: "",
        options: [],
        bets: {},
        resultIndex: null,
        payouts: {},
      } satisfies PredictionState;
    case "myth_buster":
      return {
        phase: "lobby",
        subjectUserId: null,
        claim: "",
        truth: null,
        votes: {},
        scores: {},
      } satisfies MythBusterState;
    default: {
      const _exhaustive: never = gameType;
      return _exhaustive;
    }
  }
}

export function joinMafia(state: MafiaState, player: PlayerRef): MafiaState {
  if (state.players.some((p) => p.userId === player.userId)) return state;
  return {
    ...state,
    players: [...state.players, { ...player, alive: true }],
    log: [...state.log, `${player.name} joined the lobby.`],
  };
}

export function startMafia(state: MafiaState): MafiaState {
  if (state.players.length < 4) {
    return {
      ...state,
      log: [...state.log, "Need at least 4 players to start."],
    };
  }

  const shuffled = [...state.players].sort(() => Math.random() - 0.5);
  const roles: MafiaRole[] = [];
  const mafiaCount = Math.max(1, Math.floor(shuffled.length / 4));
  for (let i = 0; i < shuffled.length; i += 1) {
    if (i < mafiaCount) roles.push("mafia");
    else if (i === mafiaCount) roles.push("doctor");
    else if (i === mafiaCount + 1) roles.push("detective");
    else roles.push("villager");
  }

  const players = shuffled.map((player, index) => ({
    ...player,
    role: roles[index],
    alive: true,
  }));

  return {
    phase: "night",
    players,
    nightActions: {},
    votes: {},
    winner: null,
    log: [...state.log, "Roles assigned. Night falls."],
  };
}

export function resolveMafiaNight(state: MafiaState): MafiaState {
  const killTarget = Object.entries(state.nightActions).find(([actorId]) => {
    const actor = state.players.find((p) => p.userId === actorId);
    return actor?.role === "mafia";
  })?.[1];

  const saveTarget = Object.entries(state.nightActions).find(([actorId]) => {
    const actor = state.players.find((p) => p.userId === actorId);
    return actor?.role === "doctor";
  })?.[1];

  const players = state.players.map((player) => {
    if (player.userId === killTarget && player.userId !== saveTarget) {
      return { ...player, alive: false };
    }
    return player;
  });

  const log = [...state.log];
  if (killTarget && killTarget !== saveTarget) {
    const victim = state.players.find((p) => p.userId === killTarget);
    log.push(`${victim?.name ?? "Someone"} was eliminated overnight.`);
  } else {
    log.push("No one died overnight.");
  }

  return {
    ...state,
    phase: "day",
    players,
    nightActions: {},
    votes: {},
    log,
    winner: checkMafiaWinner(players),
  };
}

export function resolveMafiaVote(state: MafiaState): MafiaState {
  const tally = new Map<string, number>();
  for (const targetId of Object.values(state.votes)) {
    tally.set(targetId, (tally.get(targetId) ?? 0) + 1);
  }

  let topId: string | null = null;
  let topCount = 0;
  for (const [id, count] of tally) {
    if (count > topCount) {
      topId = id;
      topCount = count;
    }
  }

  const players = state.players.map((player) =>
    player.userId === topId ? { ...player, alive: false } : player
  );
  const victim = state.players.find((p) => p.userId === topId);
  const winner = checkMafiaWinner(players);

  return {
    ...state,
    phase: winner ? "ended" : "night",
    players,
    votes: {},
    winner,
    log: [
      ...state.log,
      victim ? `${victim.name} was voted out.` : "Vote tied. No elimination.",
      winner ? `Game over. ${winner} wins.` : "Night falls again.",
    ],
  };
}

function checkMafiaWinner(
  players: Array<PlayerRef & { role?: MafiaRole }>
): "mafia" | "village" | null {
  const alive = players.filter((p) => p.alive);
  const mafiaAlive = alive.filter((p) => p.role === "mafia").length;
  const villageAlive = alive.length - mafiaAlive;
  if (mafiaAlive === 0) return "village";
  if (mafiaAlive >= villageAlive) return "mafia";
  return null;
}

export function submitTriviaAnswer(
  state: TriviaState,
  userId: string,
  choiceIndex: number
): TriviaState {
  if (state.phase !== "question") return state;
  return {
    ...state,
    answers: { ...state.answers, [userId]: choiceIndex },
  };
}

export function revealTrivia(state: TriviaState): TriviaState {
  const question = state.questions[state.currentIndex];
  if (!question) return { ...state, phase: "ended" };

  const scores = { ...state.scores };
  for (const [userId, answer] of Object.entries(state.answers)) {
    if (answer === question.answerIndex) {
      scores[userId] = (scores[userId] ?? 0) + 1;
    }
  }

  const nextIndex = state.currentIndex + 1;
  const ended = nextIndex >= state.questions.length;

  return {
    ...state,
    phase: ended ? "ended" : "reveal",
    scores,
    currentIndex: ended ? state.currentIndex : nextIndex,
    answers: ended ? state.answers : {},
  };
}

export function placePredictionBet(
  state: PredictionState,
  userId: string,
  optionIndex: number,
  stake: number
): PredictionState {
  if (state.phase !== "open") return state;
  if (optionIndex < 0 || optionIndex >= state.options.length) return state;
  if (stake <= 0) return state;
  return {
    ...state,
    bets: { ...state.bets, [userId]: { optionIndex, stake } },
  };
}

export function settlePrediction(
  state: PredictionState,
  resultIndex: number
): PredictionState {
  const winners = Object.entries(state.bets).filter(
    ([, bet]) => bet.optionIndex === resultIndex
  );
  const totalStake = Object.values(state.bets).reduce((sum, b) => sum + b.stake, 0);
  const winnerStake = winners.reduce((sum, [, b]) => sum + b.stake, 0);
  const payouts: Record<string, number> = {};

  for (const [userId, bet] of winners) {
    payouts[userId] =
      winnerStake > 0 ? Math.round((bet.stake / winnerStake) * totalStake * 100) / 100 : 0;
  }

  return {
    ...state,
    phase: "settled",
    resultIndex,
    payouts,
  };
}

export function castMythVote(
  state: MythBusterState,
  userId: string,
  believesTrue: boolean
): MythBusterState {
  if (state.phase !== "vote") return state;
  return {
    ...state,
    votes: { ...state.votes, [userId]: believesTrue },
  };
}

export function revealMyth(
  state: MythBusterState,
  truth: boolean
): MythBusterState {
  const scores = { ...state.scores };
  for (const [userId, vote] of Object.entries(state.votes)) {
    if (vote === truth) {
      scores[userId] = (scores[userId] ?? 0) + 1;
    }
  }
  return {
    ...state,
    phase: "reveal",
    truth,
    scores,
  };
}

export function applyGameAction(
  gameType: GameType,
  state: Record<string, unknown>,
  action: { type: string; payload?: Record<string, unknown> }
): Record<string, unknown> {
  switch (gameType) {
    case "mafia": {
      const mafia = state as unknown as MafiaState;
      if (action.type === "join" && action.payload) {
        return joinMafia(mafia, {
          userId: String(action.payload.userId),
          name: String(action.payload.name),
          alive: true,
        }) as unknown as Record<string, unknown>;
      }
      if (action.type === "start") {
        return startMafia(mafia) as unknown as Record<string, unknown>;
      }
      if (action.type === "night_action" && action.payload) {
        return {
          ...mafia,
          nightActions: {
            ...mafia.nightActions,
            [String(action.payload.actorId)]: String(action.payload.targetId),
          },
        } as unknown as Record<string, unknown>;
      }
      if (action.type === "resolve_night") {
        return resolveMafiaNight(mafia) as unknown as Record<string, unknown>;
      }
      if (action.type === "vote" && action.payload) {
        return {
          ...mafia,
          votes: {
            ...mafia.votes,
            [String(action.payload.voterId)]: String(action.payload.targetId),
          },
          phase: "vote",
        } as unknown as Record<string, unknown>;
      }
      if (action.type === "resolve_vote") {
        return resolveMafiaVote(mafia) as unknown as Record<string, unknown>;
      }
      return state;
    }
    case "trivia": {
      const trivia = state as unknown as TriviaState;
      if (action.type === "answer" && action.payload) {
        return submitTriviaAnswer(
          trivia,
          String(action.payload.userId),
          Number(action.payload.choiceIndex)
        ) as unknown as Record<string, unknown>;
      }
      if (action.type === "reveal") {
        return revealTrivia(trivia) as unknown as Record<string, unknown>;
      }
      if (action.type === "load_questions" && action.payload) {
        return {
          ...trivia,
          questions: action.payload.questions as TriviaQuestion[],
          phase: "question",
          currentIndex: 0,
          answers: {},
        } as unknown as Record<string, unknown>;
      }
      return state;
    }
    case "prediction_league": {
      const prediction = state as unknown as PredictionState;
      if (action.type === "open" && action.payload) {
        return {
          ...prediction,
          phase: "open",
          prompt: String(action.payload.prompt),
          options: action.payload.options as string[],
          bets: {},
          resultIndex: null,
          payouts: {},
        } as unknown as Record<string, unknown>;
      }
      if (action.type === "bet" && action.payload) {
        return placePredictionBet(
          prediction,
          String(action.payload.userId),
          Number(action.payload.optionIndex),
          Number(action.payload.stake)
        ) as unknown as Record<string, unknown>;
      }
      if (action.type === "settle" && action.payload) {
        return settlePrediction(
          prediction,
          Number(action.payload.resultIndex)
        ) as unknown as Record<string, unknown>;
      }
      return state;
    }
    case "myth_buster": {
      const myth = state as unknown as MythBusterState;
      if (action.type === "set_claim" && action.payload) {
        return {
          ...myth,
          phase: "vote",
          subjectUserId: String(action.payload.subjectUserId),
          claim: String(action.payload.claim),
          votes: {},
          truth: null,
        } as unknown as Record<string, unknown>;
      }
      if (action.type === "vote" && action.payload) {
        return castMythVote(
          myth,
          String(action.payload.userId),
          Boolean(action.payload.believesTrue)
        ) as unknown as Record<string, unknown>;
      }
      if (action.type === "reveal" && action.payload) {
        return revealMyth(myth, Boolean(action.payload.truth)) as unknown as Record<
          string,
          unknown
        >;
      }
      return state;
    }
    default:
      return state;
  }
}
