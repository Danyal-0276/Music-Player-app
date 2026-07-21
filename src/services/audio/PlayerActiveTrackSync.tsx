import { useEffect } from 'react';
import TrackPlayer, { Event } from '@rntp/player';
import { usePlayerUiStore } from '../../store/playerUiStore';

function normalize(position: number, duration: number, fallbackDuration = 0) {
  let pos = Number(position);
  let dur = Number(duration);
  if (!Number.isFinite(pos) || pos < 0) pos = 0;
  if (!Number.isFinite(dur) || dur < 0) dur = 0;

  if (fallbackDuration > 0 && pos > fallbackDuration * 2 && pos > 1000) pos /= 1000;
  if (fallbackDuration > 0 && dur > fallbackDuration * 2 && dur > 1000) dur /= 1000;
  if (dur > 86400) dur = fallbackDuration;
  if (pos > 86400) pos = 0;
  if (dur <= 0 && fallbackDuration > 0) dur = fallbackDuration;

  return { position: pos, duration: dur };
}

/**
 * Keeps activeTrackId + playback progress synced from the native player.
 */
export function PlayerActiveTrackSync() {
  const setActiveTrackId = usePlayerUiStore((s) => s.setActiveTrackId);
  const setPlaybackProgress = usePlayerUiStore((s) => s.setPlaybackProgress);

  useEffect(() => {
    const applyTrackId = (id: string | null | undefined) => {
      if (!id) return;
      if (usePlayerUiStore.getState().activeTrackId !== id) {
        setActiveTrackId(id);
      }
    };

    const publishProgress = (position: number, duration: number, mediaId?: string) => {
      const state = usePlayerUiStore.getState();
      if (mediaId && state.activeTrackId && mediaId !== state.activeTrackId) return;

      const track =
        state.queue.find((t) => t.id === (mediaId ?? state.activeTrackId)) ?? null;
      const fallback = track?.durationMs ? track.durationMs / 1000 : state.playbackDuration;
      const n = normalize(position, duration, fallback);
      setPlaybackProgress(n.position, n.duration);
    };

    const poll = () => {
      try {
        const item = TrackPlayer.getActiveMediaItem();
        applyTrackId(item?.mediaId);
        const progress = TrackPlayer.getProgress();
        publishProgress(progress.position, progress.duration, item?.mediaId);
      } catch {
        // Player not ready.
      }
    };

    applyTrackId(TrackPlayer.getActiveMediaItem()?.mediaId);
    poll();

    const transitionSub = TrackPlayer.addEventListener(
      Event.MediaItemTransition,
      (event) => {
        applyTrackId(event.item?.mediaId ?? TrackPlayer.getActiveMediaItem()?.mediaId);
        try {
          const progress = TrackPlayer.getProgress();
          publishProgress(
            progress.position,
            progress.duration,
            event.item?.mediaId
          );
        } catch {
          setPlaybackProgress(0, 0);
        }
      }
    );

    const progressSub = TrackPlayer.addEventListener(
      Event.PlaybackProgressUpdated,
      (event) => {
        applyTrackId(event.mediaId);
        publishProgress(event.position, event.duration, event.mediaId);
      }
    );

    const metadataSub = TrackPlayer.addEventListener(
      Event.MediaMetadataChanged,
      () => {
        applyTrackId(TrackPlayer.getActiveMediaItem()?.mediaId);
        poll();
      }
    );

    // Native getProgress + progressSync events; poll as a backup while app is open.
    const interval = setInterval(poll, 250);

    return () => {
      transitionSub.remove();
      progressSub.remove();
      metadataSub.remove();
      clearInterval(interval);
    };
  }, [setActiveTrackId, setPlaybackProgress]);

  return null;
}
