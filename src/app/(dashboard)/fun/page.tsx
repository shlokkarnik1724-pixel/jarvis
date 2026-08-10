import { CircleLabHub } from "@/components/lab/circle-lab-hub";
import { getLabHubSummary, syncLabContext } from "@/lib/lab/store";
import { DEMO_MODE } from "@/lib/config";
import { getDemoEvents, getDemoMembers } from "@/lib/demo/store";
import { listEvents, listMembers } from "@/lib/data/circle-queries";
import { getSessionContext, requireCircleId } from "@/lib/session";

export default async function FunHubPage() {
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

  const summary = getLabHubSummary(circleId, session.user.id);
  return (
    <CircleLabHub
      myTitle={summary.myTitle}
      vibeCount={summary.vibeCount}
      openPolls={summary.openPolls}
    />
  );
}
