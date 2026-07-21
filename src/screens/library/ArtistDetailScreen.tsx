import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeProvider';
import { useLibraryStore } from '../../store/libraryStore';
import { usePlayerUiStore } from '../../store/playerUiStore';
import { SongRow } from '../../components/SongRow';
import { playTracks } from '../../services/audio/player';
import type { LibraryStackParamList } from '../../navigation/types';
import type { Track } from '../../types';

export function ArtistDetailScreen() {
  const route = useRoute<RouteProp<LibraryStackParamList, 'ArtistDetail'>>();
  const { artistName } = route.params;
  const { colors, fonts } = useTheme();
  const tracks = useLibraryStore((s) => s.tracks);
  const toggleFavorite = useLibraryStore((s) => s.toggleFavorite);
  const setContextTrack = usePlayerUiStore((s) => s.setContextTrack);

  const data = useMemo(
    () =>
      tracks
        .filter((t) => (t.artist || 'Unknown Artist') === artistName)
        .sort((a, b) => a.title.localeCompare(b.title)),
    [tracks, artistName]
  );

  const onPlay = (_track: Track, index: number) => {
    void playTracks(data, index);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Text
        style={{
          color: colors.textSecondary,
          fontFamily: fonts.body,
          paddingHorizontal: 20,
          marginVertical: 8,
        }}
      >
        {data.length} songs
      </Text>
      <FlashList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 120 }}
        renderItem={({ item, index }) => (
          <SongRow
            track={item}
            onPress={() => onPlay(item, index)}
            onFavorite={() => void toggleFavorite(item.id)}
            onMore={() => setContextTrack(item)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
