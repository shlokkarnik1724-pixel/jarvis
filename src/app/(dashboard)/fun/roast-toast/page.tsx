import { RoastToastBoard } from "@/components/fun/roast-toast-board";
import { DEMO_MODE } from "@/lib/config";
import { getDemoRoasts } from "@/lib/demo/store";
import { getSessionContext } from "@/lib/session";

export default async function RoastToastPage() {
  const session = await getSessionContext();
  if (!session) return null;
  const items = DEMO_MODE || session.demo ? getDemoRoasts() : [];
  return <RoastToastBoard initialItems={items} />;
}
