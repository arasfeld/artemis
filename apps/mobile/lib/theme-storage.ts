import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ColorScheme } from '@artemis/ui';

const THEME_KEY = 'theme_preference';

export async function getThemePreference(): Promise<ColorScheme | null> {
  const value = await AsyncStorage.getItem(THEME_KEY);
  if (value === 'dark' || value === 'light' || value === 'system') {
    return value;
  }
  return null;
}

export async function saveThemePreference(scheme: ColorScheme): Promise<void> {
  await AsyncStorage.setItem(THEME_KEY, scheme);
}
