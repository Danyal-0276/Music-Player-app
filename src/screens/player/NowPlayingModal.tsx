import React, { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import TrackPlayer, {
  RepeatMode,
  useActiveMediaItem,
  useIsPlaying,
  useProgress,
} from '@rntp/player';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeProvider';
import { usePlayerUiStore } from '../../store/playerUiStore';
import { useLibraryStore } from '../../store/libraryStore';
import {
  cycleRepeatMode,
  togglePlayPause,
  toggleShuffle,
} from '../../services/audio/player';
import { formatDurationSeconds } from '../../utils/tracks';

export function NowPlayingModal() {
  const visible = usePlayerUiStore((s) => s.nowPlayingVisible);
  const setVisible = usePlayerUiStore((s) => s.setNowPlayingVisible);
  const { colors, fonts, artBorderRadius, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const item = useActiveMediaItem();
  const playing = useIsPlaying();
  const { position, duration } = useProgress(250);
  const tracks = useLibraryStore((s) => s.tracks);
  const toggleFavorite = useLibraryStore((s) => s.toggleFavorite);
  const [repeat, setRepeat] = useState(TrackPlayer.getRepeatMode());
  const [shuffle, setShuffle] = useState(TrackPlayer.isShuffleEnabled());

  const track = useMemo(
    () => tracks.find((t) => t.id === item?.mediaId),
    [tracks, item?.mediaId]
  );

  const artSize = Math.min(width - 64, 320);

  if (!item) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={() => setVisible(false)}
      presentationStyle="fullScreen"
    >
      <View
        style={[
          styles.root,
          {
            backgroundColor: colors.background,
            paddingTop: insets.top + 8,
            paddingBottom: insets.bottom + 16,
          },
        ]}
      >
        <View style={styles.header}>
          <Pressable onPress={() => setVisible(false)} hitSlop={12} accessibilityLabel="Close">
            <Ionicons name="chevron-down" size={28} color={colors.text} />
          </Pressable>
          <Text style={{ color: colors.textSecondary, fontFamily: fonts.bodyMedium }}>
            Now Playing
          </Text>
          <Pressable
            onPress={() => track && toggleFavorite(track.id)}
            hitSlop={12}
            accessibilityLabel="Favorite"
          >
            <Ionicons
              name={track?.isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={track?.isFavorite ? colors.accent : colors.text}
            />
          </Pressable>
        </View>

        <View style={styles.artArea}>
          <View
            style={[
              styles.artShadow,
              {
                width: artSize,
                height: artSize,
                borderRadius: artBorderRadius,
                backgroundColor: colors.surfaceElevated,
              },
            ]}
          >
            {item.artworkUrl ? (
              <Image
                source={{ uri: String(item.artworkUrl) }}
                style={{ width: artSize, height: artSize, borderRadius: artBorderRadius }}
                contentFit="cover"
              />
            ) : (
              <View style={styles.artFallback}>
                <Ionicons name="musical-notes" size={64} color={colors.textMuted} />
              </View>
            )}
          </View>
        </View>

        <View style={styles.info}>
          <Text
            numberOfLines={2}
            style={{
              color: colors.text,
              fontFamily: fonts.display,
              fontSize: 26,
              textAlign: 'center',
            }}
          >
            {item.title}
          </Text>
          <Text
            numberOfLines={1}
            style={{
              color: colors.textSecondary,
              fontFamily: fonts.body,
              fontSize: 16,
              textAlign: 'center',
              marginTop: 6,
            }}
          >
            {item.artist}
          </Text>
        </View>

        <View style={styles.progress}>
          <Slider
            style={{ width: '100%', height: 36 }}
            minimumValue={0}
            maximumValue={Math.max(duration, 1)}
            value={position}
            minimumTrackTintColor={colors.accent}
            maximumTrackTintColor={colors.progressTrack}
            thumbTintColor={colors.accent}
            onSlidingComplete={(v) => TrackPlayer.seekTo(v)}
          />
          <View style={styles.times}>
            <Text style={{ color: colors.textMuted, fontFamily: fonts.body, fontSize: 12 }}>
              {formatDurationSeconds(position)}
            </Text>
            <Text style={{ color: colors.textMuted, fontFamily: fonts.body, fontSize: 12 }}>
              {formatDurationSeconds(duration)}
            </Text>
          </View>
        </View>

        <View style={styles.controls}>
          <Pressable
            onPress={() => setShuffle(toggleShuffle())}
            accessibilityLabel="Shuffle"
            style={styles.sideBtn}
          >
            <Ionicons
              name="shuffle"
              size={24}
              color={shuffle ? colors.accent : colors.textSecondary}
            />
          </Pressable>
          <Pressable
            onPress={() => TrackPlayer.skipToPrevious()}
            accessibilityLabel="Previous"
            style={styles.mainSide}
          >
            <Ionicons name="play-skip-back" size={32} color={colors.text} />
          </Pressable>
          <Pressable
            onPress={togglePlayPause}
            accessibilityLabel={playing ? 'Pause' : 'Play'}
            style={[
              styles.playBtn,
              { backgroundColor: colors.accent, shadowColor: isDark ? '#000' : colors.accent },
            ]}
          >
            <Ionicons name={playing ? 'pause' : 'play'} size={34} color="#fff" />
          </Pressable>
          <Pressable
            onPress={() => TrackPlayer.skipToNext()}
            accessibilityLabel="Next"
            style={styles.mainSide}
          >
            <Ionicons name="play-skip-forward" size={32} color={colors.text} />
          </Pressable>
          <Pressable
            onPress={() => setRepeat(cycleRepeatMode())}
            accessibilityLabel="Repeat"
            style={styles.sideBtn}
          >
            <Ionicons
              name={repeat === RepeatMode.One ? 'repeat-outline' : 'repeat'}
              size={24}
              color={repeat === RepeatMode.Off ? colors.textSecondary : colors.accent}
            />
            {repeat === RepeatMode.One ? (
              <Text style={[styles.oneBadge, { color: colors.accent }]}>1</Text>
            ) : null}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 24 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  artArea: { alignItems: 'center', marginVertical: 12 },
  artShadow: {
    overflow: 'hidden',
    elevation: 8,
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  artFallback: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  info: { marginTop: 20, marginBottom: 8 },
  progress: { marginTop: 12 },
  times: { flexDirection: 'row', justifyContent: 'space-between' },
  barTrack: { height: 4, borderRadius: 2, overflow: 'hidden', marginVertical: 12 },
  barFill: { height: '100%' },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 28,
    paddingHorizontal: 8,
  },
  playBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  mainSide: { padding: 8 },
  sideBtn: { padding: 8, position: 'relative' },
  oneBadge: { position: 'absolute', right: 2, top: 2, fontSize: 10, fontWeight: '700' },
});
