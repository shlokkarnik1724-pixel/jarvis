import { Suspense } from "react";
import { GameRoom } from "@/components/games/game-room";
import { getSessionContext } from "@/lib/session";

interface PageProps {
  params: Promise<{ game_slug: string }>;
}

export default async function GameSlugPage({ params }: PageProps) {
  const session = await getSessionContext();
  if (!session) return null;
  const { game_slug } = await params;

  return (
    <Suspense fallback={<p className="text-[var(--ink-muted)]">Loading game…</p>}>
      <GameRoom
        gameSlug={game_slug}
        userId={session.user.id}
        userName={session.membership?.nickname || session.user.name}
      />
    </Suspense>
  );
}
