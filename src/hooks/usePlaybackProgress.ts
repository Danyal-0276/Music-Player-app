import { useCallback, useEffect, useRef, useState } from 'react';
import TrackPlayer from '@rntp/player';
import { usePlayerUiStore } from '../store/playerUiStore';

export type PlaybackProgress = {
  position: number;
  duration: number;
  seekTo: (seconds: number) => void;
  setScrubbing: (scrubbing: boolean) => void;
};

/**
 * Now Playing progress UI bound to native playback (via playerUiStore + seek).
 * Store is filled by PlayerActiveTrackSync from getProgress / PlaybackProgressUpdated.
 */
export function usePlaybackProgress(
  mediaId: string | null,
  trackDurationSec = 0
): PlaybackProgress {
  const storePosition = usePlayerUiStore((s) => s.playbackPosition);
  const storeDuration = usePlayerUiStore((s) => s.playbackDuration);
  const setPlaybackProgress = usePlayerUiStore((s) => s.setPlaybackProgress);
  const activeTrackId = usePlayerUiStore((s) => s.activeTrackId);

  const [scrubbing, setScrubbingState] = useState(false);
  const [optimisticPosition, setOptimisticPosition] = useState<number | null>(null);
  const ignoreZeroUntilRef = useRef(0);
  const scrubbingRef = useRef(false);

  const duration = Math.max(storeDuration, trackDurationSec, 0);

  // While scrubbing/seeking, show optimistic position; otherwise trust the store.
  const position = (() => {
    if (scrubbing && optimisticPosition != null) return optimisticPosition;
    if (optimisticPosition != null && Date.now() < ignoreZeroUntilRef.current) {
      // Prefer optimistic until native catches up after seek.
      if (storePosition < 0.05 && optimisticPosition > 0.25) return optimisticPosition;
      // Native moved near our seek target — clear optimistic.
      if (Math.abs(storePosition - optimisticPosition) < 1.25) {
        return storePosition;
      }
      return optimisticPosition;
    }
    return storePosition;
  })();

  // Clear optimistic when native progress aligns, or timeout.
  useEffect(() => {
    if (optimisticPosition == null) return;
    if (Math.abs(storePosition - optimisticPosition) < 1.25) {
      setOptimisticPosition(null);
      return;
    }
    if (Date.now() >= ignoreZeroUntilRef.current && storePosition > 0.05) {
      setOptimisticPosition(null);
    }
  }, [storePosition, optimisticPosition]);

  // Song change: drop optimistic UI (store already resets position via setActiveTrackId).
  useEffect(() => {
    setOptimisticPosition(null);
    scrubbingRef.current = false;
    setScrubbingState(false);
    ignoreZeroUntilRef.current = 0;
    if (trackDurationSec > 0 && storeDuration <= 0) {
      setPlaybackProgress(0, trackDurationSec);
    }
  }, [mediaId, activeTrackId, trackDurationSec, storeDuration, setPlaybackProgress]);

  const setScrubbing = useCallback((value: boolean) => {
    scrubbingRef.current = value;
    setScrubbingState(value);
  }, []);

  const seekTo = useCallback(
    (seconds: number) => {
      const max = Math.max(duration, trackDurationSec, 0);
      const clamped = Math.max(0, max > 0 ? Math.min(seconds, max) : seconds);
      setOptimisticPosition(clamped);
      setPlaybackProgress(clamped, max > 0 ? max : trackDurationSec);
      if (clamped > 0.25) {
        ignoreZeroUntilRef.current = Date.now() + 1000;
      }
      try {
        TrackPlayer.seekTo(clamped);
      } catch {
        // Native may not be ready.
      }
    },
    [duration, trackDurationSec, setPlaybackProgress]
  );

  return {
    position: Math.min(Math.max(position, 0), duration > 0 ? duration : position),
    duration,
    seekTo,
    setScrubbing,
  };
}
