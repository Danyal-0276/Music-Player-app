import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useFocusEffect, useRoute, type RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import { useLibraryStore } from '../../store/libraryStore';
import { usePlayerUiStore } from '../../store/playerUiStore';
import { SongRow } from '../../components/SongRow';
import { EmptyState } from '../../components/EmptyState';
import { playTracks } from '../../services/audio/player';
import type { LibraryStackParamList } from '../../navigation/types';
import type { Track } from '../../types';

export function PlaylistDetailScreen() {
  const route = useRoute<RouteProp<LibraryStackParamList, 'PlaylistDetail'>>();
  const { playlistId } = route.params;
  const { colors, fonts, radii } = useTheme();
  const getPlaylistTracks = useLibraryStore((s) => s.getPlaylistTracks);
  const removeFromPlaylist = useLibraryStore((s) => s.removeFromPlaylist);
  const toggleFavorite = useLibraryStore((s) => s.toggleFavorite);
  const setContextTrack = usePlayerUiStore((s) => s.setContextTrack);
  const [data, setData] = useState<Track[]>([]);

  const load = useCallback(async () => {
    const tracks = await getPlaylistTracks(playlistId);
    setData(tracks);
  }, [getPlaylistTracks, playlistId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {data.length > 0 ? (
        <Pressable
          onPress={() => void playTracks(data, 0)}
          style={[styles.playAll, { backgroundColor: colors.accent, borderRadius: radii.lg }]}
        >
          <Ionicons name="play" size={18} color="#fff" />
          <Text style={{ color: '#fff', fontFamily: fonts.bodyBold }}>Play all</Text>
        </Pressable>
      ) : null}

      {data.length === 0 ? (
        <EmptyState
          title="Empty playlist"
          message="Add songs from any track menu → Add to playlist."
        />
      ) : (
        <FlashList
          data={data}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 120 }}
          renderItem={({ item, index }) => (
            <SongRow
              track={item}
              onPress={() => void playTracks(data, index)}
              onFavorite={() => void toggleFavorite(item.id)}
              onMore={() => setContextTrack(item)}
              onLongPress={() => {
                void removeFromPlaylist(playlistId, item.id).then(load);
              }}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  playAll: {
    marginHorizontal: 16,
    marginVertical: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
