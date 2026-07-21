import { useEffect } from 'react';
import TrackPlayer, { Event } from '@rntp/player';
import { usePlayerUiStore } from '../../store/playerUiStore';

/**
 * Keeps `activeTrackId` in sync even when native metadata events are noisy
 * or stream metadata would otherwise overwrite the UI.
 */
export function PlayerActiveTrackSync() {
  const setActiveTrackId = usePlayerUiStore((s) => s.setActiveTrackId);

  useEffect(() => {
    const apply = (id: string | null | undefined) => {
      if (!id) return;
      const current = usePlayerUiStore.getState().activeTrackId;
      if (current !== id) setActiveTrackId(id);
    };

    apply(TrackPlayer.getActiveMediaItem()?.mediaId);

    const transitionSub = TrackPlayer.addEventListener(
      Event.MediaItemTransition,
      (event) => {
        apply(event.item?.mediaId ?? TrackPlayer.getActiveMediaItem()?.mediaId);
      }
    );

    const progressSub = TrackPlayer.addEventListener(
      Event.PlaybackProgressUpdated,
      (event) => {
        apply(event.mediaId);
      }
    );

    const metadataSub = TrackPlayer.addEventListener(
      Event.MediaMetadataChanged,
      () => {
        apply(TrackPlayer.getActiveMediaItem()?.mediaId);
      }
    );

    const interval = setInterval(() => {
      apply(TrackPlayer.getActiveMediaItem()?.mediaId);
    }, 1000);

    return () => {
      transitionSub.remove();
      progressSub.remove();
      metadataSub.remove();
      clearInterval(interval);
    };
  }, [setActiveTrackId]);

  return null;
}
