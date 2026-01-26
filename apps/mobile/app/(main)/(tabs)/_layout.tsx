import { Href, Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { colors } from '@artemis/ui';
import { useOnboardingFlow } from '../../../hooks/useOnboardingFlow';

export default function TabsLayout() {
  const router = useRouter();
  const { destination, isLoading, isOnboardingComplete } = useOnboardingFlow();

  // Redirect to onboarding if not complete
  // Only redirect if destination is actually an onboarding screen (not tabs)
  const shouldRedirect = !isOnboardingComplete && destination !== '/(main)/(tabs)';

  useEffect(() => {
    if (isLoading) return;

    if (shouldRedirect) {
      router.replace(destination as Href);
    }
  }, [destination, isLoading, router, shouldRedirect]);

  if (shouldRedirect) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text.muted,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.border.light,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="likes"
        options={{
          title: 'Likes',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
