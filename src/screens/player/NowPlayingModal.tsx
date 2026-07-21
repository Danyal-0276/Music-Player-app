import React, { useEffect, useState } from 'react';
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
  useIsPlaying,
  useProgress,
} from '@rntp/player';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeProvider';
import { usePlayerUiStore } from '../../store/playerUiStore';
import { useLibraryStore } from '../../store/libraryStore';
import { useNowPlaying } from '../../hooks/useNowPlaying';
import {
  cycleRepeatMode,
  togglePlayPause,
  toggleShuffle,
} from '../../services/audio/player';
import { formatDurationSeconds } from '../../utils/tracks';

function ControlIcon({
  active,
  onPress,
  accessibilityLabel,
  children,
  accent,
  soft,
}: {
  active: boolean;
  onPress: () => void;
  accessibilityLabel: string;
  children: React.ReactNode;
  accent: string;
  soft: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected: active }}
      style={({ pressed }) => [
        styles.sideBtn,
        active && { backgroundColor: soft, borderColor: accent },
        { opacity: pressed ? 0.7 : 1, transform: [{ scale: pressed ? 0.92 : 1 }] },
      ]}
    >
      {children}
    </Pressable>
  );
}

function cleanMeta(value: string | undefined | null, fallback: string) {
  const v = (value ?? '').trim();
  if (!v || v === '<unknown>' || v.toLowerCase() === 'unknown') return fallback;
  return v;
}

export function NowPlayingModal() {
  const visible = usePlayerUiStore((s) => s.nowPlayingVisible);
  const setVisible = usePlayerUiStore((s) => s.setNowPlayingVisible);
  const toggleFavorite = useLibraryStore((s) => s.toggleFavorite);
  const { colors, fonts, artBorderRadius, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { track, activeId } = useNowPlaying();
  const playing = useIsPlaying();
  const { position, duration } = useProgress(250);
  const [repeat, setRepeat] = useState(RepeatMode.Off);
  const [shuffle, setShuffle] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setRepeat(TrackPlayer.getRepeatMode());
    setShuffle(TrackPlayer.isShuffleEnabled());
  }, [visible]);

  // Push clean library metadata back to the native player on track change.
  useEffect(() => {
    if (!track) return;
    const index = TrackPlayer.getActiveMediaItemIndex();
    if (index == null) return;
    try {
      TrackPlayer.updateMetadata(index, {
        title: track.title,
        artist: cleanMeta(track.artist, 'Unknown Artist'),
        albumTitle: cleanMeta(track.album, ''),
        artworkUrl: track.artworkUri ?? undefined,
      });
    } catch {
      // Native may not be ready yet.
    }
  }, [track?.id]);

  const artSize = Math.min(width - 64, 320);
  const favorited = !!track?.isFavorite;
  const repeatOn = repeat !== RepeatMode.Off;

  if (!activeId && !track) return null;

  const title = cleanMeta(track?.title, 'Unknown');
  const artist = cleanMeta(track?.artist, 'Unknown Artist');
  const artworkUri = track?.artworkUri;

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
          <Pressable
            onPress={() => setVisible(false)}
            hitSlop={12}
            accessibilityLabel="Close"
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <Ionicons name="chevron-down" size={28} color={colors.text} />
          </Pressable>
          <Text style={{ color: colors.textSecondary, fontFamily: fonts.bodyMedium }}>
            Now Playing
          </Text>
          <Pressable
            onPress={() => track && void toggleFavorite(track.id)}
            hitSlop={8}
            accessibilityLabel={favorited ? 'Remove from favorites' : 'Add to favorites'}
            accessibilityState={{ selected: favorited }}
            style={({ pressed }) => [
              styles.favBtn,
              favorited && { backgroundColor: colors.accentSoft, borderColor: colors.accent },
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Ionicons
              name={favorited ? 'heart' : 'heart-outline'}
              size={22}
              color={favorited ? colors.accent : colors.text}
            />
          </Pressable>
        </View>

        <View style={styles.artArea}>
          <View
            key={`art-${activeId ?? 'none'}`}
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
            {artworkUri ? (
              <Image
                source={{ uri: artworkUri }}
                style={{ width: artSize, height: artSize, borderRadius: artBorderRadius }}
                contentFit="cover"
                recyclingKey={activeId ?? artworkUri}
                transition={200}
              />
            ) : (
              <View style={styles.artFallback}>
                <Ionicons name="musical-notes" size={64} color={colors.textMuted} />
              </View>
            )}
          </View>
        </View>

        <View key={`meta-${activeId ?? 'none'}`} style={styles.info}>
          <Text
            numberOfLines={2}
            style={{
              color: colors.text,
              fontFamily: fonts.display,
              fontSize: 26,
              textAlign: 'center',
            }}
          >
            {title}
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
            {artist}
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
          <ControlIcon
            active={shuffle}
            onPress={() => setShuffle(toggleShuffle())}
            accessibilityLabel={shuffle ? 'Shuffle on' : 'Shuffle off'}
            accent={colors.accent}
            soft={colors.accentSoft}
          >
            <Ionicons
              name="shuffle"
              size={24}
              color={shuffle ? colors.accent : colors.textSecondary}
            />
          </ControlIcon>

          <Pressable
            onPress={() => TrackPlayer.skipToPrevious()}
            accessibilityLabel="Previous"
            style={({ pressed }) => [styles.mainSide, { opacity: pressed ? 0.55 : 1 }]}
          >
            <Ionicons name="play-skip-back" size={32} color={colors.text} />
          </Pressable>

          <Pressable
            onPress={togglePlayPause}
            accessibilityLabel={playing ? 'Pause' : 'Play'}
            style={({ pressed }) => [
              styles.playBtn,
              {
                backgroundColor: colors.accent,
                shadowColor: isDark ? '#000' : colors.accent,
                transform: [{ scale: pressed ? 0.94 : 1 }],
              },
            ]}
          >
            <Ionicons name={playing ? 'pause' : 'play'} size={34} color="#fff" />
          </Pressable>

          <Pressable
            onPress={() => TrackPlayer.skipToNext()}
            accessibilityLabel="Next"
            style={({ pressed }) => [styles.mainSide, { opacity: pressed ? 0.55 : 1 }]}
          >
            <Ionicons name="play-skip-forward" size={32} color={colors.text} />
          </Pressable>

          <ControlIcon
            active={repeatOn}
            onPress={() => setRepeat(cycleRepeatMode())}
            accessibilityLabel={
              repeat === RepeatMode.One
                ? 'Repeat one'
                : repeat === RepeatMode.All
                  ? 'Repeat all'
                  : 'Repeat off'
            }
            accent={colors.accent}
            soft={colors.accentSoft}
          >
            <Ionicons name="repeat" size={24} color={repeatOn ? colors.accent : colors.textSecondary} />
            {repeat === RepeatMode.One ? (
              <View style={[styles.oneBadge, { backgroundColor: colors.accent }]}>
                <Text style={styles.oneBadgeText}>1</Text>
              </View>
            ) : null}
          </ControlIcon>
        </View>

        <View style={styles.statusRow}>
          <Text
            style={{
              color: shuffle ? colors.accent : colors.textMuted,
              fontFamily: fonts.bodyMedium,
              fontSize: 12,
            }}
          >
            {shuffle ? 'Shuffle on' : 'Shuffle off'}
          </Text>
          <Text
            style={{
              color: repeatOn ? colors.accent : colors.textMuted,
              fontFamily: fonts.bodyMedium,
              fontSize: 12,
            }}
          >
            {repeat === RepeatMode.One
              ? 'Repeat one'
              : repeat === RepeatMode.All
                ? 'Repeat all'
                : 'Repeat off'}
          </Text>
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
  favBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
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
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 28,
    paddingHorizontal: 4,
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
  sideBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
    position: 'relative',
  },
  oneBadge: {
    position: 'absolute',
    right: 4,
    top: 4,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  oneBadgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  statusRow: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
});
