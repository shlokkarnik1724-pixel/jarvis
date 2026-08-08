import { GamesLobby } from "@/components/games/games-lobby";
import { DEMO_MODE } from "@/lib/config";
import { listGames } from "@/lib/data/circle-queries";
import { getDemoGames } from "@/lib/demo/store";
import { getSessionContext, requireCircleId } from "@/lib/session";

export default async function GamesPage() {
  const session = await getSessionContext();
  if (!session) return null;
  const games =
    DEMO_MODE || session.demo
      ? getDemoGames()
      : await listGames(requireCircleId(session));
  return <GamesLobby initialGames={games} />;
}
