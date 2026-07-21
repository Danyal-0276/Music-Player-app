import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useActiveMediaItem, useIsPlaying } from '@rntp/player';
import { useTheme } from '../theme/ThemeProvider';
import { usePlayerUiStore } from '../store/playerUiStore';
import { togglePlayPause } from '../services/audio/player';
import TrackPlayer from '@rntp/player';

type Props = {
  /** When true, sits above the tab dock (no safe-area padding). */
  embedded?: boolean;
};

export function MiniPlayer({ embedded = false }: Props) {
  const { colors, fonts, artBorderRadius, reduceMotion, isDark } = useTheme();
  const item = useActiveMediaItem();
  const playing = useIsPlaying();
  const setNowPlayingVisible = usePlayerUiStore((s) => s.setNowPlayingVisible);

  if (!item) return null;

  return (
    <Animated.View
      entering={reduceMotion ? undefined : FadeInDown.duration(220)}
      exiting={reduceMotion ? undefined : FadeOutDown.duration(180)}
      style={[
        styles.wrap,
        embedded && styles.embedded,
        {
          backgroundColor: isDark ? 'rgba(28, 25, 23, 0.96)' : 'rgba(255, 255, 255, 0.96)',
          borderColor: colors.border,
          shadowColor: colors.accent,
        },
      ]}
    >
      <Pressable
        style={styles.content}
        onPress={() => setNowPlayingVisible(true)}
        accessibilityLabel="Open now playing"
      >
        <View
          style={[
            styles.art,
            { borderRadius: artBorderRadius, backgroundColor: colors.surfaceElevated },
          ]}
        >
          {item.artworkUrl ? (
            <Image
              source={{ uri: String(item.artworkUrl) }}
              style={[styles.artImg, { borderRadius: artBorderRadius }]}
              contentFit="cover"
            />
          ) : (
            <Ionicons name="musical-note" size={18} color={colors.textMuted} />
          )}
        </View>
        <View style={styles.meta}>
          <Text numberOfLines={1} style={{ color: colors.text, fontFamily: fonts.bodyMedium, fontSize: 14 }}>
            {item.title ?? 'Unknown'}
          </Text>
          <Text numberOfLines={1} style={{ color: colors.textSecondary, fontFamily: fonts.body, fontSize: 12 }}>
            {item.artist ?? 'Unknown Artist'}
          </Text>
        </View>
        <Pressable
          onPress={togglePlayPause}
          hitSlop={12}
          accessibilityLabel={playing ? 'Pause' : 'Play'}
          style={[styles.ctrl, { backgroundColor: colors.accentSoft }]}
        >
          <Ionicons name={playing ? 'pause' : 'play'} size={22} color={colors.accent} />
        </Pressable>
        <Pressable
          onPress={() => TrackPlayer.skipToNext()}
          hitSlop={12}
          accessibilityLabel="Next track"
          style={styles.ctrl}
        >
          <Ionicons name="play-skip-forward" size={20} color={colors.text} />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  embedded: {
    borderTopWidth: 0,
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  content: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  art: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  artImg: { width: 44, height: 44 },
  meta: { flex: 1, minWidth: 0 },
  ctrl: {
    padding: 8,
    borderRadius: 999,
  },
});
