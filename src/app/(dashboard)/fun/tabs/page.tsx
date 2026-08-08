import { TabTracker } from "@/components/fun/tab-tracker";
import { DEMO_MODE } from "@/lib/config";
import { getDemoTabs } from "@/lib/demo/store";
import { getSessionContext } from "@/lib/session";

export default async function TabsPage() {
  const session = await getSessionContext();
  if (!session) return null;
  const tabs = DEMO_MODE || session.demo ? getDemoTabs() : [];
  return <TabTracker initialTabs={tabs} />;
}
