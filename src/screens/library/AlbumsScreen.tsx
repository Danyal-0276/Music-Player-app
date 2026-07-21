import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeProvider';
import { useLibraryStore } from '../../store/libraryStore';
import { useSettingsStore } from '../../store/settingsStore';
import { EmptyState } from '../../components/EmptyState';
import type { LibraryStackParamList } from '../../navigation/types';

export function AlbumsScreen() {
  const { colors, fonts, artBorderRadius } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const albumLayout = useSettingsStore((s) => s.settings.albumLayout);
  const getAlbums = useLibraryStore((s) => s.getAlbums);
  const tracks = useLibraryStore((s) => s.tracks);
  const albums = useMemo(() => getAlbums(), [getAlbums, tracks]);
  const navigation =
    useNavigation<NativeStackNavigationProp<LibraryStackParamList>>();
  const gap = 12;
  const cols = albumLayout === 'grid' ? 2 : 1;
  const tile = (width - 32 - gap) / 2;

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <Text style={[styles.title, { color: colors.text, fontFamily: fonts.display }]}>Albums</Text>
      {albums.length === 0 ? (
        <EmptyState title="No albums yet" message="Your albums will show up after a library scan." />
      ) : albumLayout === 'grid' ? (
        <FlashList
          data={albums}
          numColumns={2}
          estimatedItemSize={tile + 56}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
          renderItem={({ item }) => (
            <Pressable
              style={{ width: tile, marginBottom: 16, marginRight: gap }}
              onPress={() =>
                navigation.navigate('AlbumDetail', {
                  albumId: item.id,
                  albumName: item.name,
                  artistName: item.artist,
                })
              }
            >
              <View
                style={{
                  width: tile,
                  height: tile,
                  borderRadius: artBorderRadius,
                  backgroundColor: colors.surfaceElevated,
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                {item.artworkUri ? (
                  <Image
                    source={{ uri: item.artworkUri }}
                    style={{ width: tile, height: tile, borderRadius: artBorderRadius }}
                  />
                ) : (
                  <Ionicons name="disc" size={36} color={colors.textMuted} />
                )}
              </View>
              <Text
                numberOfLines={1}
                style={{ color: colors.text, fontFamily: fonts.bodyMedium, marginTop: 8 }}
              >
                {item.name}
              </Text>
              <Text numberOfLines={1} style={{ color: colors.textSecondary, fontFamily: fonts.body, fontSize: 12 }}>
                {item.artist}
              </Text>
            </Pressable>
          )}
        />
      ) : (
        <FlashList
          data={albums}
          estimatedItemSize={64}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 120 }}
          renderItem={({ item }) => (
            <Pressable
              style={styles.row}
              onPress={() =>
                navigation.navigate('AlbumDetail', {
                  albumId: item.id,
                  albumName: item.name,
                  artistName: item.artist,
                })
              }
            >
              <View
                style={[
                  styles.art,
                  { borderRadius: artBorderRadius, backgroundColor: colors.surfaceElevated },
                ]}
              >
                {item.artworkUri ? (
                  <Image
                    source={{ uri: item.artworkUri }}
                    style={{ width: 52, height: 52, borderRadius: artBorderRadius }}
                  />
                ) : (
                  <Ionicons name="disc" size={22} color={colors.textMuted} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontFamily: fonts.bodyMedium }}>{item.name}</Text>
                <Text style={{ color: colors.textSecondary, fontFamily: fonts.body, fontSize: 13 }}>
                  {item.artist} · {item.trackCount} songs
                </Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  title: { fontSize: 28, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
  },
  art: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
});
