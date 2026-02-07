import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAppAuth } from '@/hooks/useAppAuth';

export default function MainLayout() {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useAppAuth();

  useEffect(() => {
    if (isLoading) return;

    // Redirect unauthenticated users to sign-in
    if (!isAuthenticated) {
      router.replace('/sign-in');
    }
  }, [isAuthenticated, isLoading, router]);

  // Don't render app screens for unauthenticated users
  if (!isAuthenticated) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen
        name="profile-edit"
        options={{
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
