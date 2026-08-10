import Link from "next/link";
import { CreateEventForm } from "@/components/events/create-event-form";
import { Badge } from "@/components/ui/badge";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
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
      <Reveal>
        <div>
          <h1 className="font-display text-3xl">Events</h1>
          <p className="mt-2 text-[var(--ink-muted)]">
            Check in, claim shopping items, and keep the circle in sync.
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        <CreateEventForm enabled={!session.demo && !DEMO_MODE} />
      </Reveal>

      <Stagger className="divide-y divide-[var(--line)]">
        {events.map((event) => (
          <StaggerItem key={event.id}>
            <div className="py-5">
              <Link
                href={`/events/${event.id}`}
                className="interactive-glow block rounded-xl hover:bg-[var(--bg-elevated)]/70 hover:px-3 hover:py-2 hover:backdrop-blur-sm"
              >
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
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}
