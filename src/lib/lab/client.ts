"use client";

async function labGet<T>(feature: string): Promise<T> {
  const response = await fetch(`/api/lab?feature=${encodeURIComponent(feature)}`);
  const json = (await response.json()) as { success: boolean; data?: T; error?: string };
  if (!json.success || json.data === undefined) {
    throw new Error(json.error ?? "Lab request failed");
  }
  return json.data;
}

async function labPost<T>(payload: Record<string, unknown>): Promise<T> {
  const response = await fetch("/api/lab", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = (await response.json()) as { success: boolean; data?: T; error?: string };
  if (!json.success || json.data === undefined) {
    throw new Error(json.error ?? "Lab action failed");
  }
  return json.data;
}

export { labGet, labPost };
