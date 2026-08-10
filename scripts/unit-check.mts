import assert from "node:assert/strict";
import { settleDebts, computeBalances } from "../src/lib/utils/settlements.ts";
import {
  applyGameAction,
  createInitialState,
  startMafia,
  joinMafia,
} from "../src/lib/games/state-machine.ts";
import {
  checkBingo,
  generateRecoveryTasks,
  severityFromDrinks,
  titleForPoints,
} from "../src/lib/lab/logic.ts";

function testSettlements() {
  const transfers = settleDebts([
    { payerId: "a", payerName: "Alex", amount: 90 },
    { payerId: "b", payerName: "Jordan", amount: 30 },
    { payerId: "c", payerName: "Sam", amount: 0 },
  ]);

  const balances = computeBalances([
    { payerId: "a", payerName: "Alex", amount: 90 },
    { payerId: "b", payerName: "Jordan", amount: 30 },
    { payerId: "c", payerName: "Sam", amount: 0 },
  ]);

  const totalPositive = balances
    .filter((b) => b.net > 0)
    .reduce((sum, b) => sum + b.net, 0);
  const totalTransfer = transfers.reduce((sum, t) => sum + t.amount, 0);

  assert.equal(Math.round(totalPositive * 100), Math.round(totalTransfer * 100));
  assert.ok(transfers.length <= 2);
  console.log("settlements: ok");
}

function testMafia() {
  let state = createInitialState("mafia");
  if (!("players" in state)) throw new Error("expected mafia state");
  state = joinMafia(state, { userId: "1", name: "A", alive: true });
  state = joinMafia(state, { userId: "2", name: "B", alive: true });
  state = joinMafia(state, { userId: "3", name: "C", alive: true });
  state = joinMafia(state, { userId: "4", name: "D", alive: true });
  state = startMafia(state);
  assert.equal(state.phase, "night");
  assert.equal(state.players.length, 4);

  const next = applyGameAction("mafia", state as unknown as Record<string, unknown>, {
    type: "night_action",
    payload: { actorId: "1", targetId: "2" },
  });
  assert.ok(next.nightActions);
  console.log("mafia state machine: ok");
}

function testLabLogic() {
  const marked = Array.from({ length: 25 }, () => false);
  marked[0] = marked[1] = marked[2] = marked[3] = marked[4] = true;
  assert.equal(checkBingo(marked), true);

  const empty = Array.from({ length: 25 }, () => false);
  assert.equal(checkBingo(empty), false);

  assert.equal(severityFromDrinks(2), "light");
  assert.equal(severityFromDrinks(5), "medium");
  assert.equal(severityFromDrinks(9), "heavy");

  const heavyTasks = generateRecoveryTasks("heavy");
  assert.ok(heavyTasks.some((t) => t.text.includes("alive")));
  assert.equal(titleForPoints(85), "Chaos Coordinator");
  console.log("lab logic: ok");
}

testSettlements();
testMafia();
testLabLogic();
console.log("all unit checks passed");
