import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useSettingsStore } from '../store/settingsStore';
import { buildTheme, fonts, radii, spacing, type ThemeColors } from './tokens';

type ThemeContextValue = {
  colors: ThemeColors;
  isDark: boolean;
  fonts: typeof fonts;
  spacing: typeof spacing;
  radii: typeof radii;
  densityPadding: number;
  rowHeight: number;
  artBorderRadius: number;
  reduceMotion: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const themeMode = useSettingsStore((s) => s.settings.themeMode);
  const accentId = useSettingsStore((s) => s.settings.accentId);
  const density = useSettingsStore((s) => s.settings.density);
  const artStyle = useSettingsStore((s) => s.settings.artStyle);
  const reduceMotion = useSettingsStore((s) => s.settings.reduceMotion);

  const isDark =
    themeMode === 'system' ? systemScheme === 'dark' : themeMode === 'dark';

  const value = useMemo<ThemeContextValue>(() => {
    const colors = buildTheme(isDark ? 'dark' : 'light', accentId);
    return {
      colors,
      isDark,
      fonts,
      spacing,
      radii,
      densityPadding: density === 'compact' ? 8 : 12,
      rowHeight: density === 'compact' ? 60 : 72,
      artBorderRadius: artStyle === 'circle' ? 999 : 16,
      reduceMotion,
    };
  }, [isDark, accentId, density, artStyle, reduceMotion]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}
