import React, { useCallback, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeProvider';
import { useLibraryStore } from '../../store/libraryStore';
import { EmptyState } from '../../components/EmptyState';
import type { LibraryStackParamList } from '../../navigation/types';

export function PlaylistsScreen() {
  const { colors, fonts, radii } = useTheme();
  const insets = useSafeAreaInsets();
  const playlists = useLibraryStore((s) => s.playlists);
  const loadPlaylists = useLibraryStore((s) => s.loadPlaylists);
  const createPlaylist = useLibraryStore((s) => s.createPlaylist);
  const renamePlaylist = useLibraryStore((s) => s.renamePlaylist);
  const deletePlaylist = useLibraryStore((s) => s.deletePlaylist);
  const [name, setName] = useState('');
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const navigation =
    useNavigation<NativeStackNavigationProp<LibraryStackParamList>>();

  useFocusEffect(
    useCallback(() => {
      void loadPlaylists();
    }, [loadPlaylists])
  );

  const onCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    await createPlaylist(trimmed);
    setName('');
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <Text style={[styles.title, { color: colors.text, fontFamily: fonts.display }]}>Playlists</Text>

      <View style={styles.createRow}>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="New playlist"
          placeholderTextColor={colors.textMuted}
          style={[
            styles.input,
            {
              color: colors.text,
              backgroundColor: colors.surfaceElevated,
              borderRadius: radii.lg,
              fontFamily: fonts.body,
            },
          ]}
        />
        <Pressable
          onPress={() => void onCreate()}
          style={[styles.addBtn, { backgroundColor: colors.accent, borderRadius: radii.lg }]}
        >
          <Ionicons name="add" size={22} color="#fff" />
        </Pressable>
      </View>

      {playlists.length === 0 ? (
        <EmptyState
          icon="list-outline"
          title="No playlists yet"
          message="Create one above, then add songs from any track menu."
        />
      ) : (
        <FlashList
          data={playlists}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 120 }}
          renderItem={({ item }) => (
            <Pressable
              style={styles.row}
              onPress={() =>
                navigation.navigate('PlaylistDetail', {
                  playlistId: item.id,
                  playlistName: item.name,
                })
              }
              onLongPress={() => {
                Alert.alert(item.name, undefined, [
                  {
                    text: 'Rename',
                    onPress: () => {
                      setRenameId(item.id);
                      setRenameValue(item.name);
                    },
                  },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => void deletePlaylist(item.id),
                  },
                  { text: 'Cancel', style: 'cancel' },
                ]);
              }}
            >
              <View
                style={[
                  styles.icon,
                  { backgroundColor: colors.accentSoft, borderRadius: radii.md },
                ]}
              >
                <Ionicons name="musical-notes" size={20} color={colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontFamily: fonts.bodyMedium }}>{item.name}</Text>
                <Text style={{ color: colors.textSecondary, fontFamily: fonts.body, fontSize: 13 }}>
                  {item.trackCount} songs
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>
          )}
        />
      )}

      <Modal visible={!!renameId} transparent animationType="fade">
        <View style={[styles.modalBackdrop, { backgroundColor: colors.overlay }]}>
          <View
            style={[styles.modalCard, { backgroundColor: colors.surface, borderRadius: radii.lg }]}
          >
            <Text
              style={{
                color: colors.text,
                fontFamily: fonts.display,
                fontSize: 18,
                marginBottom: 12,
              }}
            >
              Rename playlist
            </Text>
            <TextInput
              value={renameValue}
              onChangeText={setRenameValue}
              style={[
                styles.input,
                {
                  color: colors.text,
                  backgroundColor: colors.backgroundSecondary,
                  borderRadius: radii.md,
                  fontFamily: fonts.body,
                  marginBottom: 12,
                },
              ]}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
              <Pressable onPress={() => setRenameId(null)}>
                <Text style={{ color: colors.textSecondary, fontFamily: fonts.bodyMedium }}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={async () => {
                  if (renameId && renameValue.trim()) {
                    await renamePlaylist(renameId, renameValue.trim());
                  }
                  setRenameId(null);
                }}
              >
                <Text style={{ color: colors.accent, fontFamily: fonts.bodyBold }}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  title: { fontSize: 28, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  createRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 8,
  },
  input: { flex: 1, paddingHorizontal: 14, paddingVertical: 12 },
  addBtn: { width: 48, alignItems: 'center', justifyContent: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  icon: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  modalBackdrop: { flex: 1, justifyContent: 'center', padding: 24 },
  modalCard: { padding: 20 },
});
