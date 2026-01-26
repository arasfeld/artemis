import { Href, Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAppAuth } from '../../hooks/useAppAuth';
import { useOnboardingFlow } from '../../hooks/useOnboardingFlow';

export default function AuthLayout() {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useAppAuth();
  const { isOnboardingComplete, destination } = useOnboardingFlow();

  useEffect(() => {
    if (isLoading) return;

    // Redirect authenticated users away from auth screens
    if (isAuthenticated) {
      if (isOnboardingComplete) {
        router.replace('/(main)/(tabs)' as Href);
      } else {
        // Navigate to the first incomplete onboarding step
        router.replace(destination as Href);
      }
    }
  }, [destination, isAuthenticated, isLoading, isOnboardingComplete, router]);

  // Don't render auth screens for authenticated users
  if (isAuthenticated) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="sign-in" />
    </Stack>
  );
}
