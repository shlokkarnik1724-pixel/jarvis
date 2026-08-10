import Link from "next/link";
import { ArrowRight, Camera, Gamepad2, ListChecks, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
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
      <Reveal>
        <section className="relative overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[linear-gradient(135deg,rgba(31,111,84,0.14),rgba(217,228,239,0.55)_45%,rgba(251,252,249,0.88))] px-6 py-8 shadow-[0_24px_50px_-36px_rgba(20,32,27,0.35)] backdrop-blur-sm md:px-10 md:py-12">
          <div className="pointer-events-none absolute -right-10 top-0 h-48 w-48 rounded-full bg-[radial-gradient(circle_at_center,rgba(31,111,84,0.18),transparent_70%)] blur-2xl" />
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
      </Reveal>

      <section className="grid gap-6 lg:grid-cols-3">
        <Reveal className="lg:col-span-2 space-y-4" delay={0.05}>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl">Upcoming event</h2>
            <Link
              href="/events"
              className="text-sm text-[var(--accent-deep)] transition hover:text-[var(--accent)]"
            >
              View all
            </Link>
          </div>
          {upcoming ? (
            <Link
              href={`/events/${upcoming.id}`}
              className="interactive-glow block rounded-2xl border border-transparent border-b-[var(--line)] pb-5 transition hover:border-[var(--line)] hover:bg-[var(--bg-elevated)]/70 hover:px-4 hover:py-4 hover:backdrop-blur-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-medium">{upcoming.title}</h3>
                  <p className="mt-1 text-sm text-[var(--ink-muted)]">
                    {formatDate(upcoming.date)}
                    {upcoming.location ? ` · ${upcoming.location}` : ""}
                  </p>
                </div>
                <Badge pulse>{upcoming.checkinCount} checked in</Badge>
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
              <Stagger className="space-y-2">
                {shopping.map((item) => (
                  <StaggerItem key={item.id}>
                    <div className="flex items-center justify-between border-b border-[var(--line)] py-2 text-sm transition hover:border-[var(--accent)]/40">
                      <span>
                        {item.itemName}
                        {item.quantity ? ` × ${item.quantity}` : ""}
                      </span>
                      <span className="text-[var(--ink-muted)]">
                        {item.claimerName ?? "Unclaimed"}
                      </span>
                    </div>
                  </StaggerItem>
                ))}
              </Stagger>
            )}
          </div>
        </Reveal>

        <Reveal className="space-y-8" delay={0.1}>
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-[var(--accent)]" />
              <h3 className="font-medium">Leaderboard snapshot</h3>
            </div>
            <Stagger className="space-y-3">
              {leaderboard.map((row, index) => (
                <StaggerItem key={row.userId}>
                  <div className="flex items-center justify-between rounded-xl px-2 py-1.5 text-sm transition hover:bg-[var(--accent-soft)]/50">
                    <span>
                      <span className="mr-2 text-[var(--ink-muted)]">{index + 1}.</span>
                      {row.nickname || row.name}
                    </span>
                    <span className="font-medium">{row.totalPoints} pts</span>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>

          <div>
            <div className="mb-3 flex items-center gap-2">
              <Gamepad2 className="h-4 w-4 text-[var(--accent)]" />
              <h3 className="font-medium">Active games</h3>
            </div>
            {games.length === 0 ? (
              <p className="text-sm text-[var(--ink-muted)]">No lobbies open.</p>
            ) : (
              <Stagger className="space-y-2 text-sm">
                {games.slice(0, 4).map((game) => (
                  <StaggerItem key={game.id}>
                    <Link
                      href={`/games/${game.gameType}?id=${game.id}`}
                      className="interactive-glow flex items-center justify-between rounded-xl border border-transparent border-b-[var(--line)] py-2 hover:border-[var(--line)] hover:bg-[var(--bg-elevated)]/80 hover:px-3 hover:text-[var(--accent-deep)]"
                    >
                      <span className="capitalize">
                        {game.gameType.replaceAll("_", " ")}
                      </span>
                      <Badge pulse={game.status === "active" || game.status === "lobby"}>
                        {game.status}
                      </Badge>
                    </Link>
                  </StaggerItem>
                ))}
              </Stagger>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-[var(--ink-muted)]">
            <Camera className="h-4 w-4" />
            Vault streams are canvas-only — no direct image URLs.
          </div>
        </Reveal>
      </section>
    </div>
  );
}
