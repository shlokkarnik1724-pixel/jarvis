/**
 * Minimal peer-to-peer settlement reducer.
 * Converts N expense payments into the fewest transfer pairs that zero balances.
 */

export interface ExpenseInput {
  payerId: string;
  payerName: string;
  amount: number;
}

export interface Balance {
  userId: string;
  name: string;
  net: number;
}

export interface Transfer {
  fromUserId: string;
  fromName: string;
  toUserId: string;
  toName: string;
  amount: number;
}

export function computeBalances(expenses: ExpenseInput[]): Balance[] {
  if (expenses.length === 0) return [];

  const totals = new Map<string, { name: string; paid: number }>();
  let grandTotal = 0;

  for (const expense of expenses) {
    const amount = Number(expense.amount);
    if (!Number.isFinite(amount) || amount <= 0) continue;
    grandTotal += amount;
    const existing = totals.get(expense.payerId);
    if (existing) {
      existing.paid += amount;
    } else {
      totals.set(expense.payerId, { name: expense.payerName, paid: amount });
    }
  }

  const people = [...totals.entries()];
  if (people.length === 0) return [];

  const share = grandTotal / people.length;
  return people.map(([userId, value]) => ({
    userId,
    name: value.name,
    net: roundMoney(value.paid - share),
  }));
}

export function settleDebts(expenses: ExpenseInput[]): Transfer[] {
  const balances = computeBalances(expenses)
    .map((b) => ({ ...b, net: roundMoney(b.net) }))
    .filter((b) => Math.abs(b.net) >= 0.01);

  const debtors = balances
    .filter((b) => b.net < 0)
    .map((b) => ({ ...b, net: Math.abs(b.net) }))
    .sort((a, b) => b.net - a.net);

  const creditors = balances
    .filter((b) => b.net > 0)
    .sort((a, b) => b.net - a.net);

  const transfers: Transfer[] = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = roundMoney(Math.min(debtor.net, creditor.net));

    if (amount >= 0.01) {
      transfers.push({
        fromUserId: debtor.userId,
        fromName: debtor.name,
        toUserId: creditor.userId,
        toName: creditor.name,
        amount,
      });
    }

    debtor.net = roundMoney(debtor.net - amount);
    creditor.net = roundMoney(creditor.net - amount);

    if (debtor.net < 0.01) i += 1;
    if (creditor.net < 0.01) j += 1;
  }

  return transfers;
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}
