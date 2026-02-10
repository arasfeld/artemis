import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import {
  initialWindowMetrics,
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import { type ColorScheme, ThemeProvider, useTheme } from '@artemis/ui';

import { useAppAuth } from '@/hooks/useAppAuth';
import { getThemePreference, saveThemePreference } from '@/lib/theme-storage';
import { store } from '@/store';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { isLoading } = useAppAuth();
  const { theme } = useTheme();

  useEffect(() => {
    // Hide splash screen when auth state is determined
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  // Always render the Stack - expo-router requires it
  // The index screen handles showing a loading state
  return (
    <>
      <StatusBar style={theme.colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          contentStyle: {
            backgroundColor: theme.colors.background,
          },
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" options={{ animation: 'none' }} />
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="(main)" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [themePreference, setThemePreference] = useState<ColorScheme | null>(
    null,
  );

  useEffect(() => {
    getThemePreference().then((pref) => {
      setThemePreference(pref ?? 'system');
    });
  }, []);

  // Wait for theme preference to load before rendering
  if (!themePreference) return null;

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <ThemeProvider
        initialColorScheme={themePreference}
        onColorSchemeChange={saveThemePreference}
      >
        <Provider store={store}>
          <RootLayoutNav />
        </Provider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
