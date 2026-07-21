import { useActiveMediaItem, useIsPlaying } from '@rntp/player';

/** Stable now-playing ids for list highlighting (avoids per-row player subscriptions). */
export function useNowPlaying() {
  const item = useActiveMediaItem();
  const playing = useIsPlaying();
  return {
    activeId: item?.mediaId ?? null,
    isPlaying: !!playing,
  };
}
