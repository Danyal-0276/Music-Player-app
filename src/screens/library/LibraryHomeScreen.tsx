import React, { useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  interpolate,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeProvider';
import { useLibraryStore } from '../../store/libraryStore';
import { useSettingsStore } from '../../store/settingsStore';
import { usePlayerUiStore } from '../../store/playerUiStore';
import { useChrome } from '../../navigation/ChromeContext';
import { SongRow } from '../../components/SongRow';
import { EmptyState } from '../../components/EmptyState';
import { SongRowSkeleton } from '../../components/SongRowSkeleton';
import { AnimatedFlashList } from '../../components/AnimatedFlashList';
import { filterAndSortTracks } from '../../utils/tracks';
import { playTracks } from '../../services/audio/player';
import { openAppSettings } from '../../services/permissions';
import { useNowPlaying } from '../../hooks/useNowPlaying';
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

const HEADER_TRAVEL = 168;

export function LibraryHomeScreen() {
  const { colors, fonts, radii, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { chromeHidden, onScroll } = useChrome();
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
  const setPlaylistPickTrackIds = usePlayerUiStore((s) => s.setPlaylistPickTrackIds);
  const settings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const [showSort, setShowSort] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const { activeId, isPlaying } = useNowPlaying();

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

  const headerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(chromeHidden.value, [0, 1], [0, -HEADER_TRAVEL]),
      },
    ],
    opacity: interpolate(chromeHidden.value, [0, 1], [1, 0]),
  }));

  const exitSelection = useCallback(() => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  }, []);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const enterSelection = useCallback((id: string) => {
    setSelectionMode(true);
    setSelectedIds(new Set([id]));
  }, []);

  const selectAllVisible = useCallback(() => {
    setSelectedIds(new Set(data.map((t) => t.id)));
  }, [data]);

  const onPlay = useCallback(
    (_track: Track, index: number) => {
      void playTracks(data, index);
    },
    [data]
  );

  const renderItem = useCallback(
    ({ item, index }: { item: Track; index: number }) => {
      const active = activeId === item.id;
      return (
        <SongRow
          track={item}
          selectionMode={selectionMode}
          selected={selectedIds.has(item.id)}
          isActive={active}
          isPlaying={active && isPlaying}
          onPress={() => {
            if (selectionMode) toggleSelect(item.id);
            else onPlay(item, index);
          }}
          onLongPress={() => {
            if (selectionMode) toggleSelect(item.id);
            else enterSelection(item.id);
          }}
          onFavorite={selectionMode ? undefined : () => void toggleFavorite(item.id)}
          onMore={selectionMode ? undefined : () => setContextTrack(item)}
        />
      );
    },
    [
      activeId,
      isPlaying,
      selectionMode,
      selectedIds,
      toggleSelect,
      enterSelection,
      onPlay,
      toggleFavorite,
      setContextTrack,
    ]
  );

  if (permission !== 'granted') {
    return (
      <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <EmptyState
          icon="folder-open-outline"
          title="Your music lives here"
          message="Allow Orbit to access audio on this phone so we can build your offline library. Your files stay on the device."
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
      <Animated.View style={headerStyle}>
        {selectionMode ? (
          <View style={[styles.header, styles.selectionBar]}>
            <Pressable onPress={exitSelection} hitSlop={10} accessibilityLabel="Cancel selection">
              <Text style={{ color: colors.accent, fontFamily: fonts.bodyMedium, fontSize: 15 }}>
                Cancel
              </Text>
            </Pressable>
            <Text style={{ color: colors.text, fontFamily: fonts.bodyBold, fontSize: 16 }}>
              {selectedIds.size} selected
            </Text>
            <Pressable onPress={selectAllVisible} hitSlop={10} accessibilityLabel="Select all">
              <Text style={{ color: colors.accent, fontFamily: fonts.bodyMedium, fontSize: 15 }}>
                All
              </Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.header}>
            <View>
              <Text
                style={{
                  color: colors.accent,
                  fontFamily: fonts.bodyMedium,
                  fontSize: 11,
                  letterSpacing: 3,
                  textTransform: 'uppercase',
                  marginBottom: 2,
                }}
              >
                Offline deck
              </Text>
              <Text style={{ color: colors.text, fontFamily: fonts.display, fontSize: 34 }}>
                Orbit
              </Text>
            </View>
            <View style={styles.headerActions}>
              <Pressable
                onPress={() => setSelectionMode(true)}
                hitSlop={10}
                accessibilityLabel="Select songs"
                style={[
                  styles.headerBtn,
                  {
                    backgroundColor: isDark ? colors.surfaceElevated : colors.accentSoft,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons name="checkbox-outline" size={20} color={colors.text} />
              </Pressable>
              <Pressable
                onPress={() => setShowSort((v) => !v)}
                hitSlop={10}
                accessibilityLabel="Sort options"
                style={[
                  styles.headerBtn,
                  {
                    backgroundColor: showSort ? colors.accentSoft : isDark ? colors.surfaceElevated : colors.accentSoft,
                    borderColor: showSort ? colors.accent : colors.border,
                  },
                ]}
              >
                <Ionicons name="swap-vertical" size={20} color={showSort ? colors.accent : colors.text} />
              </Pressable>
            </View>
          </View>
        )}

        <View
          style={[
            styles.search,
            {
              backgroundColor: colors.surfaceElevated,
              borderRadius: radii.full,
              borderWidth: 1,
              borderColor: colors.border,
            },
          ]}
        >
          <Ionicons name="radio-outline" size={18} color={colors.accent} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Scan the vault…"
            placeholderTextColor={colors.textMuted}
            style={{ flex: 1, color: colors.text, fontFamily: fonts.body, fontSize: 15 }}
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </Pressable>
          ) : null}
        </View>

        <View style={styles.chipRow}>
          <ScrollView
            horizontal
            nestedScrollEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.chipScroll}
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
                      backgroundColor: active ? colors.accent : 'transparent',
                      borderColor: active ? colors.accent : colors.border,
                      borderWidth: 1,
                      borderRadius: radii.full,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: active ? '#fff' : colors.textSecondary,
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
        </View>

        {showSort && !selectionMode ? (
          <View style={styles.chipRow}>
            <ScrollView
              horizontal
              nestedScrollEnabled
              showsHorizontalScrollIndicator={false}
              style={styles.chipScroll}
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
          </View>
        ) : null}
      </Animated.View>

      {selectionMode && selectedIds.size > 0 ? (
        <View style={[styles.bulkBar, { backgroundColor: colors.accent }]}>
          <Pressable
            style={styles.bulkBtn}
            onPress={() => {
              setPlaylistPickTrackIds(Array.from(selectedIds));
              exitSelection();
            }}
            accessibilityLabel="Add selected to playlist"
          >
            <Ionicons name="add-circle-outline" size={20} color="#fff" />
            <Text style={{ color: '#fff', fontFamily: fonts.bodyMedium, fontSize: 14 }}>
              Add to playlist
            </Text>
          </Pressable>
        </View>
      ) : null}

      {error ? (
        <Text style={{ color: colors.danger, paddingHorizontal: 16, marginBottom: 8, fontFamily: fonts.body }}>
          {error}
        </Text>
      ) : null}

      <View style={styles.listArea}>
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
          <AnimatedFlashList
            data={data}
            keyExtractor={(item) => item.id}
            style={styles.list}
            onScroll={onScroll}
            scrollEventThrottle={16}
            drawDistance={250}
            refreshControl={
              <RefreshControl
                refreshing={isScanning}
                onRefresh={() => void refreshLibrary(true)}
                tintColor={colors.accent}
              />
            }
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 180 }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectionBar: {
    minHeight: 52,
  },
  headerActions: { flexDirection: 'row', gap: 8 },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  search: {
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chipRow: {
    height: 40,
    marginBottom: 8,
  },
  chipScroll: {
    height: 40,
  },
  chips: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
    height: 40,
  },
  chip: {
    height: 32,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bulkBar: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  bulkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  listArea: { flex: 1, minHeight: 0 },
  list: { flex: 1 },
});
