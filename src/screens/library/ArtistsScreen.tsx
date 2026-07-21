import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeProvider';
import { useLibraryStore } from '../../store/libraryStore';
import { useChrome } from '../../navigation/ChromeContext';
import { EmptyState } from '../../components/EmptyState';
import { AnimatedFlashList } from '../../components/AnimatedFlashList';
import type { LibraryStackParamList } from '../../navigation/types';

export function ArtistsScreen() {
  const { colors, fonts, artBorderRadius } = useTheme();
  const insets = useSafeAreaInsets();
  const { onScroll } = useChrome();
  const tracks = useLibraryStore((s) => s.tracks);
  const getArtists = useLibraryStore((s) => s.getArtists);
  const artists = useMemo(() => getArtists(), [getArtists, tracks]);
  const navigation =
    useNavigation<NativeStackNavigationProp<LibraryStackParamList>>();

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <Text style={[styles.title, { color: colors.text, fontFamily: fonts.display }]}>Artists</Text>
      {artists.length === 0 ? (
        <EmptyState
          title="No artists yet"
          message="Scan your library to see artists from your local music."
        />
      ) : (
        <AnimatedFlashList
          data={artists}
          keyExtractor={(item) => item.name}
          onScroll={onScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingBottom: 180 }}
          renderItem={({ item }) => (
            <Pressable
              style={styles.row}
              onPress={() => navigation.navigate('ArtistDetail', { artistName: item.name })}
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
                    style={{ width: 48, height: 48, borderRadius: artBorderRadius }}
                  />
                ) : (
                  <Ionicons name="person" size={20} color={colors.textMuted} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontFamily: fonts.bodyMedium, fontSize: 16 }}>
                  {item.name}
                </Text>
                <Text style={{ color: colors.textSecondary, fontFamily: fonts.body, fontSize: 13 }}>
                  {item.trackCount} songs
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
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
  art: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
});
