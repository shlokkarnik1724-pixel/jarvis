import Link from "next/link";
import { CreateEventForm } from "@/components/events/create-event-form";
import { Badge } from "@/components/ui/badge";
import { DEMO_MODE } from "@/lib/config";
import { listEvents } from "@/lib/data/circle-queries";
import { getDemoEvents } from "@/lib/demo/store";
import { getSessionContext, requireCircleId } from "@/lib/session";
import { formatDate } from "@/lib/utils";

export default async function EventsPage() {
  const session = await getSessionContext();
  if (!session) return null;

  const events =
    DEMO_MODE || session.demo
      ? getDemoEvents()
      : await listEvents(requireCircleId(session), session.user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Events</h1>
        <p className="mt-2 text-[var(--ink-muted)]">
          Check in, claim shopping items, and keep the circle in sync.
        </p>
      </div>

      <CreateEventForm enabled={!session.demo && !DEMO_MODE} />

      <ul className="divide-y divide-[var(--line)]">
        {events.map((event) => (
          <li key={event.id} className="py-5">
            <Link href={`/events/${event.id}`} className="block hover:opacity-90">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-medium">{event.title}</h2>
                  <p className="mt-1 text-sm text-[var(--ink-muted)]">
                    {formatDate(event.date)}
                    {event.location ? ` · ${event.location}` : ""}
                  </p>
                </div>
                <Badge>
                  {event.claimedCount}/{event.shoppingCount} claimed
                </Badge>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
