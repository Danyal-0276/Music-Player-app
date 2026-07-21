import React, { memo, useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  cancelAnimation,
  type SharedValue,
} from 'react-native-reanimated';
import type { Track } from '../types';
import { useTheme } from '../theme/ThemeProvider';
import { formatDuration } from '../utils/tracks';

type Props = {
  track: Track;
  onPress: () => void;
  onLongPress?: () => void;
  onFavorite?: () => void;
  onMore?: () => void;
  selectionMode?: boolean;
  selected?: boolean;
  /** Pass from parent so only the active row re-renders on track change. */
  isActive?: boolean;
  isPlaying?: boolean;
};

function PlayingBars({ color, active }: { color: string; active: boolean }) {
  const a = useSharedValue(0.4);
  const b = useSharedValue(0.7);
  const c = useSharedValue(0.5);

  useEffect(() => {
    if (!active) {
      cancelAnimation(a);
      cancelAnimation(b);
      cancelAnimation(c);
      a.value = withTiming(0.35, { duration: 160 });
      b.value = withTiming(0.55, { duration: 160 });
      c.value = withTiming(0.4, { duration: 160 });
      return;
    }
    const pulse = (sv: SharedValue<number>, min: number, max: number, ms: number) => {
      sv.value = withRepeat(
        withSequence(
          withTiming(max, { duration: ms, easing: Easing.inOut(Easing.ease) }),
          withTiming(min, { duration: ms, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    };
    pulse(a, 0.3, 1, 320);
    pulse(b, 0.45, 1, 260);
    pulse(c, 0.25, 0.95, 300);
  }, [active, a, b, c]);

  const barA = useAnimatedStyle(() => ({ height: 4 + a.value * 12 }));
  const barB = useAnimatedStyle(() => ({ height: 4 + b.value * 12 }));
  const barC = useAnimatedStyle(() => ({ height: 4 + c.value * 12 }));

  return (
    <View style={styles.bars}>
      <Animated.View style={[styles.bar, { backgroundColor: color }, barA]} />
      <Animated.View style={[styles.bar, { backgroundColor: color }, barB]} />
      <Animated.View style={[styles.bar, { backgroundColor: color }, barC]} />
    </View>
  );
}

function SongRowComponent({
  track,
  onPress,
  onLongPress,
  onFavorite,
  onMore,
  selectionMode = false,
  selected = false,
  isActive = false,
  isPlaying = false,
}: Props) {
  const { colors, fonts, densityPadding, rowHeight, artBorderRadius, reduceMotion } = useTheme();
  const highlighted = isActive || selected;
  const highlightAnim = useSharedValue(highlighted ? 1 : 0);

  useEffect(() => {
    highlightAnim.value = withTiming(highlighted ? 1 : 0, { duration: reduceMotion ? 0 : 240 });
  }, [highlighted, highlightAnim, reduceMotion]);

  const highlightStyle = useAnimatedStyle(() => ({
    opacity: highlightAnim.value,
  }));

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={280}
      accessibilityRole="button"
      accessibilityLabel={`${track.title} by ${track.artist}${isActive ? ', now playing' : ''}`}
      accessibilityState={selectionMode ? { selected } : isActive ? { selected: true } : undefined}
      style={({ pressed }) => [
        styles.row,
        {
          minHeight: rowHeight,
          paddingVertical: densityPadding,
          opacity: pressed ? 0.78 : 1,
        },
      ]}
    >
      <Animated.View
        pointerEvents="none"
        style={[styles.highlightBg, { backgroundColor: colors.accentSoft }, highlightStyle]}
      />
      <Animated.View
        pointerEvents="none"
        style={[styles.accentBar, { backgroundColor: colors.accent }, highlightStyle]}
      />

      {selectionMode ? (
        <View
          style={[
            styles.check,
            {
              borderColor: selected ? colors.accent : colors.border,
              backgroundColor: selected ? colors.accent : 'transparent',
            },
          ]}
        >
          {selected ? <Ionicons name="checkmark" size={14} color="#fff" /> : null}
        </View>
      ) : null}

      <View
        style={[
          styles.artWrap,
          {
            borderRadius: artBorderRadius,
            backgroundColor: colors.surfaceElevated,
          },
        ]}
      >
        {track.artworkUri ? (
          <Image
            source={{ uri: track.artworkUri }}
            style={[styles.art, { borderRadius: artBorderRadius }]}
            contentFit="cover"
            recyclingKey={track.id}
            transition={180}
          />
        ) : (
          <Ionicons name="musical-notes" size={20} color={colors.textMuted} />
        )}
        {isActive && !selectionMode ? (
          <View style={[styles.artOverlay, { borderRadius: artBorderRadius }]}>
            <PlayingBars color="#fff" active={isPlaying && !reduceMotion} />
          </View>
        ) : null}
      </View>

      <View style={styles.meta}>
        <Text
          numberOfLines={1}
          style={[
            styles.title,
            {
              color: highlighted ? colors.accent : colors.text,
              fontFamily: fonts.bodyMedium,
            },
          ]}
        >
          {track.title}
        </Text>
        <View style={styles.subtitleRow}>
          <Text
            numberOfLines={1}
            style={[
              styles.subtitle,
              {
                color: isActive ? colors.accent : colors.textSecondary,
                fontFamily: fonts.body,
                flex: 1,
                opacity: isActive ? 0.85 : 1,
              },
            ]}
          >
            {isActive ? (isPlaying ? 'Playing · ' : 'Paused · ') : ''}
            {track.artist}
          </Text>
          {isActive && !selectionMode ? (
            <Ionicons
              name={isPlaying ? 'musical-notes' : 'pause'}
              size={14}
              color={colors.accent}
            />
          ) : (
            <Text style={[styles.duration, { color: colors.textMuted, fontFamily: fonts.body }]}>
              {formatDuration(track.durationMs)}
            </Text>
          )}
        </View>
      </View>

      {!selectionMode && onFavorite ? (
        <Pressable
          onPress={onFavorite}
          hitSlop={10}
          accessibilityLabel={track.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          style={styles.iconBtn}
        >
          <Ionicons
            name={track.isFavorite ? 'heart' : 'heart-outline'}
            size={20}
            color={track.isFavorite ? colors.accent : colors.textMuted}
          />
        </Pressable>
      ) : null}
      {!selectionMode && onMore ? (
        <Pressable onPress={onMore} hitSlop={10} accessibilityLabel="More options" style={styles.iconBtn}>
          <Ionicons name="ellipsis-vertical" size={18} color={colors.textMuted} />
        </Pressable>
      ) : null}
    </Pressable>
  );
}

export const SongRow = memo(SongRowComponent, (prev, next) => {
  return (
    prev.track.id === next.track.id &&
    prev.track.title === next.track.title &&
    prev.track.artist === next.track.artist &&
    prev.track.artworkUri === next.track.artworkUri &&
    prev.track.durationMs === next.track.durationMs &&
    prev.track.isFavorite === next.track.isFavorite &&
    prev.selectionMode === next.selectionMode &&
    prev.selected === next.selected &&
    prev.isActive === next.isActive &&
    prev.isPlaying === next.isPlaying
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
    overflow: 'hidden',
  },
  highlightBg: {
    ...StyleSheet.absoluteFill,
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 8,
    bottom: 8,
    width: 3,
    borderRadius: 2,
  },
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  artWrap: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  art: { width: 48, height: 48 },
  artOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    height: 16,
  },
  bar: {
    width: 3,
    borderRadius: 2,
  },
  meta: { flex: 1, minWidth: 0 },
  title: { fontSize: 15, marginBottom: 2 },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subtitle: { fontSize: 13 },
  duration: { fontSize: 12, flexShrink: 0 },
  iconBtn: { padding: 4, flexShrink: 0 },
});
