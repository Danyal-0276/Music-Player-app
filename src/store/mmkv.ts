import { createMMKV } from 'react-native-mmkv';
import { DEFAULT_SETTINGS, type AppSettings } from '../types';

export const storage = createMMKV({ id: 'harmonic-settings' });

const SETTINGS_KEY = 'app.settings';

export function loadSettings(): AppSettings {
  const raw = storage.getString(SETTINGS_KEY);
  if (!raw) {
    return { ...DEFAULT_SETTINGS };
  }
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: AppSettings) {
  storage.set(SETTINGS_KEY, JSON.stringify(settings));
}
