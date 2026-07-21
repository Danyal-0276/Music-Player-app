import { create } from 'zustand';
import type { Track } from '../types';

type PlayerUiState = {
  queue: Track[];
  nowPlayingVisible: boolean;
  contextTrack: Track | null;
  setNowPlayingVisible: (visible: boolean) => void;
  setContextTrack: (track: Track | null) => void;
  setQueue: (tracks: Track[]) => void;
};

export const usePlayerUiStore = create<PlayerUiState>((set) => ({
  queue: [],
  nowPlayingVisible: false,
  contextTrack: null,
  setNowPlayingVisible: (nowPlayingVisible) => set({ nowPlayingVisible }),
  setContextTrack: (contextTrack) => set({ contextTrack }),
  setQueue: (queue) => set({ queue }),
}));
