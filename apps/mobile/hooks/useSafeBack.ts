import { useRouter } from 'expo-router';

/**
 * Hook that provides safe back navigation.
 * Uses router.back() if navigation history exists, otherwise navigates
 * to a specified fallback route.
 *
 * @param fallbackRoute - Optional fallback route to navigate to if no history exists
 * @returns A function to safely navigate back
 */
export function useSafeBack(fallbackRoute?: string): () => void {
  const router = useRouter();

  return () => {
    try {
      // Try to go back first
      router.back();
    } catch {
      // If back navigation fails, use fallback route if provided
      if (fallbackRoute) {
        router.replace(fallbackRoute as any);
      }
    }
  };
}
