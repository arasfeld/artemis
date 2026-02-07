import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Provider } from 'react-redux';
import {
  initialWindowMetrics,
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import { colors } from '@artemis/ui';
import { store } from '@/store';
import { useAppAuth } from '@/hooks/useAppAuth';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { isLoading } = useAppAuth();

  useEffect(() => {
    // Hide splash screen when auth state is determined
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  // Always render the Stack - expo-router requires it
  // The index screen handles showing a loading state
  return (
    <Stack
      screenOptions={{
        contentStyle: {
          backgroundColor: colors.background,
        },
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" options={{ animation: 'none' }} />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="(main)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <Provider store={store}>
        <RootLayoutNav />
      </Provider>
    </SafeAreaProvider>
  );
}
