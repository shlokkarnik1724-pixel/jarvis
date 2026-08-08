import { getSession } from "@/lib/auth";
import { readDb } from "@/lib/db";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/AppSidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!session.organizationId) redirect("/onboarding");

  const db = await readDb();
  const org = db.organizations.find((o) => o.id === session.organizationId);

  return (
    <div className="app-shell flex min-h-screen">
      <div className="hidden md:block sticky top-0 h-screen">
        <AppSidebar
          orgName={org?.name || "Workspace"}
          userName={session.name}
        />
      </div>
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="md:hidden">
          <AppSidebar
            orgName={org?.name || "Workspace"}
            userName={session.name}
          />
        </div>
        <main className="flex-1">
          <div className="p-4 md:p-8 max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
