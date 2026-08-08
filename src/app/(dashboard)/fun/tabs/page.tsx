import { TabTracker } from "@/components/fun/tab-tracker";
import { DEMO_MODE } from "@/lib/config";
import { listTabs } from "@/lib/data/circle-queries";
import { getDemoTabs } from "@/lib/demo/store";
import { getSessionContext, requireCircleId } from "@/lib/session";

export default async function TabsPage() {
  const session = await getSessionContext();
  if (!session) return null;
  const tabs =
    DEMO_MODE || session.demo
      ? getDemoTabs()
      : await listTabs(requireCircleId(session));
  return <TabTracker initialTabs={tabs} />;
}
