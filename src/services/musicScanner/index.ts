import { getTracksAsync, type Track as NativeTrack } from '@nodefinity/react-native-music-library';
import type { Track } from '../../types';

function mapNativeTrack(item: NativeTrack): Track {
  const durationMs = Math.round((item.duration ?? 0) * 1000);
  const title = item.title?.trim() || 'Unknown Title';
  return {
    id: String(item.id),
    uri: item.url,
    title,
    artist: item.artist?.trim() || 'Unknown Artist',
    album: item.album?.trim() || 'Unknown Album',
    albumId: item.album ? `${item.album}::${item.artist}` : null,
    artistId: item.artist || null,
    durationMs,
    artworkUri: item.artwork ?? null,
    fileSize: item.fileSize ?? null,
    dateAdded: item.createdAt ? Number(item.createdAt) : null,
    dateModified: item.modifiedAt ? Number(item.modifiedAt) : null,
    playCount: 0,
    lastPlayedAt: null,
    isFavorite: false,
  };
}

export async function scanDeviceMusic(
  onProgress?: (message: string) => void
): Promise<Track[]> {
  const all: Track[] = [];
  let after: string | undefined;
  let page = 0;
  const pageSize = 100;

  do {
    page += 1;
    onProgress?.(`Scanning music… page ${page}`);
    const result = await getTracksAsync({
      first: pageSize,
      after,
      sortBy: ['title', true],
    });

    for (const item of result.items) {
      const mapped = mapNativeTrack(item);
      if (mapped.uri) {
        all.push(mapped);
      }
    }

    after = result.hasNextPage ? result.endCursor : undefined;
  } while (after);

  onProgress?.(`Found ${all.length} songs`);
  return all;
}
