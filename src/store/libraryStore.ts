import { create } from 'zustand';
import type {
  AlbumGroup,
  ArtistGroup,
  LibraryFilter,
  Playlist,
  Track,
} from '../types';
import * as db from '../database';
import { scanDeviceMusic } from '../services/musicScanner';
import {
  checkAudioPermission,
  requestAudioPermission,
  type PermissionStatus,
} from '../services/permissions';

type LibraryState = {
  tracks: Track[];
  playlists: Playlist[];
  permission: PermissionStatus;
  isScanning: boolean;
  scanProgress: string | null;
  lastScanAt: number | null;
  error: string | null;
  filter: LibraryFilter;
  searchQuery: string;
  initialized: boolean;
  init: () => Promise<void>;
  requestPermission: () => Promise<boolean>;
  refreshLibrary: (full?: boolean) => Promise<void>;
  clearCache: () => Promise<void>;
  setFilter: (filter: LibraryFilter) => void;
  setSearchQuery: (q: string) => void;
  toggleFavorite: (trackId: string) => Promise<void>;
  recordPlay: (trackId: string) => Promise<void>;
  loadPlaylists: () => Promise<void>;
  createPlaylist: (name: string) => Promise<Playlist>;
  renamePlaylist: (id: string, name: string) => Promise<void>;
  deletePlaylist: (id: string) => Promise<void>;
  addToPlaylist: (playlistId: string, trackId: string) => Promise<void>;
  addTracksToPlaylist: (playlistId: string, trackIds: string[]) => Promise<void>;
  removeFromPlaylist: (playlistId: string, trackId: string) => Promise<void>;
  getPlaylistTracks: (playlistId: string) => Promise<Track[]>;
  getArtists: () => ArtistGroup[];
  getAlbums: () => AlbumGroup[];
};

export const useLibraryStore = create<LibraryState>((set, get) => ({
  tracks: [],
  playlists: [],
  permission: 'undetermined',
  isScanning: false,
  scanProgress: null,
  lastScanAt: null,
  error: null,
  filter: 'all',
  searchQuery: '',
  initialized: false,

  init: async () => {
    const permission = await checkAudioPermission();
    await db.getDatabase();
    const tracks = await db.getAllTracks();
    const last = await db.getMeta('lastFullScanAt');
    const playlists = await db.getPlaylists();
    set({
      permission,
      tracks,
      playlists,
      lastScanAt: last ? Number(last) : null,
      initialized: true,
    });
    if (permission === 'granted' && tracks.length === 0) {
      await get().refreshLibrary(true);
    }
  },

  requestPermission: async () => {
    const status = await requestAudioPermission();
    set({ permission: status });
    if (status === 'granted') {
      await get().refreshLibrary(true);
      return true;
    }
    return false;
  },

  refreshLibrary: async () => {
    if (get().isScanning) return;
    const permission = await checkAudioPermission();
    if (permission !== 'granted') {
      set({ permission, error: 'Music access is required to scan your library.' });
      return;
    }
    set({ isScanning: true, scanProgress: 'Scanning your music…', error: null, permission });
    try {
      const scanned = await scanDeviceMusic((progress) => {
        set({ scanProgress: progress });
      });
      await db.upsertTracks(scanned);
      const tracks = await db.getAllTracks();
      const now = Date.now();
      await db.setMeta('lastFullScanAt', String(now));
      await db.setMeta('trackCount', String(tracks.length));
      set({
        tracks,
        lastScanAt: now,
        isScanning: false,
        scanProgress: null,
      });
    } catch (e) {
      set({
        isScanning: false,
        scanProgress: null,
        error: e instanceof Error ? e.message : 'Failed to scan music library',
      });
    }
  },

  clearCache: async () => {
    await db.clearTracksCache();
    set({ tracks: [], lastScanAt: null });
  },

  setFilter: (filter) => set({ filter }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  toggleFavorite: async (trackId) => {
    const track = get().tracks.find((t) => t.id === trackId);
    if (!track) return;
    const next = !track.isFavorite;
    await db.setTrackFavorite(trackId, next);
    set({
      tracks: get().tracks.map((t) =>
        t.id === trackId ? { ...t, isFavorite: next } : t
      ),
    });
  },

  recordPlay: async (trackId) => {
    await db.recordPlay(trackId);
    const now = Date.now();
    set({
      tracks: get().tracks.map((t) =>
        t.id === trackId
          ? { ...t, playCount: t.playCount + 1, lastPlayedAt: now }
          : t
      ),
    });
  },

  loadPlaylists: async () => {
    const playlists = await db.getPlaylists();
    set({ playlists });
  },

  createPlaylist: async (name) => {
    const playlist = await db.createPlaylist(name);
    await get().loadPlaylists();
    return playlist;
  },

  renamePlaylist: async (id, name) => {
    await db.renamePlaylist(id, name);
    await get().loadPlaylists();
  },

  deletePlaylist: async (id) => {
    await db.deletePlaylist(id);
    await get().loadPlaylists();
  },

  addToPlaylist: async (playlistId, trackId) => {
    await db.addTrackToPlaylist(playlistId, trackId);
    await get().loadPlaylists();
  },

  addTracksToPlaylist: async (playlistId, trackIds) => {
    await db.addTracksToPlaylist(playlistId, trackIds);
    await get().loadPlaylists();
  },

  removeFromPlaylist: async (playlistId, trackId) => {
    await db.removeTrackFromPlaylist(playlistId, trackId);
    await get().loadPlaylists();
  },

  getPlaylistTracks: async (playlistId) => db.getPlaylistTracks(playlistId),

  getArtists: () => {
    const map = new Map<string, ArtistGroup>();
    for (const track of get().tracks) {
      const name = track.artist || 'Unknown Artist';
      const existing = map.get(name);
      if (existing) {
        existing.trackCount += 1;
        if (!existing.artworkUri && track.artworkUri) {
          existing.artworkUri = track.artworkUri;
        }
      } else {
        map.set(name, {
          name,
          trackCount: 1,
          artworkUri: track.artworkUri,
        });
      }
    }
    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  },

  getAlbums: () => {
    const map = new Map<string, AlbumGroup>();
    for (const track of get().tracks) {
      const key = track.albumId || `${track.album}::${track.artist}`;
      const existing = map.get(key);
      if (existing) {
        existing.trackCount += 1;
        if (!existing.artworkUri && track.artworkUri) {
          existing.artworkUri = track.artworkUri;
        }
      } else {
        map.set(key, {
          id: key,
          name: track.album || 'Unknown Album',
          artist: track.artist || 'Unknown Artist',
          trackCount: 1,
          artworkUri: track.artworkUri,
        });
      }
    }
    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  },
}));
