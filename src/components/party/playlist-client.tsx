"use client";

import { useEffect, useState, useTransition } from "react";
import { IslandCard } from "@/components/islands/island-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { partyGet, partyPost } from "@/lib/party/client";
import { playSound } from "@/lib/sound/sfx";
import { pushCircleNotice } from "@/components/party/notification-center";
import { toast } from "@/lib/store/toast-store";

type Track = {
  id: string;
  title: string;
  artist: string;
  addedBy: string;
  vibes: string;
  plays: number;
};

type PlaylistPayload = {
  tracks: Track[];
  nowPlayingId: string | null;
};

export function PlaylistClient() {
  const [data, setData] = useState<PlaylistPayload | null>(null);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [vibes, setVibes] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      setData(await partyGet<PlaylistPayload>("playlist"));
    });
  }, []);

  function add() {
    startTransition(async () => {
      playSound("spidey");
      try {
        const next = await partyPost<PlaylistPayload>({
          feature: "playlist",
          action: "add",
          title,
          artist,
          vibes,
        });
        setData(next);
        setTitle("");
        setArtist("");
        setVibes("");
        pushCircleNotice({
          title: "Track added to Circle aux",
          body: `${title} — ${artist}`,
        });
        toast("Added to playlist", { tone: "success" });
      } catch (error) {
        playSound("wrong");
        toast("Couldn’t add track", {
          description: error instanceof Error ? error.message : undefined,
          tone: "error",
        });
      }
    });
  }

  function play(trackId: string, label: string) {
    startTransition(async () => {
      playSound("cheers");
      const next = await partyPost<PlaylistPayload>({
        feature: "playlist",
        action: "play",
        trackId,
      });
      setData(next);
      toast("Now playing", { description: label, tone: "success" });
    });
  }

  const now = data?.tracks.find((t) => t.id === data.nowPlayingId);

  return (
    <div className="space-y-6">
      <IslandCard emoji="🎧" title="Playlist Tracker" accent="rgba(232,168,124,0.45)">
        <p className="text-sm text-[var(--ink-muted)]">
          Track the circle aux — who added what, what’s playing, vibes tagged.
        </p>
        {now ? (
          <p className="mt-2 rounded-xl bg-[var(--accent-soft)] px-3 py-2 text-sm font-semibold text-[var(--ink)]">
            ▶ Now: {now.title} — {now.artist}
          </p>
        ) : null}
      </IslandCard>

      <div className="grid gap-2 sm:grid-cols-3">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Song title"
          className="bg-white text-[var(--ink)]"
        />
        <Input
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          placeholder="Artist"
          className="bg-white text-[var(--ink)]"
        />
        <Input
          value={vibes}
          onChange={(e) => setVibes(e.target.value)}
          placeholder="Vibe tag"
          className="bg-white text-[var(--ink)]"
        />
      </div>
      <Button disabled={pending || !title.trim() || !artist.trim()} onClick={add}>
        Add to aux
      </Button>

      <ul className="space-y-3">
        {(data?.tracks ?? []).map((track) => (
          <li
            key={track.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-[var(--ink)] shadow-sm"
          >
            <div>
              <p className="font-semibold">
                {track.title}{" "}
                <span className="text-[var(--ink-muted)]">— {track.artist}</span>
              </p>
              <p className="text-xs text-[var(--ink-muted)]">
                added by {track.addedBy} · {track.vibes} · {track.plays} plays
              </p>
            </div>
            <Button
              size="sm"
              variant="secondary"
              disabled={pending}
              onClick={() => play(track.id, `${track.title} — ${track.artist}`)}
            >
              Play
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
