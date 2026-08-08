import { notFound } from "next/navigation";
import { DEMO_MODE } from "@/lib/config";
import { getDemoEvent, getDemoShopping } from "@/lib/demo/store";
import { getSessionContext } from "@/lib/session";
import { formatDate } from "@/lib/utils";
import { EventActions } from "@/components/events/event-actions";
import { Badge } from "@/components/ui/badge";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EventDetailPage({ params }: PageProps) {
  const session = await getSessionContext();
  if (!session) return null;
  const { id } = await params;

  if (!(DEMO_MODE || session.demo)) {
    notFound();
  }

  const event = getDemoEvent(id);
  if (!event) notFound();
  const shopping = getDemoShopping(id);

  return (
    <div className="space-y-8">
      <div>
        <Badge className="mb-3">Event</Badge>
        <h1 className="font-display text-4xl tracking-tight">{event.title}</h1>
        <p className="mt-3 text-[var(--ink-muted)]">
          {formatDate(event.date)}
          {event.location ? ` · ${event.location}` : ""}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {event.tags.map((tag) => (
            <Badge key={tag} className="bg-[var(--bg)] text-[var(--ink-muted)]">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <EventActions
        eventId={event.id}
        initiallyCheckedIn={event.checkedInByMe}
        checkinCount={event.checkinCount}
        shopping={shopping}
      />
    </div>
  );
}
