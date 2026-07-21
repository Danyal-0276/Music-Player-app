import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_SETTINGS, type AppSettings } from '../types';

const SETTINGS_KEY = 'app.settings';

let memoryCache: AppSettings | null = null;

export function loadSettings(): AppSettings {
  if (memoryCache) {
    return memoryCache;
  }
  return { ...DEFAULT_SETTINGS };
}

export async function hydrateSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (raw) {
      memoryCache = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
      return memoryCache;
    }
  } catch {
    // fall through
  }
  memoryCache = { ...DEFAULT_SETTINGS };
  return memoryCache;
}

export function saveSettings(settings: AppSettings) {
  memoryCache = settings;
  void AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
