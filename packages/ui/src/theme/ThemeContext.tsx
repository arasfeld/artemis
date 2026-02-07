import { createContext, useContext } from 'react';

import type { Colors } from './colors';
import { lightColors } from './colors';
import type { borderRadius, shadow, spacing } from './spacing';
import type { typography } from './typography';

export type ColorScheme = 'dark' | 'light' | 'system';
export type ResolvedColorScheme = 'dark' | 'light';

export interface Theme {
  borderRadius: typeof borderRadius;
  colorScheme: ResolvedColorScheme;
  colors: Colors;
  shadow: typeof shadow;
  spacing: typeof spacing;
  typography: typeof typography;
}

export interface ThemeContextValue {
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  theme: Theme;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
