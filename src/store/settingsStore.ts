import { create } from 'zustand';
import { loadSettings, saveSettings } from './mmkv';
import type { AppSettings } from '../types';

type SettingsState = {
  settings: AppSettings;
  updateSettings: (partial: Partial<AppSettings>) => void;
  resetSettings: () => void;
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: loadSettings(),
  updateSettings: (partial) => {
    const next = { ...get().settings, ...partial };
    saveSettings(next);
    set({ settings: next });
  },
  resetSettings: () => {
    const next = loadSettings();
    set({ settings: next });
  },
}));
