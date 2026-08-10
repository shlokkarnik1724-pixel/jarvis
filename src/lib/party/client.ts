"use client";

async function partyGet<T>(feature: string): Promise<T> {
  const response = await fetch(`/api/party?feature=${encodeURIComponent(feature)}`);
  const json = (await response.json()) as { success: boolean; data?: T; error?: string };
  if (!json.success || json.data === undefined) {
    throw new Error(json.error ?? "Party request failed");
  }
  return json.data;
}

async function partyPost<T>(payload: Record<string, unknown>): Promise<T> {
  const response = await fetch("/api/party", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = (await response.json()) as { success: boolean; data?: T; error?: string };
  if (!json.success || json.data === undefined) {
    throw new Error(json.error ?? "Party action failed");
  }
  return json.data;
}

export { partyGet, partyPost };
