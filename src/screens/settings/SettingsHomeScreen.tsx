import React, { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import Constants from 'expo-constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import { useSettingsStore } from '../../store/settingsStore';
import { useLibraryStore } from '../../store/libraryStore';
import {
  checkAudioPermission,
  checkNotificationPermission,
  openAppSettings,
  requestAudioPermission,
  requestNotificationPermission,
  type PermissionStatus,
} from '../../services/permissions';
import { ACCENT_SWATCHES } from '../../theme/tokens';
import type { AccentId, ThemeMode } from '../../types';

function Row({
  label,
  value,
  onPress,
  right,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
  right?: React.ReactNode;
}) {
  const { colors, fonts } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress && !right}
      style={[styles.row, { borderBottomColor: colors.border }]}
    >
      <Text style={{ color: colors.text, fontFamily: fonts.bodyMedium, flex: 1 }}>{label}</Text>
      {value ? (
        <Text style={{ color: colors.textSecondary, fontFamily: fonts.body, marginRight: 6 }}>
          {value}
        </Text>
      ) : null}
      {right}
      {onPress ? <Ionicons name="chevron-forward" size={16} color={colors.textMuted} /> : null}
    </Pressable>
  );
}

export function SettingsHomeScreen() {
  const { colors, fonts, radii } = useTheme();
  const insets = useSafeAreaInsets();
  const settings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const refreshLibrary = useLibraryStore((s) => s.refreshLibrary);
  const clearCache = useLibraryStore((s) => s.clearCache);
  const isScanning = useLibraryStore((s) => s.isScanning);
  const lastScanAt = useLibraryStore((s) => s.lastScanAt);
  const tracks = useLibraryStore((s) => s.tracks);
  const [audioPerm, setAudioPerm] = useState<PermissionStatus>('undetermined');
  const [notifPerm, setNotifPerm] = useState<PermissionStatus>('undetermined');

  useEffect(() => {
    void checkAudioPermission().then(setAudioPerm);
    void checkNotificationPermission().then(setNotifPerm);
  }, []);

  const themeLabel: Record<ThemeMode, string> = {
    system: 'System',
    light: 'Light',
    dark: 'Dark',
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 140 }}
    >
      <Text style={[styles.title, { color: colors.text, fontFamily: fonts.display }]}>Settings</Text>

      <Text style={[styles.section, { color: colors.textSecondary, fontFamily: fonts.bodyMedium }]}>
        Appearance
      </Text>
      <View style={[styles.card, { backgroundColor: colors.surface, borderRadius: radii.lg }]}>
        <Text style={[styles.subLabel, { color: colors.textMuted, fontFamily: fonts.body }]}>
          Theme
        </Text>
        <View style={styles.segment}>
          {(['system', 'light', 'dark'] as ThemeMode[]).map((mode) => {
            const active = settings.themeMode === mode;
            return (
              <Pressable
                key={mode}
                onPress={() => updateSettings({ themeMode: mode })}
                style={[
                  styles.segBtn,
                  {
                    backgroundColor: active ? colors.accent : colors.accentSoft,
                    borderRadius: radii.md,
                  },
                ]}
              >
                <Text
                  style={{
                    color: active ? '#fff' : colors.accent,
                    fontFamily: fonts.bodyMedium,
                    fontSize: 13,
                  }}
                >
                  {themeLabel[mode]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text
          style={[
            styles.subLabel,
            { color: colors.textMuted, fontFamily: fonts.body, marginTop: 16 },
          ]}
        >
          Accent
        </Text>
        <View style={styles.swatches}>
          {(Object.keys(ACCENT_SWATCHES) as AccentId[]).map((id) => {
            const swatch = ACCENT_SWATCHES[id];
            const active = settings.accentId === id;
            return (
              <Pressable
                key={id}
                onPress={() => updateSettings({ accentId: id })}
                accessibilityLabel={swatch.label}
                style={[
                  styles.swatch,
                  {
                    backgroundColor: swatch.light,
                    borderWidth: active ? 3 : 0,
                    borderColor: colors.text,
                  },
                ]}
              />
            );
          })}
        </View>

        <Row
          label="Player artwork"
          value={settings.artStyle === 'circle' ? 'Circle' : 'Rounded'}
          onPress={() =>
            updateSettings({
              artStyle: settings.artStyle === 'circle' ? 'rounded' : 'circle',
            })
          }
        />
        <Row
          label="Density"
          value={settings.density === 'compact' ? 'Compact' : 'Comfortable'}
          onPress={() =>
            updateSettings({
              density: settings.density === 'compact' ? 'comfortable' : 'compact',
            })
          }
        />
        <Row
          label="Album layout"
          value={settings.albumLayout === 'grid' ? 'Grid' : 'List'}
          onPress={() =>
            updateSettings({
              albumLayout: settings.albumLayout === 'grid' ? 'list' : 'grid',
            })
          }
        />
        <Row
          label="Reduce motion"
          right={
            <Switch
              value={settings.reduceMotion}
              onValueChange={(v) => updateSettings({ reduceMotion: v })}
              trackColor={{ true: colors.accent }}
            />
          }
        />
      </View>

      <Text style={[styles.section, { color: colors.textSecondary, fontFamily: fonts.bodyMedium }]}>
        Library & scanning
      </Text>
      <View style={[styles.card, { backgroundColor: colors.surface, borderRadius: radii.lg }]}>
        <Row
          label="Rescan library"
          value={
            isScanning
              ? 'Scanning…'
              : lastScanAt
                ? `${tracks.length} songs`
                : 'Never'
          }
          onPress={() => void refreshLibrary(true)}
        />
        <Row
          label="Ignore short tracks"
          right={
            <Switch
              value={settings.ignoreShortTracks}
              onValueChange={(v) => updateSettings({ ignoreShortTracks: v })}
              trackColor={{ true: colors.accent }}
            />
          }
        />
        <Row
          label="Clear library cache"
          onPress={() => {
            Alert.alert(
              'Clear cache?',
              'This removes Harmonic’s song index only — not your audio files. Next open will rescan.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Clear',
                  style: 'destructive',
                  onPress: () => void clearCache(),
                },
              ]
            );
          }}
        />
      </View>

      <Text style={[styles.section, { color: colors.textSecondary, fontFamily: fonts.bodyMedium }]}>
        Playback
      </Text>
      <View style={[styles.card, { backgroundColor: colors.surface, borderRadius: radii.lg }]}>
        <Row
          label="Pause when headphones disconnect"
          right={
            <Switch
              value={settings.pauseOnNoisy}
              onValueChange={(v) => updateSettings({ pauseOnNoisy: v })}
              trackColor={{ true: colors.accent }}
            />
          }
        />
        <Row
          label="Default shuffle"
          right={
            <Switch
              value={settings.defaultShuffle}
              onValueChange={(v) => updateSettings({ defaultShuffle: v })}
              trackColor={{ true: colors.accent }}
            />
          }
        />
        <Row
          label="Default repeat"
          value={settings.defaultRepeat}
          onPress={() => {
            const order = ['off', 'all', 'one'] as const;
            const idx = order.indexOf(settings.defaultRepeat);
            updateSettings({ defaultRepeat: order[(idx + 1) % order.length] });
          }}
        />
      </View>

      <Text style={[styles.section, { color: colors.textSecondary, fontFamily: fonts.bodyMedium }]}>
        Permissions
      </Text>
      <View style={[styles.card, { backgroundColor: colors.surface, borderRadius: radii.lg }]}>
        <Row
          label="Music library"
          value={audioPerm}
          onPress={() => {
            void (async () => {
              const status = await requestAudioPermission();
              setAudioPerm(status);
              if (status === 'blocked') await openAppSettings();
            })();
          }}
        />
        <Row
          label="Notifications"
          value={notifPerm}
          onPress={() => {
            void (async () => {
              const status = await requestNotificationPermission();
              setNotifPerm(status);
              if (status === 'denied') await openAppSettings();
            })();
          }}
        />
        <Row label="Open system settings" onPress={() => void openAppSettings()} />
      </View>

      <Text style={[styles.section, { color: colors.textSecondary, fontFamily: fonts.bodyMedium }]}>
        About
      </Text>
      <View style={[styles.card, { backgroundColor: colors.surface, borderRadius: radii.lg }]}>
        <Row label="App" value="Harmonic" />
        <Row label="Version" value={Constants.expoConfig?.version ?? '1.0.0'} />
        <Text
          style={{
            color: colors.textSecondary,
            fontFamily: fonts.body,
            padding: 16,
            lineHeight: 20,
          }}
        >
          Offline local music player — your files stay on this device. No account, no cloud sync.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 32, paddingHorizontal: 20, marginBottom: 8 },
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 8,
    textTransform: 'uppercase',
    fontSize: 12,
    letterSpacing: 0.6,
  },
  card: { marginHorizontal: 16, paddingVertical: 8, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  subLabel: { paddingHorizontal: 16, marginBottom: 8, fontSize: 12 },
  segment: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  segBtn: { flex: 1, alignItems: 'center', paddingVertical: 10 },
  swatches: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  swatch: { width: 32, height: 32, borderRadius: 16 },
});
