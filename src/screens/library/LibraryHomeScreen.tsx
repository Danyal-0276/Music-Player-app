import React, { useMemo, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeProvider';
import { useLibraryStore } from '../../store/libraryStore';
import { useSettingsStore } from '../../store/settingsStore';
import { usePlayerUiStore } from '../../store/playerUiStore';
import { SongRow } from '../../components/SongRow';
import { EmptyState } from '../../components/EmptyState';
import { SongRowSkeleton } from '../../components/SongRowSkeleton';
import { filterAndSortTracks } from '../../utils/tracks';
import { playTracks } from '../../services/audio/player';
import { openAppSettings } from '../../services/permissions';
import type { LibraryFilter, LibrarySortKey, Track } from '../../types';

const FILTERS: { key: LibraryFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'recentlyAdded', label: 'New' },
  { key: 'recentlyPlayed', label: 'Recent' },
  { key: 'mostPlayed', label: 'Top' },
  { key: 'favorites', label: 'Liked' },
];

const SORTS: { key: LibrarySortKey; label: string }[] = [
  { key: 'title', label: 'Name' },
  { key: 'artist', label: 'Artist' },
  { key: 'album', label: 'Album' },
  { key: 'dateAdded', label: 'Date added' },
  { key: 'duration', label: 'Duration' },
  { key: 'recentlyPlayed', label: 'Recently played' },
  { key: 'mostPlayed', label: 'Most played' },
];

export function LibraryHomeScreen() {
  const { colors, fonts, radii } = useTheme();
  const insets = useSafeAreaInsets();
  const tracks = useLibraryStore((s) => s.tracks);
  const filter = useLibraryStore((s) => s.filter);
  const searchQuery = useLibraryStore((s) => s.searchQuery);
  const isScanning = useLibraryStore((s) => s.isScanning);
  const permission = useLibraryStore((s) => s.permission);
  const error = useLibraryStore((s) => s.error);
  const setFilter = useLibraryStore((s) => s.setFilter);
  const setSearchQuery = useLibraryStore((s) => s.setSearchQuery);
  const refreshLibrary = useLibraryStore((s) => s.refreshLibrary);
  const requestPermission = useLibraryStore((s) => s.requestPermission);
  const toggleFavorite = useLibraryStore((s) => s.toggleFavorite);
  const setContextTrack = usePlayerUiStore((s) => s.setContextTrack);
  const settings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const [showSort, setShowSort] = useState(false);

  const data = useMemo(
    () =>
      filterAndSortTracks(tracks, {
        filter,
        searchQuery,
        sort: settings.librarySort,
        sortDir: settings.librarySortDir,
      }),
    [tracks, filter, searchQuery, settings.librarySort, settings.librarySortDir]
  );

  const onPlay = (track: Track, index: number) => {
    void playTracks(data, index);
  };

  if (permission !== 'granted') {
    return (
      <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <EmptyState
          icon="folder-open-outline"
          title="Your music lives here"
          message="Allow Harmonic to access audio on this phone so we can build your offline library. Your files stay on the device."
          actionLabel="Allow music access"
          onAction={() => void requestPermission()}
          secondaryLabel={permission === 'blocked' ? 'Open system settings' : undefined}
          onSecondary={permission === 'blocked' ? () => void openAppSettings() : undefined}
        />
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={{ color: colors.text, fontFamily: fonts.display, fontSize: 32 }}>Harmonic</Text>
        <Pressable
          onPress={() => setShowSort((v) => !v)}
          hitSlop={10}
          accessibilityLabel="Sort options"
        >
          <Ionicons name="swap-vertical" size={22} color={colors.text} />
        </Pressable>
      </View>

      <View
        style={[
          styles.search,
          { backgroundColor: colors.surfaceElevated, borderRadius: radii.lg },
        ]}
      >
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search songs, artists, albums"
          placeholderTextColor={colors.textMuted}
          style={{ flex: 1, color: colors.text, fontFamily: fonts.body, fontSize: 15 }}
        />
        {searchQuery ? (
          <Pressable onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? colors.accent : colors.accentSoft,
                  borderRadius: radii.full,
                },
              ]}
            >
              <Text
                style={{
                  color: active ? '#fff' : colors.accent,
                  fontFamily: fonts.bodyMedium,
                  fontSize: 13,
                }}
              >
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {showSort ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {SORTS.map((s) => {
            const active = settings.librarySort === s.key;
            return (
              <Pressable
                key={s.key}
                onPress={() => {
                  if (active) {
                    updateSettings({
                      librarySortDir: settings.librarySortDir === 'asc' ? 'desc' : 'asc',
                    });
                  } else {
                    updateSettings({ librarySort: s.key, librarySortDir: 'asc' });
                  }
                }}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? colors.surfaceElevated : 'transparent',
                    borderColor: colors.border,
                    borderWidth: 1,
                    borderRadius: radii.full,
                  },
                ]}
              >
                <Text style={{ color: colors.text, fontFamily: fonts.body, fontSize: 12 }}>
                  {s.label}
                  {active ? (settings.librarySortDir === 'asc' ? ' ↑' : ' ↓') : ''}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}

      {error ? (
        <Text style={{ color: colors.danger, paddingHorizontal: 16, marginBottom: 8, fontFamily: fonts.body }}>
          {error}
        </Text>
      ) : null}

      {isScanning && tracks.length === 0 ? (
        <SongRowSkeleton />
      ) : data.length === 0 ? (
        <EmptyState
          icon="musical-notes-outline"
          title={searchQuery ? 'No matches' : 'No songs yet'}
          message={
            searchQuery
              ? 'Try a different search.'
              : 'Put audio files in Music or Downloads, then rescan.'
          }
          actionLabel="Rescan library"
          onAction={() => void refreshLibrary(true)}
        />
      ) : (
        <FlashList
          data={data}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={isScanning}
              onRefresh={() => void refreshLibrary(true)}
              tintColor={colors.accent}
            />
          }
          renderItem={({ item, index }) => (
            <SongRow
              track={item}
              onPress={() => onPlay(item, index)}
              onFavorite={() => void toggleFavorite(item.id)}
              onMore={() => setContextTrack(item)}
            />
          )}
          contentContainerStyle={{ paddingBottom: 120 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  search: {
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chips: { paddingHorizontal: 16, gap: 8, paddingBottom: 10 },
  chip: { paddingHorizontal: 14, paddingVertical: 8 },
});
