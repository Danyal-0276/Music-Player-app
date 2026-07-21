import { create } from 'zustand';
import type { Track } from '../types';

type PlayerUiState = {
  queue: Track[];
  nowPlayingVisible: boolean;
  contextTrack: Track | null;
  playlistPickTrackIds: string[] | null;
  setNowPlayingVisible: (visible: boolean) => void;
  setContextTrack: (track: Track | null) => void;
  setPlaylistPickTrackIds: (ids: string[] | null) => void;
  setQueue: (tracks: Track[]) => void;
};

export const usePlayerUiStore = create<PlayerUiState>((set) => ({
  queue: [],
  nowPlayingVisible: false,
  contextTrack: null,
  playlistPickTrackIds: null,
  setNowPlayingVisible: (nowPlayingVisible) => set({ nowPlayingVisible }),
  setContextTrack: (contextTrack) => set({ contextTrack }),
  setPlaylistPickTrackIds: (playlistPickTrackIds) => set({ playlistPickTrackIds }),
  setQueue: (queue) => set({ queue }),
}));
