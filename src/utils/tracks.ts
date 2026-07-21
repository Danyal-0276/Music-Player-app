import type { LibraryFilter, LibrarySortKey, SortDir, Track } from '../types';
import { useSettingsStore } from '../store/settingsStore';

export function formatDuration(ms: number): string {
  if (!ms || ms < 0) return '0:00';
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function formatDurationSeconds(seconds: number): string {
  return formatDuration(Math.floor(seconds * 1000));
}

/** Clock style used on Now Playing: `00:00`. */
export function formatClock(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  const total = Math.floor(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function filterAndSortTracks(
  tracks: Track[],
  options: {
    filter: LibraryFilter;
    searchQuery: string;
    sort?: LibrarySortKey;
    sortDir?: SortDir;
  }
): Track[] {
  const settings = useSettingsStore.getState().settings;
  const sort = options.sort ?? settings.librarySort;
  const sortDir = options.sortDir ?? settings.librarySortDir;
  let result = [...tracks];

  if (settings.ignoreShortTracks) {
    result = result.filter((t) => t.durationMs >= settings.minTrackDurationMs);
  }

  switch (options.filter) {
    case 'favorites':
      result = result.filter((t) => t.isFavorite);
      break;
    case 'recentlyAdded':
      result = result
        .filter((t) => t.dateAdded != null)
        .sort((a, b) => (b.dateAdded ?? 0) - (a.dateAdded ?? 0));
      break;
    case 'recentlyPlayed':
      result = result
        .filter((t) => t.lastPlayedAt != null)
        .sort((a, b) => (b.lastPlayedAt ?? 0) - (a.lastPlayedAt ?? 0));
      break;
    case 'mostPlayed':
      result = result
        .filter((t) => t.playCount > 0)
        .sort((a, b) => b.playCount - a.playCount);
      break;
    default:
      break;
  }

  const q = options.searchQuery.trim().toLowerCase();
  if (q) {
    result = result.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        t.album.toLowerCase().includes(q)
    );
  }

  if (
    options.filter === 'all' ||
    options.filter === 'favorites' ||
    q
  ) {
    result.sort((a, b) => {
      let cmp = 0;
      switch (sort) {
        case 'artist':
          cmp = a.artist.localeCompare(b.artist) || a.title.localeCompare(b.title);
          break;
        case 'album':
          cmp = a.album.localeCompare(b.album) || a.title.localeCompare(b.title);
          break;
        case 'dateAdded':
          cmp = (a.dateAdded ?? 0) - (b.dateAdded ?? 0);
          break;
        case 'duration':
          cmp = a.durationMs - b.durationMs;
          break;
        case 'recentlyPlayed':
          cmp = (a.lastPlayedAt ?? 0) - (b.lastPlayedAt ?? 0);
          break;
        case 'mostPlayed':
          cmp = a.playCount - b.playCount;
          break;
        case 'title':
        default:
          cmp = a.title.localeCompare(b.title);
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }

  return result;
}
