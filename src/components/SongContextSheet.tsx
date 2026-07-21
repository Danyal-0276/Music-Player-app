import React, { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { usePlayerUiStore } from '../store/playerUiStore';
import { useLibraryStore } from '../store/libraryStore';
import { addTrackToQueue, playTrackNext } from '../services/audio/player';

export function SongContextSheet() {
  const track = usePlayerUiStore((s) => s.contextTrack);
  const setContextTrack = usePlayerUiStore((s) => s.setContextTrack);
  const { colors, fonts, radii } = useTheme();
  const insets = useSafeAreaInsets();
  const playlists = useLibraryStore((s) => s.playlists);
  const toggleFavorite = useLibraryStore((s) => s.toggleFavorite);
  const addToPlaylist = useLibraryStore((s) => s.addToPlaylist);
  const createPlaylist = useLibraryStore((s) => s.createPlaylist);
  const [pickingPlaylist, setPickingPlaylist] = useState(false);
  const [newName, setNewName] = useState('');

  const actions = useMemo(() => {
    if (!track) return [];
    return [
      {
        key: 'next',
        label: 'Play next',
        icon: 'play-skip-forward-outline' as const,
        onPress: async () => {
          await playTrackNext(track);
          setContextTrack(null);
        },
      },
      {
        key: 'queue',
        label: 'Add to queue',
        icon: 'list-outline' as const,
        onPress: async () => {
          await addTrackToQueue(track);
          setContextTrack(null);
        },
      },
      {
        key: 'fav',
        label: track.isFavorite ? 'Remove from favorites' : 'Add to favorites',
        icon: track.isFavorite ? ('heart' as const) : ('heart-outline' as const),
        onPress: async () => {
          await toggleFavorite(track.id);
          setContextTrack(null);
        },
      },
      {
        key: 'playlist',
        label: 'Add to playlist',
        icon: 'add-circle-outline' as const,
        onPress: () => setPickingPlaylist(true),
      },
    ];
  }, [track, toggleFavorite, setContextTrack]);

  if (!track) return null;

  return (
    <Modal transparent visible animationType="fade" onRequestClose={() => setContextTrack(null)}>
      <Pressable style={[styles.backdrop, { backgroundColor: colors.overlay }]} onPress={() => setContextTrack(null)} />
      <View
        style={[
          styles.sheet,
          {
            backgroundColor: colors.surface,
            paddingBottom: insets.bottom + 16,
            borderTopLeftRadius: radii.xl,
            borderTopRightRadius: radii.xl,
          },
        ]}
      >
        <Text style={{ color: colors.text, fontFamily: fonts.display, fontSize: 18, marginBottom: 4 }}>
          {track.title}
        </Text>
        <Text style={{ color: colors.textSecondary, fontFamily: fonts.body, marginBottom: 16 }}>
          {track.artist}
        </Text>

        {!pickingPlaylist ? (
          actions.map((a) => (
            <Pressable key={a.key} onPress={a.onPress} style={styles.action}>
              <Ionicons name={a.icon} size={22} color={colors.text} />
              <Text style={{ color: colors.text, fontFamily: fonts.bodyMedium, fontSize: 16 }}>
                {a.label}
              </Text>
            </Pressable>
          ))
        ) : (
          <View>
            <Text style={{ color: colors.textSecondary, fontFamily: fonts.bodyMedium, marginBottom: 8 }}>
              Choose a playlist
            </Text>
            <FlatList
              data={playlists}
              keyExtractor={(p) => p.id}
              style={{ maxHeight: 200 }}
              ListEmptyComponent={
                <Text style={{ color: colors.textMuted, fontFamily: fonts.body }}>
                  No playlists yet
                </Text>
              }
              renderItem={({ item }) => (
                <Pressable
                  style={styles.action}
                  onPress={async () => {
                    await addToPlaylist(item.id, track.id);
                    setContextTrack(null);
                    setPickingPlaylist(false);
                  }}
                >
                  <Ionicons name="musical-notes" size={20} color={colors.accent} />
                  <Text style={{ color: colors.text, fontFamily: fonts.bodyMedium }}>{item.name}</Text>
                </Pressable>
              )}
            />
            <View style={styles.newRow}>
              <TextInput
                value={newName}
                onChangeText={setNewName}
                placeholder="New playlist name"
                placeholderTextColor={colors.textMuted}
                style={[
                  styles.input,
                  {
                    color: colors.text,
                    borderColor: colors.border,
                    backgroundColor: colors.backgroundSecondary,
                    fontFamily: fonts.body,
                  },
                ]}
              />
              <Pressable
                onPress={async () => {
                  const name = newName.trim();
                  if (!name) {
                    Alert.alert('Name required', 'Enter a playlist name.');
                    return;
                  }
                  const pl = await createPlaylist(name);
                  await addToPlaylist(pl.id, track.id);
                  setNewName('');
                  setPickingPlaylist(false);
                  setContextTrack(null);
                }}
                style={[styles.createBtn, { backgroundColor: colors.accent, borderRadius: radii.md }]}
              >
                <Text style={{ color: '#fff', fontFamily: fonts.bodyBold }}>Create</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFill },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
  },
  newRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  createBtn: { paddingHorizontal: 16, justifyContent: 'center', paddingVertical: 10 },
});
