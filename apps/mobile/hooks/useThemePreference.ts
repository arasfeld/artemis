import { useCallback } from 'react';
import { type ColorScheme, useTheme } from '@artemis/ui';

import { saveThemePreference } from '@/lib/theme-storage';

export function useThemePreference() {
  const { colorScheme, setColorScheme, theme } = useTheme();

  const setAndPersist = useCallback(
    (scheme: ColorScheme) => {
      setColorScheme(scheme);
      saveThemePreference(scheme);
    },
    [setColorScheme],
  );

  return {
    colorScheme,
    setColorScheme: setAndPersist,
    theme,
  };
}
