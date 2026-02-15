import { Stack } from 'expo-router';

export default function PetLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: 'modal',
      }}
    >
      <Stack.Screen name="[petId]" />
    </Stack>
  );
}
