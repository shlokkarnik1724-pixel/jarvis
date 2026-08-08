import { redirect } from "next/navigation";
import { CircleShell } from "@/components/layout/circle-shell";
import { getSessionContext } from "@/lib/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionContext();
  if (!session) {
    redirect("/login");
  }

  if (!session.demo && !session.circle) {
    redirect("/onboarding");
  }

  return (
    <CircleShell
      circleName={session.circle?.name ?? "Your Circle"}
      userName={session.membership?.nickname || session.user.name}
      demo={session.demo}
    >
      {children}
    </CircleShell>
  );
}
