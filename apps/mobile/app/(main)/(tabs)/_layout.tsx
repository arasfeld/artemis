import { useEffect, useMemo } from 'react';
import { StyleSheet, Text as RNText, View } from 'react-native';
import { Href, Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@artemis/ui';

import { useOnboardingFlow } from '@/hooks/useOnboardingFlow';
import { useGetUnreadCountQuery } from '@/store/api/apiSlice';

export default function TabsLayout() {
  const router = useRouter();
  const { theme } = useTheme();
  const { destination, isLoading, isOnboardingComplete } = useOnboardingFlow();
  const { data: unreadData } = useGetUnreadCountQuery(undefined, {
    pollingInterval: 30000, // Poll every 30 seconds
  });
  const unreadCount = unreadData?.count ?? 0;

  // Redirect to onboarding if not complete
  // Only redirect if destination is actually an onboarding screen (not tabs)
  const shouldRedirect =
    !isOnboardingComplete && destination !== '/(main)/(tabs)';

  useEffect(() => {
    if (isLoading) return;

    if (shouldRedirect) {
      router.replace(destination as Href);
    }
  }, [destination, isLoading, router, shouldRedirect]);

  const dynamicStyles = useMemo(
    () =>
      StyleSheet.create({
        badge: {
          backgroundColor: theme.colors.destructive,
          borderRadius: 10,
          minWidth: 18,
          paddingHorizontal: 4,
          paddingVertical: 1,
          position: 'absolute',
          right: -8,
          top: -4,
        },
        badgeText: {
          color: theme.colors.white,
          fontSize: 10,
          fontWeight: '600',
          textAlign: 'center',
        },
      }),
    [theme.colorScheme]
  );

  if (shouldRedirect) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.mutedForeground,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
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
            <View>
              <Ionicons color={color} name="chatbubble-outline" size={size} />
              {unreadCount > 0 && (
                <View style={dynamicStyles.badge}>
                  <RNText style={dynamicStyles.badgeText}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </RNText>
                </View>
              )}
            </View>
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
