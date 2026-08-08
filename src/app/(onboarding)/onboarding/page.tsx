import { redirect } from "next/navigation";
import { OnboardingClient } from "@/components/onboarding/onboarding-client";
import { getSessionContext } from "@/lib/session";

export default async function OnboardingPage() {
  const session = await getSessionContext();
  if (!session) redirect("/login");
  if (session.circle) redirect("/dashboard");

  return <OnboardingClient userName={session.user.name} />;
}
