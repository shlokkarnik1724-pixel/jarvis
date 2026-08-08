import { VibeGenerator } from "@/components/fun/vibe-generator";
import { DEMO_MODE } from "@/lib/config";
import { listEvents } from "@/lib/data/circle-queries";
import { getDemoEvents } from "@/lib/demo/store";
import { getSessionContext, requireCircleId } from "@/lib/session";

export default async function VibePage() {
  const session = await getSessionContext();
  if (!session) return null;
  const events =
    DEMO_MODE || session.demo
      ? getDemoEvents()
      : await listEvents(requireCircleId(session), session.user.id);
  return <VibeGenerator events={events} />;
}
