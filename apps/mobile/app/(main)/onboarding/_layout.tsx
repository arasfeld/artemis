import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        animation: 'slide_from_right',
        gestureEnabled: true,
        headerShown: false,
      }}
    >
      <Stack.Screen name="first-name" />
      <Stack.Screen name="location" />
      <Stack.Screen name="manual-location" />
      <Stack.Screen name="gender" />
      <Stack.Screen
        name="gender-select"
        options={{
          presentation: 'modal',
        }}
      />
      <Stack.Screen name="date-of-birth" />
      <Stack.Screen name="relationship" />
      <Stack.Screen name="age-range" />
      <Stack.Screen name="photos" />
      <Stack.Screen name="pets" />
    </Stack>
  );
}
