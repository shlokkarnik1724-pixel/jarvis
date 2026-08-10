import { DEMO_MODE } from "@/lib/config";
import { listEvents, listLeaderboard, listMembers } from "@/lib/data/circle-queries";
import {
  getDemoEvents,
  getDemoLeaderboard,
  getDemoMembers,
} from "@/lib/demo/store";
import { getSessionContext, requireCircleId } from "@/lib/session";
import { Badge } from "@/components/ui/badge";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { titleForPoints } from "@/lib/lab/logic";
import { getCurrencySnapshot, syncLabContext } from "@/lib/lab/store";

export default async function LeaderboardPage() {
  const session = await getSessionContext();
  if (!session) return null;
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

  const currency = getCurrencySnapshot(circleId);
  const legacyRows =
    DEMO_MODE || session.demo
      ? getDemoLeaderboard()
      : await listLeaderboard(circleId);

  const rows =
    currency.rows.length > 0
      ? currency.rows
      : legacyRows.map((row) => ({
          ...row,
          title: titleForPoints(row.totalPoints),
        }));

  return (
    <div className="space-y-6">
      <Reveal>
        <div>
          <h1 className="font-display text-3xl">Leaderboard</h1>
          <p className="mt-2 text-[var(--ink-muted)]">
            Ranked by Circle Currency — games, attendance, vibes, polls, bingo, and more.
          </p>
        </div>
      </Reveal>

      <Stagger className="divide-y divide-[var(--line)]">
        {rows.map((row, index) => (
          <StaggerItem key={row.userId}>
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl py-5 transition hover:bg-[var(--accent-soft)]/35 hover:px-3">
              <div className="flex items-center gap-4">
                <span className="font-display text-2xl text-[var(--accent-deep)]">
                  {index + 1}
                </span>
                <div>
                  <p className="text-lg font-medium">{row.nickname || row.name}</p>
                  <p className="text-sm text-[var(--ink-muted)]">
                    {row.title ?? titleForPoints(row.totalPoints)} · {row.name}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {Object.entries(row.breakdown).map(([type, points]) => (
                  <Badge key={type} className="bg-[var(--bg)] text-[var(--ink-muted)]">
                    {type.replaceAll("_", " ")}: {points}
                  </Badge>
                ))}
                <span className="ml-2 text-lg font-semibold">{row.totalPoints} pts</span>
              </div>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}
