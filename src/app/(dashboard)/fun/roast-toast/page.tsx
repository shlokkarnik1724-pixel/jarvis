import { RoastToastBoard } from "@/components/fun/roast-toast-board";
import { DEMO_MODE } from "@/lib/config";
import { listRoasts } from "@/lib/data/circle-queries";
import { getDemoRoasts } from "@/lib/demo/store";
import { getSessionContext, requireCircleId } from "@/lib/session";

export default async function RoastToastPage() {
  const session = await getSessionContext();
  if (!session) return null;
  const items =
    DEMO_MODE || session.demo
      ? getDemoRoasts()
      : await listRoasts(requireCircleId(session), session.user.id);
  return <RoastToastBoard initialItems={items} />;
}
