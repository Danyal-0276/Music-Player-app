import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
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
};

export function SongRow({
  track,
  onPress,
  onLongPress,
  onFavorite,
  onMore,
  selectionMode = false,
  selected = false,
}: Props) {
  const { colors, fonts, densityPadding, rowHeight, artBorderRadius } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={280}
      accessibilityRole="button"
      accessibilityLabel={`${track.title} by ${track.artist}`}
      accessibilityState={selectionMode ? { selected } : undefined}
      style={({ pressed }) => [
        styles.row,
        {
          minHeight: rowHeight,
          paddingVertical: densityPadding,
          opacity: pressed ? 0.72 : 1,
          backgroundColor: selected
            ? colors.accentSoft
            : pressed
              ? colors.accentSoft
              : 'transparent',
        },
      ]}
    >
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
          { borderRadius: artBorderRadius, backgroundColor: colors.surfaceElevated },
        ]}
      >
        {track.artworkUri ? (
          <Image
            source={{ uri: track.artworkUri }}
            style={[styles.art, { borderRadius: artBorderRadius }]}
            contentFit="cover"
          />
        ) : (
          <Ionicons name="musical-notes" size={20} color={colors.textMuted} />
        )}
      </View>
      <View style={styles.meta}>
        <Text
          numberOfLines={1}
          style={[styles.title, { color: colors.text, fontFamily: fonts.bodyMedium }]}
        >
          {track.title}
        </Text>
        <View style={styles.subtitleRow}>
          <Text
            numberOfLines={1}
            style={[styles.subtitle, { color: colors.textSecondary, fontFamily: fonts.body, flex: 1 }]}
          >
            {track.artist}
          </Text>
          <Text style={[styles.duration, { color: colors.textMuted, fontFamily: fonts.body }]}>
            {formatDuration(track.durationMs)}
          </Text>
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

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
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
