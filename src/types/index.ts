export type ThemeMode = 'system' | 'light' | 'dark';
export type AccentId = 'coral' | 'teal' | 'sky' | 'lime' | 'rose' | 'gold' | 'slate';
export type Density = 'comfortable' | 'compact';
export type ArtStyle = 'rounded' | 'circle';
export type AlbumLayout = 'grid' | 'list';
export type RepeatModeSetting = 'off' | 'all' | 'one';
export type LibrarySortKey =
  | 'title'
  | 'artist'
  | 'album'
  | 'dateAdded'
  | 'duration'
  | 'recentlyPlayed'
  | 'mostPlayed';
export type SortDir = 'asc' | 'desc';
export type LibraryFilter =
  | 'all'
  | 'recentlyAdded'
  | 'recentlyPlayed'
  | 'mostPlayed'
  | 'favorites';

export type AppSettings = {
  themeMode: ThemeMode;
  accentId: AccentId;
  artStyle: ArtStyle;
  density: Density;
  albumLayout: AlbumLayout;
  reduceMotion: boolean;
  ignoreShortTracks: boolean;
  minTrackDurationMs: number;
  pauseOnNoisy: boolean;
  defaultRepeat: RepeatModeSetting;
  defaultShuffle: boolean;
  librarySort: LibrarySortKey;
  librarySortDir: SortDir;
};

export type Track = {
  id: string;
  uri: string;
  title: string;
  artist: string;
  album: string;
  albumId: string | null;
  artistId: string | null;
  durationMs: number;
  artworkUri: string | null;
  fileSize: number | null;
  dateAdded: number | null;
  dateModified: number | null;
  playCount: number;
  lastPlayedAt: number | null;
  isFavorite: boolean;
};

export type Playlist = {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  trackCount: number;
};

export type ArtistGroup = {
  name: string;
  trackCount: number;
  artworkUri: string | null;
};

export type AlbumGroup = {
  id: string;
  name: string;
  artist: string;
  trackCount: number;
  artworkUri: string | null;
};

export const DEFAULT_SETTINGS: AppSettings = {
  themeMode: 'system',
  accentId: 'coral',
  artStyle: 'rounded',
  density: 'comfortable',
  albumLayout: 'grid',
  reduceMotion: false,
  ignoreShortTracks: true,
  minTrackDurationMs: 30000,
  pauseOnNoisy: true,
  defaultRepeat: 'off',
  defaultShuffle: false,
  librarySort: 'title',
  librarySortDir: 'asc',
};
