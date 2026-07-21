import * as SQLite from 'expo-sqlite';
import type { Playlist, Track } from '../types';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase() {
  if (!db) {
    db = await SQLite.openDatabaseAsync('harmonic.db');
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS tracks (
        id TEXT PRIMARY KEY NOT NULL,
        uri TEXT NOT NULL,
        title TEXT NOT NULL,
        artist TEXT NOT NULL,
        album TEXT NOT NULL,
        albumId TEXT,
        artistId TEXT,
        durationMs INTEGER NOT NULL DEFAULT 0,
        artworkUri TEXT,
        fileSize INTEGER,
        dateAdded INTEGER,
        dateModified INTEGER,
        playCount INTEGER NOT NULL DEFAULT 0,
        lastPlayedAt INTEGER,
        isFavorite INTEGER NOT NULL DEFAULT 0
      );
      CREATE INDEX IF NOT EXISTS idx_tracks_title ON tracks(title);
      CREATE INDEX IF NOT EXISTS idx_tracks_artist ON tracks(artist);
      CREATE INDEX IF NOT EXISTS idx_tracks_album ON tracks(album);
      CREATE INDEX IF NOT EXISTS idx_tracks_favorite ON tracks(isFavorite);
      CREATE INDEX IF NOT EXISTS idx_tracks_playcount ON tracks(playCount);
      CREATE INDEX IF NOT EXISTS idx_tracks_lastplayed ON tracks(lastPlayedAt);

      CREATE TABLE IF NOT EXISTS playlists (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS playlist_tracks (
        playlistId TEXT NOT NULL,
        trackId TEXT NOT NULL,
        position INTEGER NOT NULL,
        PRIMARY KEY (playlistId, trackId),
        FOREIGN KEY (playlistId) REFERENCES playlists(id) ON DELETE CASCADE,
        FOREIGN KEY (trackId) REFERENCES tracks(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS library_meta (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL
      );
    `);
  }
  return db;
}

function mapTrack(row: Record<string, unknown>): Track {
  return {
    id: String(row.id),
    uri: String(row.uri),
    title: String(row.title),
    artist: String(row.artist),
    album: String(row.album),
    albumId: row.albumId != null ? String(row.albumId) : null,
    artistId: row.artistId != null ? String(row.artistId) : null,
    durationMs: Number(row.durationMs) || 0,
    artworkUri: row.artworkUri != null ? String(row.artworkUri) : null,
    fileSize: row.fileSize != null ? Number(row.fileSize) : null,
    dateAdded: row.dateAdded != null ? Number(row.dateAdded) : null,
    dateModified: row.dateModified != null ? Number(row.dateModified) : null,
    playCount: Number(row.playCount) || 0,
    lastPlayedAt: row.lastPlayedAt != null ? Number(row.lastPlayedAt) : null,
    isFavorite: Boolean(row.isFavorite),
  };
}

export async function upsertTracks(tracks: Track[]) {
  const database = await getDatabase();
  await database.withTransactionAsync(async () => {
    for (const track of tracks) {
      await database.runAsync(
        `INSERT INTO tracks (
          id, uri, title, artist, album, albumId, artistId, durationMs, artworkUri,
          fileSize, dateAdded, dateModified, playCount, lastPlayedAt, isFavorite
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
          COALESCE((SELECT playCount FROM tracks WHERE id = ?), 0),
          (SELECT lastPlayedAt FROM tracks WHERE id = ?),
          COALESCE((SELECT isFavorite FROM tracks WHERE id = ?), 0)
        )
        ON CONFLICT(id) DO UPDATE SET
          uri = excluded.uri,
          title = excluded.title,
          artist = excluded.artist,
          album = excluded.album,
          albumId = excluded.albumId,
          artistId = excluded.artistId,
          durationMs = excluded.durationMs,
          artworkUri = excluded.artworkUri,
          fileSize = excluded.fileSize,
          dateAdded = excluded.dateAdded,
          dateModified = excluded.dateModified`,
        [
          track.id,
          track.uri,
          track.title,
          track.artist,
          track.album,
          track.albumId,
          track.artistId,
          track.durationMs,
          track.artworkUri,
          track.fileSize,
          track.dateAdded,
          track.dateModified,
          track.id,
          track.id,
          track.id,
        ]
      );
    }
  });
}

export async function getAllTracks(): Promise<Track[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<Record<string, unknown>>(
    'SELECT * FROM tracks ORDER BY title COLLATE NOCASE ASC'
  );
  return rows.map(mapTrack);
}

export async function clearTracksCache() {
  const database = await getDatabase();
  await database.execAsync('DELETE FROM tracks;');
  await setMeta('lastFullScanAt', '');
  await setMeta('trackCount', '0');
}

export async function setTrackFavorite(trackId: string, isFavorite: boolean) {
  const database = await getDatabase();
  await database.runAsync('UPDATE tracks SET isFavorite = ? WHERE id = ?', [
    isFavorite ? 1 : 0,
    trackId,
  ]);
}

export async function recordPlay(trackId: string) {
  const database = await getDatabase();
  await database.runAsync(
    `UPDATE tracks SET playCount = playCount + 1, lastPlayedAt = ? WHERE id = ?`,
    [Date.now(), trackId]
  );
}

export async function setMeta(key: string, value: string) {
  const database = await getDatabase();
  await database.runAsync(
    'INSERT INTO library_meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    [key, value]
  );
}

export async function getMeta(key: string): Promise<string | null> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<{ value: string }>(
    'SELECT value FROM library_meta WHERE key = ?',
    [key]
  );
  return row?.value ?? null;
}

export async function createPlaylist(name: string): Promise<Playlist> {
  const database = await getDatabase();
  const id = `pl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const now = Date.now();
  await database.runAsync(
    'INSERT INTO playlists (id, name, createdAt, updatedAt) VALUES (?, ?, ?, ?)',
    [id, name, now, now]
  );
  return { id, name, createdAt: now, updatedAt: now, trackCount: 0 };
}

export async function renamePlaylist(id: string, name: string) {
  const database = await getDatabase();
  await database.runAsync(
    'UPDATE playlists SET name = ?, updatedAt = ? WHERE id = ?',
    [name, Date.now(), id]
  );
}

export async function deletePlaylist(id: string) {
  const database = await getDatabase();
  await database.withTransactionAsync(async () => {
    await database.runAsync('DELETE FROM playlist_tracks WHERE playlistId = ?', [id]);
    await database.runAsync('DELETE FROM playlists WHERE id = ?', [id]);
  });
}

export async function getPlaylists(): Promise<Playlist[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<{
    id: string;
    name: string;
    createdAt: number;
    updatedAt: number;
    trackCount: number;
  }>(
    `SELECT p.id, p.name, p.createdAt, p.updatedAt,
      (SELECT COUNT(*) FROM playlist_tracks pt WHERE pt.playlistId = p.id) as trackCount
     FROM playlists p
     ORDER BY p.updatedAt DESC`
  );
  return rows;
}

export async function getPlaylistTracks(playlistId: string): Promise<Track[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<Record<string, unknown>>(
    `SELECT t.* FROM tracks t
     INNER JOIN playlist_tracks pt ON pt.trackId = t.id
     WHERE pt.playlistId = ?
     ORDER BY pt.position ASC`,
    [playlistId]
  );
  return rows.map(mapTrack);
}

export async function addTrackToPlaylist(playlistId: string, trackId: string) {
  const database = await getDatabase();
  const row = await database.getFirstAsync<{ maxPos: number | null }>(
    'SELECT MAX(position) as maxPos FROM playlist_tracks WHERE playlistId = ?',
    [playlistId]
  );
  const position = (row?.maxPos ?? -1) + 1;
  await database.runAsync(
    `INSERT OR IGNORE INTO playlist_tracks (playlistId, trackId, position) VALUES (?, ?, ?)`,
    [playlistId, trackId, position]
  );
  await database.runAsync('UPDATE playlists SET updatedAt = ? WHERE id = ?', [
    Date.now(),
    playlistId,
  ]);
}

export async function removeTrackFromPlaylist(playlistId: string, trackId: string) {
  const database = await getDatabase();
  await database.runAsync(
    'DELETE FROM playlist_tracks WHERE playlistId = ? AND trackId = ?',
    [playlistId, trackId]
  );
  await database.runAsync('UPDATE playlists SET updatedAt = ? WHERE id = ?', [
    Date.now(),
    playlistId,
  ]);
}

export async function reorderPlaylistTracks(
  playlistId: string,
  orderedTrackIds: string[]
) {
  const database = await getDatabase();
  await database.withTransactionAsync(async () => {
    for (let i = 0; i < orderedTrackIds.length; i++) {
      await database.runAsync(
        'UPDATE playlist_tracks SET position = ? WHERE playlistId = ? AND trackId = ?',
        [i, playlistId, orderedTrackIds[i]]
      );
    }
    await database.runAsync('UPDATE playlists SET updatedAt = ? WHERE id = ?', [
      Date.now(),
      playlistId,
    ]);
  });
}
