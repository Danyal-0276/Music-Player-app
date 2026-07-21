import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useIsPlaying } from '@rntp/player';
import { useTheme } from '../theme/ThemeProvider';
import { usePlayerUiStore } from '../store/playerUiStore';
import { useNowPlaying } from '../hooks/useNowPlaying';
import { togglePlayPause } from '../services/audio/player';
import TrackPlayer from '@rntp/player';

type Props = {
  /** When true, sits above the tab dock (no safe-area padding). */
  embedded?: boolean;
};

function cleanMeta(value: string | undefined | null, fallback: string) {
  const v = (value ?? '').trim();
  if (!v || v === '<unknown>' || v.toLowerCase() === 'unknown') return fallback;
  return v;
}

export function MiniPlayer({ embedded = false }: Props) {
  const { colors, fonts, artBorderRadius, reduceMotion, isDark } = useTheme();
  const { track, activeId } = useNowPlaying();
  const playing = useIsPlaying();
  const setNowPlayingVisible = usePlayerUiStore((s) => s.setNowPlayingVisible);

  if (!track && !activeId) return null;

  const title = cleanMeta(track?.title, 'Unknown');
  const artist = cleanMeta(track?.artist, 'Unknown Artist');
  const artworkUri = track?.artworkUri;
  const mediaKey = activeId ?? track?.id ?? 'track';

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
          {artworkUri ? (
            <Image
              key={mediaKey}
              source={{ uri: artworkUri }}
              style={[styles.artImg, { borderRadius: artBorderRadius }]}
              contentFit="cover"
              recyclingKey={mediaKey}
              transition={180}
            />
          ) : (
            <Ionicons name="musical-note" size={18} color={colors.textMuted} />
          )}
        </View>
        <View style={styles.meta} key={`mini-meta-${mediaKey}`}>
          <Text numberOfLines={1} style={{ color: colors.text, fontFamily: fonts.bodyMedium, fontSize: 14 }}>
            {title}
          </Text>
          <Text numberOfLines={1} style={{ color: colors.textSecondary, fontFamily: fonts.body, fontSize: 12 }}>
            {artist}
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
