import { Stack } from 'expo-router';

export default function ProfileEditLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: 'modal',
      }}
    >
      <Stack.Screen name="age-range" />
      <Stack.Screen name="gender" />
      <Stack.Screen name="location" />
      <Stack.Screen name="name" />
      <Stack.Screen name="photos" />
      <Stack.Screen name="relationship" />
      <Stack.Screen name="seeking" />
    </Stack>
  );
}
