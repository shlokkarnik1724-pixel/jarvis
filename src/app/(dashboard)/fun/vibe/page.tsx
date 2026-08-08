import { VibeGenerator } from "@/components/fun/vibe-generator";
import { DEMO_MODE } from "@/lib/config";
import { getDemoEvents } from "@/lib/demo/store";
import { getSessionContext } from "@/lib/session";

export default async function VibePage() {
  const session = await getSessionContext();
  if (!session) return null;
  const events = DEMO_MODE || session.demo ? getDemoEvents() : [];
  return <VibeGenerator events={events} />;
}
