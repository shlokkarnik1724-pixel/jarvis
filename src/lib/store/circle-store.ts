import { create } from "zustand";
import type { VibeSuggestion } from "@/lib/fun/vibe";
import type { GameSessionView } from "@/lib/types";

interface CircleUiState {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  activeGame: GameSessionView | null;
  setActiveGame: (game: GameSessionView | null) => void;
  vibeSuggestions: VibeSuggestion[];
  setVibeSuggestions: (items: VibeSuggestion[]) => void;
}

export const useCircleStore = create<CircleUiState>((set) => ({
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  activeGame: null,
  setActiveGame: (game) => set({ activeGame: game }),
  vibeSuggestions: [],
  setVibeSuggestions: (items) => set({ vibeSuggestions: items }),
}));
