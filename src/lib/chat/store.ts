import { randomUUID } from "crypto";
import {
  DEMO_ADITYA_ID,
  DEMO_ARYAN_ID,
  DEMO_CIRCLE_ID,
  DEMO_DARSHAN_ID,
  DEMO_KEDAR_ID,
  DEMO_KRISHNA_ID,
  DEMO_MEET_ID,
  DEMO_USER_ID,
  getDemoEvents,
  getDemoMembers,
  getDemoTabs,
} from "@/lib/demo/store";
import { getLabState } from "@/lib/lab/store";
import {
  cigTitle,
  getBrokeTitle,
  greenTitle,
  listDrinkTiers,
  listSmokes,
} from "@/lib/party/systems";
import { computeBalances } from "@/lib/utils/settlements";
import type { ChatMessageView, MemberPartyProfile } from "@/lib/types";

type ChatState = {
  messages: ChatMessageView[];
};

function chatBucket(circleId: string): ChatState {
  const state = getLabState(circleId) as ReturnType<typeof getLabState> & {
    chat?: ChatState;
  };
  if (!state.chat) {
    state.chat = { messages: seedMessages(circleId) };
  }
  return state.chat;
}

function seedMessages(circleId: string): ChatMessageView[] {
  const now = Date.now();
  const rows: Array<Omit<ChatMessageView, "circleId"> & { circleId?: string }> = [
    {
      id: randomUUID(),
      userId: DEMO_MEET_ID,
      name: "Meet Shinde",
      nickname: "MIT",
      body: "bro who’s bringing the sutta pack 😭",
      createdAt: new Date(now - 1000 * 60 * 42).toISOString(),
    },
    {
      id: randomUUID(),
      userId: DEMO_ARYAN_ID,
      name: "Aryan Revankar",
      nickname: "Rev",
      body: "not me i’m already in debt web jail",
      createdAt: new Date(now - 1000 * 60 * 40).toISOString(),
    },
    {
      id: randomUUID(),
      userId: DEMO_USER_ID,
      name: "Shlok Karnik",
      nickname: "Main Character",
      body: "Kedar hosting. RSVP in the event. Don’t ghost.",
      createdAt: new Date(now - 1000 * 60 * 38).toISOString(),
    },
    {
      id: randomUUID(),
      userId: DEMO_KEDAR_ID,
      name: "Kedar Prabhu",
      nickname: "KP",
      body: "terrace is open. bring ice + your chaos.",
      createdAt: new Date(now - 1000 * 60 * 35).toISOString(),
    },
    {
      id: randomUUID(),
      userId: DEMO_ADITYA_ID,
      name: "Aditya Khalil",
      nickname: "Khalil",
      body: "Darshan if you play that one song again i’m leaving",
      createdAt: new Date(now - 1000 * 60 * 30).toISOString(),
    },
    {
      id: randomUUID(),
      userId: DEMO_DARSHAN_ID,
      name: "Darshan",
      nickname: "Darsh",
      body: "that song SLAPS. cope.",
      createdAt: new Date(now - 1000 * 60 * 28).toISOString(),
    },
    {
      id: randomUUID(),
      userId: DEMO_KRISHNA_ID,
      name: "Krishna Hemgude",
      nickname: "Hemgude",
      body: "maggi run at 2am is non-negotiable 🍜",
      createdAt: new Date(now - 1000 * 60 * 22).toISOString(),
    },
    {
      id: randomUUID(),
      userId: DEMO_MEET_ID,
      name: "Meet Shinde",
      nickname: "MIT",
      body: "tap my name if you wanna see my drink stats 👀",
      createdAt: new Date(now - 1000 * 60 * 12).toISOString(),
    },
  ];

  return rows.map((row) => ({
    ...row,
    circleId: circleId || DEMO_CIRCLE_ID,
  }));
}

export function listChatMessages(circleId: string): ChatMessageView[] {
  return [...chatBucket(circleId).messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

export function postChatMessage(input: {
  circleId: string;
  userId: string;
  name: string;
  nickname: string | null;
  body: string;
}): ChatMessageView | { error: string } {
  const text = input.body.trim();
  if (!text) return { error: "Say something." };
  if (text.length > 500) return { error: "Too long — keep it chatty." };
  const entry: ChatMessageView = {
    id: randomUUID(),
    circleId: input.circleId,
    userId: input.userId,
    name: input.name,
    nickname: input.nickname,
    body: text,
    createdAt: new Date().toISOString(),
  };
  chatBucket(input.circleId).messages.push(entry);
  return entry;
}

export function getMemberPartyProfile(
  circleId: string,
  userId: string
): MemberPartyProfile | null {
  const member = getDemoMembers().find((m) => m.userId === userId);
  if (!member) return null;

  const drink =
    listDrinkTiers(circleId).find((t) => t.userId === userId) ?? {
      label: "🧢 Sober Cap",
      level: 0,
    };
  const smoke = listSmokes(circleId).find((s) => s.userId === userId);
  const tabs = getDemoTabs();
  const balance =
    computeBalances(
      tabs.map((t) => ({
        payerId: t.payerId,
        payerName: t.payerName,
        amount: t.amount,
      }))
    ).find((b) => b.userId === userId)?.net ?? 0;

  const upcoming = [...getDemoEvents()].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )[0];
  const rsvp = upcoming?.rsvps.find((r) => r.userId === userId)?.status ?? null;

  return {
    userId: member.userId,
    name: member.name,
    nickname: member.nickname,
    drinkLabel: drink.label,
    drinkLevel: drink.level,
    cigarettes: smoke?.cigarettes ?? 0,
    cigTitle: smoke?.cigTitle ?? cigTitle(0),
    greens: smoke?.greens ?? 0,
    greenTitle: smoke?.greenTitle ?? greenTitle(0),
    tabNet: balance,
    brokeTitle: getBrokeTitle(balance),
    nextEventRsvp: rsvp,
    nextEventTitle: upcoming?.title ?? null,
  };
}
