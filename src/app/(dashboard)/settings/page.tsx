import { MembersManager } from "@/components/settings/members-manager";
import { DEMO_MODE } from "@/lib/config";
import { getDemoMembers } from "@/lib/demo/store";
import { getSessionContext } from "@/lib/session";
import { Badge } from "@/components/ui/badge";

export default async function SettingsPage() {
  const session = await getSessionContext();
  if (!session) return null;
  const members = DEMO_MODE || session.demo ? getDemoMembers() : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl">Settings</h1>
        <p className="mt-2 text-[var(--ink-muted)]">
          Manage circle membership, roles, and nickname tagging.
        </p>
      </div>

      <section className="border-y border-[var(--line)] py-6">
        <h2 className="text-lg font-medium">Circle</h2>
        <p className="mt-2 text-[var(--ink-muted)]">
          {session.circle?.name ?? "Unassigned"}
        </p>
        {session.circle?.inviteCode ? (
          <p className="mt-3 text-sm">
            Invite code:{" "}
            <Badge className="ml-1 font-mono">{session.circle.inviteCode}</Badge>
          </p>
        ) : null}
      </section>

      <MembersManager initialMembers={members} />
    </div>
  );
}
