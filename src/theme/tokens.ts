import type { AccentId } from '../types';

export type ThemeColors = {
  background: string;
  backgroundSecondary: string;
  surface: string;
  surfaceElevated: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentSoft: string;
  danger: string;
  border: string;
  overlay: string;
  tabInactive: string;
  progressTrack: string;
  miniPlayer: string;
};

export const ACCENT_SWATCHES: Record<
  AccentId,
  { label: string; light: string; dark: string; softLight: string; softDark: string }
> = {
  coral: {
    label: 'Coral',
    light: '#E85D4C',
    dark: '#FF7A6A',
    softLight: 'rgba(232, 93, 76, 0.14)',
    softDark: 'rgba(255, 122, 106, 0.18)',
  },
  teal: {
    label: 'Teal',
    light: '#0D9488',
    dark: '#2DD4BF',
    softLight: 'rgba(13, 148, 136, 0.14)',
    softDark: 'rgba(45, 212, 191, 0.18)',
  },
  sky: {
    label: 'Sky',
    light: '#0284C7',
    dark: '#38BDF8',
    softLight: 'rgba(2, 132, 199, 0.14)',
    softDark: 'rgba(56, 189, 248, 0.18)',
  },
  lime: {
    label: 'Lime',
    light: '#65A30D',
    dark: '#A3E635',
    softLight: 'rgba(101, 163, 13, 0.14)',
    softDark: 'rgba(163, 230, 53, 0.18)',
  },
  rose: {
    label: 'Rose',
    light: '#E11D48',
    dark: '#FB7185',
    softLight: 'rgba(225, 29, 72, 0.14)',
    softDark: 'rgba(251, 113, 133, 0.18)',
  },
  gold: {
    label: 'Gold',
    light: '#D97706',
    dark: '#FBBF24',
    softLight: 'rgba(217, 119, 6, 0.14)',
    softDark: 'rgba(251, 191, 36, 0.18)',
  },
  slate: {
    label: 'Slate',
    light: '#475569',
    dark: '#94A3B8',
    softLight: 'rgba(71, 85, 105, 0.14)',
    softDark: 'rgba(148, 163, 184, 0.18)',
  },
};

const lightBase: Omit<ThemeColors, 'accent' | 'accentSoft'> = {
  background: '#F7F3EE',
  backgroundSecondary: '#EFE9E1',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  text: '#1C1917',
  textSecondary: '#57534E',
  textMuted: '#A8A29E',
  danger: '#DC2626',
  border: 'rgba(28, 25, 23, 0.08)',
  overlay: 'rgba(28, 25, 23, 0.45)',
  tabInactive: '#A8A29E',
  progressTrack: 'rgba(28, 25, 23, 0.1)',
  miniPlayer: '#FFFFFF',
};

const darkBase: Omit<ThemeColors, 'accent' | 'accentSoft'> = {
  background: '#0C0A09',
  backgroundSecondary: '#1C1917',
  surface: '#1C1917',
  surfaceElevated: '#292524',
  text: '#FAFAF9',
  textSecondary: '#A8A29E',
  textMuted: '#78716C',
  danger: '#F87171',
  border: 'rgba(250, 250, 249, 0.08)',
  overlay: 'rgba(0, 0, 0, 0.55)',
  tabInactive: '#78716C',
  progressTrack: 'rgba(250, 250, 249, 0.12)',
  miniPlayer: '#1C1917',
};

export function buildTheme(mode: 'light' | 'dark', accentId: AccentId): ThemeColors {
  const accent = ACCENT_SWATCHES[accentId];
  const base = mode === 'light' ? lightBase : darkBase;
  return {
    ...base,
    accent: mode === 'light' ? accent.light : accent.dark,
    accentSoft: mode === 'light' ? accent.softLight : accent.softDark,
  };
}

export const fonts = {
  display: 'Fraunces_600SemiBold',
  displayRegular: 'Fraunces_400Regular',
  body: 'DMSans_400Regular',
  bodyMedium: 'DMSans_500Medium',
  bodyBold: 'DMSans_700Bold',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};
