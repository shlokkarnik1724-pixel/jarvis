import Link from "next/link";
import { ArrowRight, Camera, Gamepad2, ListChecks, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DEMO_MODE } from "@/lib/config";
import {
  getDemoEvents,
  getDemoGames,
  getDemoLeaderboard,
  getDemoShopping,
} from "@/lib/demo/store";
import {
  listEvents,
  listGames,
  listLeaderboard,
  getEventDetail,
} from "@/lib/data/circle-queries";
import { getSessionContext } from "@/lib/session";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await getSessionContext();
  if (!session) return null;

  const circleId = session.circle?.id;
  const events =
    DEMO_MODE || session.demo || !circleId
      ? getDemoEvents()
      : await listEvents(circleId, session.user.id);

  const upcoming = [...events].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )[0];

  const shopping =
    DEMO_MODE || session.demo
      ? upcoming
        ? getDemoShopping(upcoming.id)
        : []
      : upcoming
        ? (await getEventDetail(upcoming.id, session.user.id))?.shopping ?? []
        : [];

  const leaderboard =
    DEMO_MODE || session.demo || !circleId
      ? getDemoLeaderboard().slice(0, 3)
      : (await listLeaderboard(circleId)).slice(0, 3);

  const games =
    DEMO_MODE || session.demo || !circleId
      ? getDemoGames()
      : await listGames(circleId);

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[linear-gradient(135deg,rgba(31,111,84,0.12),rgba(217,228,239,0.55)_45%,rgba(251,252,249,0.9))] px-6 py-8 md:px-10 md:py-12">
        <div className="relative max-w-2xl">
          <p className="font-display text-4xl tracking-tight md:text-5xl">Circle</p>
          <p className="mt-3 text-lg text-[var(--ink-muted)]">
            Welcome back, {session.membership?.nickname || session.user.name}.
            {session.circle ? ` You're in ${session.circle.name}.` : null}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/vault">
                Open Vault <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/games">Launch a game</Link>
            </Button>
            {session.circle?.inviteCode ? (
              <Button asChild variant="ghost">
                <Link href="/settings">Invite: {session.circle.inviteCode}</Link>
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl">Upcoming event</h2>
            <Link href="/events" className="text-sm text-[var(--accent-deep)]">
              View all
            </Link>
          </div>
          {upcoming ? (
            <Link
              href={`/events/${upcoming.id}`}
              className="block border-b border-[var(--line)] pb-5 transition hover:opacity-90"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-medium">{upcoming.title}</h3>
                  <p className="mt-1 text-sm text-[var(--ink-muted)]">
                    {formatDate(upcoming.date)}
                    {upcoming.location ? ` · ${upcoming.location}` : ""}
                  </p>
                </div>
                <Badge>{upcoming.checkinCount} checked in</Badge>
              </div>
            </Link>
          ) : (
            <p className="text-[var(--ink-muted)]">
              No upcoming events yet.{" "}
              <Link href="/events" className="text-[var(--accent-deep)]">
                Create one
              </Link>
              .
            </p>
          )}

          <div className="pt-2">
            <div className="mb-3 flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-[var(--accent)]" />
              <h3 className="font-medium">Shared shopping list</h3>
            </div>
            {shopping.length === 0 ? (
              <p className="text-sm text-[var(--ink-muted)]">Nothing on the list.</p>
            ) : (
              <ul className="space-y-2">
                {shopping.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between border-b border-[var(--line)] py-2 text-sm"
                  >
                    <span>
                      {item.itemName}
                      {item.quantity ? ` × ${item.quantity}` : ""}
                    </span>
                    <span className="text-[var(--ink-muted)]">
                      {item.claimerName ?? "Unclaimed"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-[var(--accent)]" />
              <h3 className="font-medium">Leaderboard snapshot</h3>
            </div>
            <ol className="space-y-3">
              {leaderboard.map((row, index) => (
                <li key={row.userId} className="flex items-center justify-between text-sm">
                  <span>
                    <span className="mr-2 text-[var(--ink-muted)]">{index + 1}.</span>
                    {row.nickname || row.name}
                  </span>
                  <span className="font-medium">{row.totalPoints} pts</span>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <div className="mb-3 flex items-center gap-2">
              <Gamepad2 className="h-4 w-4 text-[var(--accent)]" />
              <h3 className="font-medium">Active games</h3>
            </div>
            {games.length === 0 ? (
              <p className="text-sm text-[var(--ink-muted)]">No lobbies open.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {games.slice(0, 4).map((game) => (
                  <li key={game.id}>
                    <Link
                      href={`/games/${game.gameType}?id=${game.id}`}
                      className="flex items-center justify-between border-b border-[var(--line)] py-2 hover:text-[var(--accent-deep)]"
                    >
                      <span className="capitalize">
                        {game.gameType.replaceAll("_", " ")}
                      </span>
                      <Badge>{game.status}</Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-[var(--ink-muted)]">
            <Camera className="h-4 w-4" />
            Vault streams are canvas-only — no direct image URLs.
          </div>
        </div>
      </section>
    </div>
  );
}
