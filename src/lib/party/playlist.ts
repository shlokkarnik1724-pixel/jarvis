import { randomUUID } from "crypto";
import { getDemoMembers } from "@/lib/demo/store";
import { getLabState } from "@/lib/lab/store";

export type PlaylistTrack = {
  id: string;
  title: string;
  artist: string;
  addedBy: string;
  addedById: string;
  vibes: string;
  createdAt: string;
  plays: number;
};

type PlaylistState = {
  tracks: PlaylistTrack[];
  nowPlayingId: string | null;
};

function bucket(circleId: string): PlaylistState {
  const state = getLabState(circleId) as ReturnType<typeof getLabState> & {
    playlist?: PlaylistState;
  };
  if (!state.playlist) {
    const members = getDemoMembers();
    const shlok = members[0];
    const meet = members[1];
    const aryan = members[2];
    state.playlist = {
      nowPlayingId: null,
      tracks: [
        {
          id: randomUUID(),
          title: "Blinding Lights",
          artist: "The Weeknd",
          addedBy: meet?.name ?? "Meet",
          addedById: meet?.userId ?? "x",
          vibes: "night drive · rooftop",
          createdAt: new Date().toISOString(),
          plays: 6,
        },
        {
          id: randomUUID(),
          title: "Apna Bana Le",
          artist: "Arijit Singh",
          addedBy: shlok?.name ?? "Shlok",
          addedById: shlok?.userId ?? "x",
          vibes: "emotional drunk hour",
          createdAt: new Date().toISOString(),
          plays: 4,
        },
        {
          id: randomUUID(),
          title: "After Hours",
          artist: "The Weeknd",
          addedBy: aryan?.name ?? "Aryan",
          addedById: aryan?.userId ?? "x",
          vibes: "main character walk",
          createdAt: new Date().toISOString(),
          plays: 3,
        },
        {
          id: randomUUID(),
          title: "Kesariya",
          artist: "Arijit Singh",
          addedBy: meet?.name ?? "Meet",
          addedById: meet?.userId ?? "x",
          vibes: "group karaoke crime",
          createdAt: new Date().toISOString(),
          plays: 8,
        },
      ],
    };
    state.playlist.nowPlayingId = state.playlist.tracks[0]?.id ?? null;
  }
  return state.playlist;
}

export function listPlaylist(circleId: string) {
  const p = bucket(circleId);
  return {
    tracks: [...p.tracks].sort((a, b) => b.plays - a.plays),
    nowPlayingId: p.nowPlayingId,
  };
}

export function addPlaylistTrack(input: {
  circleId: string;
  title: string;
  artist: string;
  vibes: string;
  addedBy: string;
  addedById: string;
}) {
  const title = input.title.trim();
  const artist = input.artist.trim();
  if (!title || !artist) return { error: "Title and artist required" };
  const track: PlaylistTrack = {
    id: randomUUID(),
    title,
    artist,
    vibes: input.vibes.trim() || "unlabeled chaos",
    addedBy: input.addedBy,
    addedById: input.addedById,
    createdAt: new Date().toISOString(),
    plays: 0,
  };
  const p = bucket(input.circleId);
  p.tracks.unshift(track);
  if (!p.nowPlayingId) p.nowPlayingId = track.id;
  return listPlaylist(input.circleId);
}

export function bumpPlaylistPlay(circleId: string, trackId: string) {
  const p = bucket(circleId);
  const track = p.tracks.find((t) => t.id === trackId);
  if (!track) return { error: "Track not found" };
  track.plays += 1;
  p.nowPlayingId = trackId;
  return listPlaylist(circleId);
}
