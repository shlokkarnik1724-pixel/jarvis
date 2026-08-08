import { notFound } from "next/navigation";
import { EventActions } from "@/components/events/event-actions";
import { Badge } from "@/components/ui/badge";
import { DEMO_MODE } from "@/lib/config";
import { getEventDetail } from "@/lib/data/circle-queries";
import { getDemoEvent, getDemoShopping } from "@/lib/demo/store";
import { getSessionContext } from "@/lib/session";
import { formatDate } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EventDetailPage({ params }: PageProps) {
  const session = await getSessionContext();
  if (!session) return null;
  const { id } = await params;

  const detail =
    DEMO_MODE || session.demo
      ? (() => {
          const event = getDemoEvent(id);
          if (!event) return null;
          return { event, shopping: getDemoShopping(id) };
        })()
      : await getEventDetail(id, session.user.id);

  if (!detail) notFound();

  return (
    <div className="space-y-8">
      <div>
        <Badge className="mb-3">Event</Badge>
        <h1 className="font-display text-4xl tracking-tight">{detail.event.title}</h1>
        <p className="mt-3 text-[var(--ink-muted)]">
          {formatDate(detail.event.date)}
          {detail.event.location ? ` · ${detail.event.location}` : ""}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {detail.event.tags.map((tag) => (
            <Badge key={tag} className="bg-[var(--bg)] text-[var(--ink-muted)]">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <EventActions
        eventId={detail.event.id}
        initiallyCheckedIn={detail.event.checkedInByMe}
        checkinCount={detail.event.checkinCount}
        shopping={detail.shopping}
        canAddItems={!session.demo && !DEMO_MODE}
      />
    </div>
  );
}
