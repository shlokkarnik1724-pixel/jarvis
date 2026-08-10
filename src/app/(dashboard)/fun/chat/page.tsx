import { GroupChatClient } from "@/components/party/group-chat-client";
import { getSessionContext } from "@/lib/session";

export default async function GroupChatPage() {
  const session = await getSessionContext();
  if (!session) return null;
  return <GroupChatClient currentUserId={session.user.id} />;
}
