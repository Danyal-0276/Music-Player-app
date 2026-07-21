import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useActiveMediaItem, useIsPlaying } from '@rntp/player';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { usePlayerUiStore } from '../store/playerUiStore';
import { togglePlayPause } from '../services/audio/player';
import TrackPlayer from '@rntp/player';

export function MiniPlayer() {
  const { colors, fonts, artBorderRadius, reduceMotion } = useTheme();
  const insets = useSafeAreaInsets();
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
        {
          backgroundColor: colors.miniPlayer,
          borderTopColor: colors.border,
          paddingBottom: Math.max(insets.bottom, 8),
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
          style={styles.ctrl}
        >
          <Ionicons name={playing ? 'pause' : 'play'} size={26} color={colors.text} />
        </Pressable>
        <Pressable
          onPress={() => TrackPlayer.skipToNext()}
          hitSlop={12}
          accessibilityLabel="Next track"
          style={styles.ctrl}
        >
          <Ionicons name="play-skip-forward" size={22} color={colors.text} />
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
  ctrl: { padding: 6 },
});
