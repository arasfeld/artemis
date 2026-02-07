import { useCallback, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';

import { darkColors, lightColors } from './colors';
import { borderRadius, shadow, spacing } from './spacing';
import type { ColorScheme, ResolvedColorScheme, Theme } from './ThemeContext';
import { ThemeContext } from './ThemeContext';
import { typography } from './typography';

interface ThemeProviderProps {
  children: React.ReactNode;
  initialColorScheme?: ColorScheme;
  onColorSchemeChange?: (scheme: ColorScheme) => void;
}

export function ThemeProvider({
  children,
  initialColorScheme = 'system',
  onColorSchemeChange,
}: ThemeProviderProps) {
  const systemScheme = useColorScheme();
  const [colorScheme, setColorSchemeState] =
    useState<ColorScheme>(initialColorScheme);

  const resolved: ResolvedColorScheme =
    colorScheme === 'system'
      ? systemScheme === 'dark'
        ? 'dark'
        : 'light'
      : colorScheme;

  const theme: Theme = useMemo(
    () => ({
      borderRadius,
      colorScheme: resolved,
      colors: resolved === 'dark' ? darkColors : lightColors,
      shadow,
      spacing,
      typography,
    }),
    [resolved],
  );

  const setColorScheme = useCallback(
    (scheme: ColorScheme) => {
      setColorSchemeState(scheme);
      onColorSchemeChange?.(scheme);
    },
    [onColorSchemeChange],
  );

  const value = useMemo(
    () => ({ colorScheme, setColorScheme, theme }),
    [colorScheme, setColorScheme, theme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
