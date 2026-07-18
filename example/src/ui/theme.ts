import { Platform, useColorScheme } from 'react-native';

// Ridge palette — violet ink with a coral signal. The mono face carries the
// library's signature: routes are shown as real paths everywhere.
export const palette = {
  violet: '#6C5CE7',
  violetBright: '#8B7CF7',
  violetDeep: '#4B3EC9',
  coral: '#FF7A59',
  inkLight: '#1A1523',
  paperLight: '#FAF9FC',
  surfaceLight: '#FFFFFF',
  borderLight: '#E7E2F2',
  mutedLight: '#6E6486',
  chipLight: '#F1EDFB',
  inkDark: '#F2EFFA',
  paperDark: '#14101C',
  surfaceDark: '#1E1830',
  borderDark: '#322A47',
  mutedDark: '#9C92B8',
  chipDark: '#261F3A',
};

export type Theme = {
  dark: boolean;
  primary: string;
  accent: string;
  background: string;
  surface: string;
  border: string;
  text: string;
  muted: string;
  chip: string;
  onPrimary: string;
};

export const lightTheme: Theme = {
  dark: false,
  primary: palette.violet,
  accent: palette.coral,
  background: palette.paperLight,
  surface: palette.surfaceLight,
  border: palette.borderLight,
  text: palette.inkLight,
  muted: palette.mutedLight,
  chip: palette.chipLight,
  onPrimary: '#FFFFFF',
};

export const darkTheme: Theme = {
  dark: true,
  primary: palette.violetBright,
  accent: palette.coral,
  background: palette.paperDark,
  surface: palette.surfaceDark,
  border: palette.borderDark,
  text: palette.inkDark,
  muted: palette.mutedDark,
  chip: palette.chipDark,
  onPrimary: '#181228',
};

export function useTheme(): Theme {
  const scheme = useColorScheme();
  return scheme === 'dark' ? darkTheme : lightTheme;
}

export const monoFontFamily = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  default: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
});

export const radii = {
  control: 12,
  card: 16,
};
