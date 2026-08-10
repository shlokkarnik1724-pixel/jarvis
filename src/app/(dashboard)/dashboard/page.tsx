import { IslandsDashboard } from "@/components/islands/islands-dashboard";
import { DEMO_MODE } from "@/lib/config";
import {
  listEvents,
  listMembers,
} from "@/lib/data/circle-queries";
import {
  getDemoEvents,
  getDemoMembers,
} from "@/lib/demo/store";
import { getLabHubSummary, syncLabContext } from "@/lib/lab/store";
import { getSessionContext, requireCircleId } from "@/lib/session";

export default async function DashboardPage() {
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

  const events =
    DEMO_MODE || session.demo
      ? getDemoEvents()
      : await listEvents(circleId, session.user.id);

  const upcoming = [...events].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )[0];

  const summary = getLabHubSummary(circleId, session.user.id);

  return (
    <IslandsDashboard
      userName={session.membership?.nickname || session.user.name}
      circleName={session.circle?.name ?? "Your Circle"}
      inviteCode={session.circle?.inviteCode ?? null}
      upcomingTitle={upcoming?.title ?? null}
      upcomingDate={upcoming?.date ?? null}
      vibeCount={summary.vibeCount}
      openPolls={summary.openPolls}
      myTitle={summary.myTitle}
    />
  );
}
