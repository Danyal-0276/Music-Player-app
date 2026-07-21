import { useMemo } from 'react';
import { useIsPlaying } from '@rntp/player';
import { usePlayerUiStore } from '../store/playerUiStore';
import { useLibraryStore } from '../store/libraryStore';
import type { Track } from '../types';

/** Resolve the playing track from our library/queue — not polluted stream metadata. */
export function useNowPlaying() {
  const activeId = usePlayerUiStore((s) => s.activeTrackId);
  const queue = usePlayerUiStore((s) => s.queue);
  const tracks = useLibraryStore((s) => s.tracks);
  const isPlaying = useIsPlaying();

  const track = useMemo<Track | null>(() => {
    if (!activeId) return null;
    return (
      queue.find((t) => t.id === activeId) ??
      tracks.find((t) => t.id === activeId) ??
      null
    );
  }, [activeId, queue, tracks]);

  return {
    activeId,
    isPlaying: !!isPlaying,
    track,
  };
}
