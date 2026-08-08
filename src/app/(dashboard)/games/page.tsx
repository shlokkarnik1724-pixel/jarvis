import { GamesLobby } from "@/components/games/games-lobby";
import { DEMO_MODE } from "@/lib/config";
import { getDemoGames } from "@/lib/demo/store";
import { getSessionContext } from "@/lib/session";

export default async function GamesPage() {
  const session = await getSessionContext();
  if (!session) return null;
  const games = DEMO_MODE || session.demo ? getDemoGames() : [];
  return <GamesLobby initialGames={games} />;
}
