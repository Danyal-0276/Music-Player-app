import React, { useState } from 'react';
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

export function PlaylistPickerSheet() {
  const trackIds = usePlayerUiStore((s) => s.playlistPickTrackIds);
  const setPlaylistPickTrackIds = usePlayerUiStore((s) => s.setPlaylistPickTrackIds);
  const { colors, fonts, radii } = useTheme();
  const insets = useSafeAreaInsets();
  const playlists = useLibraryStore((s) => s.playlists);
  const addTracksToPlaylist = useLibraryStore((s) => s.addTracksToPlaylist);
  const createPlaylist = useLibraryStore((s) => s.createPlaylist);
  const [newName, setNewName] = useState('');

  if (!trackIds || trackIds.length === 0) return null;

  const close = () => {
    setPlaylistPickTrackIds(null);
    setNewName('');
  };

  const addTo = async (playlistId: string) => {
    await addTracksToPlaylist(playlistId, trackIds);
    close();
  };

  return (
    <Modal transparent visible animationType="fade" onRequestClose={close}>
      <Pressable style={[styles.backdrop, { backgroundColor: colors.overlay }]} onPress={close} />
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
        <Text style={{ color: colors.text, fontFamily: fonts.display, fontSize: 20, marginBottom: 4 }}>
          Add to playlist
        </Text>
        <Text style={{ color: colors.textSecondary, fontFamily: fonts.body, marginBottom: 16 }}>
          {trackIds.length} song{trackIds.length === 1 ? '' : 's'} selected
        </Text>

        <FlatList
          data={playlists}
          keyExtractor={(p) => p.id}
          style={{ maxHeight: 240 }}
          ListEmptyComponent={
            <Text style={{ color: colors.textMuted, fontFamily: fonts.body, marginBottom: 8 }}>
              No playlists yet — create one below.
            </Text>
          }
          renderItem={({ item }) => (
            <Pressable style={styles.action} onPress={() => void addTo(item.id)}>
              <Ionicons name="musical-notes" size={20} color={colors.accent} />
              <Text style={{ color: colors.text, fontFamily: fonts.bodyMedium, flex: 1 }}>
                {item.name}
              </Text>
              <Text style={{ color: colors.textMuted, fontFamily: fonts.body, fontSize: 12 }}>
                {item.trackCount}
              </Text>
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
              await addTo(pl.id);
            }}
            style={[styles.createBtn, { backgroundColor: colors.accent, borderRadius: radii.md }]}
          >
            <Text style={{ color: '#fff', fontFamily: fonts.bodyBold }}>Create</Text>
          </Pressable>
        </View>
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
