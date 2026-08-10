"use client";

import { FormEvent, useEffect, useRef, useState, useTransition } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { toast } from "@/lib/store/toast-store";
import type { ChatMessageView, MemberPartyProfile } from "@/lib/types";

export function GroupChatClient({ currentUserId }: { currentUserId: string }) {
  const [messages, setMessages] = useState<ChatMessageView[]>([]);
  const [draft, setDraft] = useState("");
  const [profile, setProfile] = useState<MemberPartyProfile | null>(null);
  const [pending, startTransition] = useTransition();
  const scroller = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    startTransition(async () => {
      const response = await fetch("/api/chat");
      const json = (await response.json()) as {
        success: boolean;
        data?: { messages: ChatMessageView[] };
      };
      if (json.success && json.data) setMessages(json.data.messages);
    });
  }, []);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  function openProfile(userId: string) {
    startTransition(async () => {
      const response = await fetch(`/api/chat?profile=${encodeURIComponent(userId)}`);
      const json = (await response.json()) as {
        success: boolean;
        data?: MemberPartyProfile;
        error?: string;
      };
      if (json.success && json.data) {
        setProfile(json.data);
        return;
      }
      toast(json.error ?? "Couldn’t load profile", { tone: "error" });
    });
  }

  function send(event: FormEvent) {
    event.preventDefault();
    const body = draft.trim();
    if (!body) return;
    startTransition(async () => {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const json = (await response.json()) as {
        success: boolean;
        data?: ChatMessageView;
        error?: string;
      };
      if (json.success && json.data) {
        setMessages((prev) => [...prev, json.data!]);
        setDraft("");
        return;
      }
      toast(json.error ?? "Couldn’t send", { tone: "error" });
    });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[1.75rem] border border-white/30 bg-gradient-to-br from-[#1a120c] via-[#241810] to-[#0f1a16] p-4 text-white shadow-2xl md:p-5">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="font-island text-3xl font-extrabold tracking-tight">💬 The Group Chat</p>
            <p className="mt-1 text-sm text-white/75">
              shady · adult · Gen Z · tap a name for their party dossier
            </p>
          </div>
          <span className="rounded-full border border-amber-200/40 bg-amber-400/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-amber-100">
            live chaos
          </span>
        </div>

        <div
          ref={scroller}
          className="h-[min(62vh,32rem)] space-y-3 overflow-y-auto rounded-[1.35rem] border border-white/10 bg-black/35 p-3 backdrop-blur-md md:p-4"
        >
          {messages.map((msg) => {
            const mine = msg.userId === currentUserId;
            return (
              <motion.div
                key={msg.id}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
                initial={reduced ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-lg md:max-w-[70%] ${
                    mine
                      ? "rounded-br-md bg-amber-500/90 text-[#1a1208]"
                      : "rounded-bl-md border border-white/15 bg-white/10 text-white"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => openProfile(msg.userId)}
                    className={`mb-1 text-left text-[11px] font-bold uppercase tracking-wide underline-offset-2 hover:underline ${
                      mine ? "text-[#3d2a12]/90" : "text-amber-100/90"
                    }`}
                  >
                    {msg.nickname || msg.name}
                  </button>
                  <p className="text-[15px] leading-snug">{msg.body}</p>
                  <p className={`mt-1 text-[10px] ${mine ? "text-[#3d2a12]/70" : "text-white/45"}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <form onSubmit={send} className="mt-3 flex gap-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="drop something unhinged…"
            className="border-white/20 bg-black/40 text-white placeholder:text-white/40"
          />
          <Button type="submit" disabled={pending || !draft.trim()}>
            Send
          </Button>
        </form>
      </div>

      <AnimatePresence>
        {profile ? (
          <motion.div
            className="fixed inset-0 z-[120] flex items-end justify-center bg-black/55 p-3 sm:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setProfile(null)}
          >
            <motion.div
              className="w-full max-w-md rounded-[1.75rem] border border-white/25 bg-[#f7faf8] p-5 text-[var(--ink)] shadow-2xl"
              initial={reduced ? false : { y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-island text-2xl font-extrabold">{profile.name}</p>
                  <p className="text-sm text-[var(--ink-muted)]">{profile.nickname}</p>
                </div>
                <Button size="sm" variant="secondary" onClick={() => setProfile(null)}>
                  Close
                </Button>
              </div>

              <div className="mt-4 grid gap-3">
                <ProfileStat label="Drink mode" value={profile.drinkLabel} />
                <ProfileStat
                  label="Sutta count"
                  value={`${profile.cigarettes} · ${profile.cigTitle}`}
                />
                <ProfileStat
                  label="Greens"
                  value={`${profile.greens} · ${profile.greenTitle}`}
                />
                <ProfileStat
                  label="Tab energy"
                  value={`${formatCurrency(profile.tabNet)} · ${profile.brokeTitle}`}
                />
                <ProfileStat
                  label="Next hang RSVP"
                  value={
                    profile.nextEventTitle
                      ? `${profile.nextEventRsvp ?? "no vote"} · ${profile.nextEventTitle}`
                      : "no upcoming event"
                  }
                />
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function ProfileStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white/80 px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink-muted)]">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold leading-snug">{value}</p>
    </div>
  );
}
