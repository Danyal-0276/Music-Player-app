import { create } from 'zustand';
import type { Track } from '../types';

type PlayerUiState = {
  queue: Track[];
  activeTrackId: string | null;
  /** Native playback position in seconds (source of truth for UI clocks). */
  playbackPosition: number;
  /** Native / known duration in seconds. */
  playbackDuration: number;
  nowPlayingVisible: boolean;
  contextTrack: Track | null;
  playlistPickTrackIds: string[] | null;
  setNowPlayingVisible: (visible: boolean) => void;
  setContextTrack: (track: Track | null) => void;
  setPlaylistPickTrackIds: (ids: string[] | null) => void;
  setQueue: (tracks: Track[]) => void;
  setActiveTrackId: (id: string | null) => void;
  setPlaybackProgress: (position: number, duration: number) => void;
  resetPlaybackProgress: () => void;
};

export const usePlayerUiStore = create<PlayerUiState>((set) => ({
  queue: [],
  activeTrackId: null,
  playbackPosition: 0,
  playbackDuration: 0,
  nowPlayingVisible: false,
  contextTrack: null,
  playlistPickTrackIds: null,
  setNowPlayingVisible: (nowPlayingVisible) => set({ nowPlayingVisible }),
  setContextTrack: (contextTrack) => set({ contextTrack }),
  setPlaylistPickTrackIds: (playlistPickTrackIds) => set({ playlistPickTrackIds }),
  setQueue: (queue) => set({ queue }),
  setActiveTrackId: (activeTrackId) =>
    set((state) => {
      const track = state.queue.find((t) => t.id === activeTrackId);
      return {
        activeTrackId,
        playbackPosition: 0,
        playbackDuration: track?.durationMs ? track.durationMs / 1000 : 0,
      };
    }),
  setPlaybackProgress: (playbackPosition, playbackDuration) =>
    set((state) => ({
      playbackPosition,
      playbackDuration:
        playbackDuration > 0 ? playbackDuration : state.playbackDuration,
    })),
  resetPlaybackProgress: () => set({ playbackPosition: 0, playbackDuration: 0 }),
}));
