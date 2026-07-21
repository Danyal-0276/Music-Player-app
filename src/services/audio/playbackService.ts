import TrackPlayer, { Event } from '@rntp/player';
import { useLibraryStore } from '../../store/libraryStore';

/**
 * Android background remote events. With native handling, most controls
 * are handled by the player service; this still records plays on track changes.
 */
TrackPlayer.registerBackgroundEventHandler(() => async (event) => {
  if (event.type === Event.MediaItemTransition && event.item?.mediaId) {
    try {
      const { usePlayerUiStore } = await import('../../store/playerUiStore');
      usePlayerUiStore.getState().setActiveTrackId(event.item.mediaId);
      await useLibraryStore.getState().recordPlay(event.item.mediaId);
    } catch {
      // ignore in headless context
    }
  }
});
