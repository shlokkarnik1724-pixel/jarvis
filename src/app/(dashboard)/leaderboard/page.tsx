import { DEMO_MODE } from "@/lib/config";
import { listLeaderboard } from "@/lib/data/circle-queries";
import { getDemoLeaderboard } from "@/lib/demo/store";
import { getSessionContext, requireCircleId } from "@/lib/session";
import { Badge } from "@/components/ui/badge";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";

export default async function LeaderboardPage() {
  const session = await getSessionContext();
  if (!session) return null;
  const rows =
    DEMO_MODE || session.demo
      ? getDemoLeaderboard()
      : await listLeaderboard(requireCircleId(session));

  return (
    <div className="space-y-6">
      <Reveal>
        <div>
          <h1 className="font-display text-3xl">Leaderboard</h1>
          <p className="mt-2 text-[var(--ink-muted)]">
            Ranked by game wins, event attendance, and custom circle points.
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
                  <p className="text-sm text-[var(--ink-muted)]">{row.name}</p>
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
