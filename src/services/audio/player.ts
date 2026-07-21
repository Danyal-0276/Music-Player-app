import TrackPlayer, {
  PlayerCommand,
  RepeatMode,
  type MediaItem,
} from '@rntp/player';
import type { RepeatModeSetting, Track } from '../../types';
import { useSettingsStore } from '../../store/settingsStore';
import { usePlayerUiStore } from '../../store/playerUiStore';
import { useLibraryStore } from '../../store/libraryStore';
import { requestNotificationPermission } from '../permissions';

let setupDone = false;

export function trackToMediaItem(track: Track): MediaItem {
  return {
    mediaId: track.id,
    url: track.uri,
    title: track.title,
    artist: track.artist,
    albumTitle: track.album,
    artworkUrl: track.artworkUri ?? undefined,
    duration: track.durationMs > 0 ? track.durationMs / 1000 : undefined,
  };
}

function mapRepeat(mode: RepeatModeSetting): RepeatMode {
  switch (mode) {
    case 'one':
      return RepeatMode.One;
    case 'all':
      return RepeatMode.All;
    default:
      return RepeatMode.Off;
  }
}

export async function setupAudioPlayer() {
  if (setupDone) return;
  const settings = useSettingsStore.getState().settings;
  await requestNotificationPermission();

  TrackPlayer.setupPlayer({
    contentType: 'music',
    handleAudioBecomingNoisy: settings.pauseOnNoisy,
    android: {
      wakeMode: 'local',
      taskRemovedBehavior: 'continue',
      notification: {
        channelId: 'harmonic_playback',
        channelName: 'Music playback',
        smallIcon: 'ic_launcher',
      },
    },
  });

  TrackPlayer.setCommands({
    capabilities: [
      PlayerCommand.PlayPause,
      PlayerCommand.Next,
      PlayerCommand.Previous,
      PlayerCommand.Seek,
    ],
    handling: 'native',
  });

  TrackPlayer.setRepeatMode(mapRepeat(settings.defaultRepeat));
  TrackPlayer.setShuffleEnabled(settings.defaultShuffle);
  setupDone = true;
}

export async function playTracks(tracks: Track[], startIndex = 0) {
  if (!tracks.length) return;
  await setupAudioPlayer();
  const items = tracks.map(trackToMediaItem);
  TrackPlayer.setMediaItems(items, startIndex);
  usePlayerUiStore.getState().setQueue(tracks);
  TrackPlayer.play();
  const current = tracks[startIndex];
  if (current) {
    void useLibraryStore.getState().recordPlay(current.id);
  }
}

export async function playTrackNext(track: Track) {
  await setupAudioPlayer();
  const index = TrackPlayer.getActiveMediaItemIndex();
  const insertAt = index == null ? 0 : index + 1;
  TrackPlayer.insertMediaItem(insertAt, trackToMediaItem(track));
  const queue = usePlayerUiStore.getState().queue;
  const next = [...queue];
  next.splice(insertAt, 0, track);
  usePlayerUiStore.getState().setQueue(next);
}

export async function addTrackToQueue(track: Track) {
  await setupAudioPlayer();
  TrackPlayer.addMediaItem(trackToMediaItem(track));
  usePlayerUiStore.getState().setQueue([
    ...usePlayerUiStore.getState().queue,
    track,
  ]);
}

export function togglePlayPause() {
  if (TrackPlayer.isPlaying()) {
    TrackPlayer.pause();
  } else {
    TrackPlayer.play();
  }
}

export function cycleRepeatMode(): RepeatMode {
  const current = TrackPlayer.getRepeatMode();
  const next =
    current === RepeatMode.Off
      ? RepeatMode.All
      : current === RepeatMode.All
        ? RepeatMode.One
        : RepeatMode.Off;
  TrackPlayer.setRepeatMode(next);
  return next;
}

export function toggleShuffle(): boolean {
  const next = !TrackPlayer.isShuffleEnabled();
  TrackPlayer.setShuffleEnabled(next);
  return next;
}
