import { create } from 'zustand';
import { hydrateSettings, loadSettings, saveSettings } from './mmkv';
import type { AppSettings } from '../types';

type SettingsState = {
  settings: AppSettings;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  updateSettings: (partial: Partial<AppSettings>) => void;
  resetSettings: () => void;
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: loadSettings(),
  hydrated: false,
  hydrate: async () => {
    const settings = await hydrateSettings();
    set({ settings, hydrated: true });
  },
  updateSettings: (partial) => {
    const next = { ...get().settings, ...partial };
    saveSettings(next);
    set({ settings: next });
  },
  resetSettings: () => {
    void hydrateSettings().then((settings) => set({ settings }));
  },
}));
