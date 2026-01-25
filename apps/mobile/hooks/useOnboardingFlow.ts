import { useCallback, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { useOnboarding } from '../context/OnboardingContext';

export type OnboardingRoute =
  | '/onboarding/welcome'
  | '/onboarding/first-name'
  | '/onboarding/location'
  | '/onboarding/manual-location'
  | '/onboarding/gender'
  | '/onboarding/date-of-birth'
  | '/onboarding/relationship'
  | '/onboarding/age-range'
  | '/onboarding/photos';

export type FlowDestination =
  | '/onboarding/welcome'
  | '/onboarding/first-name'
  | '/onboarding/location'
  | '/onboarding/gender'
  | '/onboarding/date-of-birth'
  | '/onboarding/relationship'
  | '/onboarding/age-range'
  | '/onboarding/photos'
  | '/home';

/**
 * Map of onboarding routes to their previous route.
 * Used for safe back navigation when there's no navigation history.
 */
const PREVIOUS_ROUTE_MAP: Record<OnboardingRoute, OnboardingRoute | null> = {
  '/onboarding/welcome': null,
  '/onboarding/first-name': '/onboarding/welcome',
  '/onboarding/location': '/onboarding/first-name',
  '/onboarding/manual-location': '/onboarding/location',
  '/onboarding/gender': '/onboarding/location',
  '/onboarding/date-of-birth': '/onboarding/gender',
  '/onboarding/relationship': '/onboarding/date-of-birth',
  '/onboarding/age-range': '/onboarding/relationship',
  '/onboarding/photos': '/onboarding/age-range',
};

/**
 * Ordered list of onboarding steps with their validation functions.
 * Each step checks if the data for that step is complete.
 */
const ONBOARDING_STEPS: {
  route: FlowDestination;
  isComplete: (data: ReturnType<typeof useOnboarding>['data']) => boolean;
}[] = [
  {
    route: '/onboarding/first-name',
    isComplete: (data) => data.firstName.length >= 2,
  },
  {
    route: '/onboarding/location',
    isComplete: (data) => data.location !== null,
  },
  {
    route: '/onboarding/gender',
    isComplete: (data) => data.gender !== null && data.seeking !== null,
  },
  {
    route: '/onboarding/date-of-birth',
    isComplete: (data) => data.dateOfBirth !== null,
  },
  {
    route: '/onboarding/relationship',
    isComplete: (data) => data.relationshipType !== null,
  },
  {
    route: '/onboarding/age-range',
    isComplete: (data) => data.ageRange.min >= 18 && data.ageRange.max >= data.ageRange.min,
  },
  {
    route: '/onboarding/photos',
    isComplete: (data) => data.photos.length >= 2,
  },
];

interface OnboardingFlowResult {
  /** Whether the flow state is still loading */
  isLoading: boolean;
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
  /** Whether onboarding is complete */
  isOnboardingComplete: boolean;
  /** The destination the user should be routed to */
  destination: FlowDestination;
  /** Navigate to the appropriate destination */
  navigate: () => void;
  /** Current step index (0-based) */
  currentStep: number;
  /** Total number of onboarding steps */
  totalSteps: number;
  /** Whether there's a previous step to go back to */
  canGoBack: boolean;
  /** Go back to the previous onboarding step */
  goBack: () => void;
}

/**
 * Hook that manages the onboarding flow.
 * Determines which onboarding step to show and provides navigation helpers.
 *
 * Routing rules:
 * - Not authenticated → Welcome screen
 * - Authenticated + onboarding incomplete → First incomplete onboarding step
 * - Authenticated + onboarding complete → Main app (home)
 */
export function useOnboardingFlow(): OnboardingFlowResult {
  const router = useRouter();
  const { isLoading, isAuthenticated, user } = useAuth();
  const { data, isComplete } = useOnboarding();

  // Check server-side onboarding status first, fall back to local state
  const isOnboardingComplete = user?.isOnboardingComplete ?? isComplete;

  // Find the first incomplete onboarding step
  const firstIncompleteStep = useMemo(() => {
    for (let i = 0; i < ONBOARDING_STEPS.length; i++) {
      if (!ONBOARDING_STEPS[i].isComplete(data)) {
        return i;
      }
    }
    return ONBOARDING_STEPS.length; // All complete
  }, [data]);

  // Determine the destination based on current state
  const destination = useMemo((): FlowDestination => {
    if (!isAuthenticated) {
      return '/onboarding/welcome';
    }

    if (!isOnboardingComplete && firstIncompleteStep < ONBOARDING_STEPS.length) {
      return ONBOARDING_STEPS[firstIncompleteStep].route;
    }

    return '/home';
  }, [isAuthenticated, isOnboardingComplete, firstIncompleteStep]);

  // Navigate to the determined destination
  const navigate = useCallback(() => {
    router.replace(destination);
  }, [router, destination]);

  // Calculate current step based on destination
  const currentStep = useMemo(() => {
    const index = ONBOARDING_STEPS.findIndex((step) => step.route === destination);
    return index >= 0 ? index : 0;
  }, [destination]);

  const totalSteps = ONBOARDING_STEPS.length;
  const canGoBack = currentStep > 0;

  // Go back to the previous onboarding step
  const goBack = useCallback(() => {
    if (currentStep > 0) {
      router.back();
    }
  }, [router, currentStep]);

  return {
    isLoading,
    isAuthenticated,
    isOnboardingComplete,
    destination,
    navigate,
    currentStep,
    totalSteps,
    canGoBack,
    goBack,
  };
}

/**
 * Get the step number (1-based) for a given onboarding route.
 * Returns 0 if the route is not an onboarding step.
 */
export function getOnboardingStepNumber(route: string): number {
  const index = ONBOARDING_STEPS.findIndex((step) => step.route === route);
  return index >= 0 ? index + 1 : 0;
}

/**
 * Total number of onboarding steps
 */
export const TOTAL_ONBOARDING_STEPS = ONBOARDING_STEPS.length;

/**
 * Hook that provides safe back navigation for onboarding screens.
 * Uses router.back() if navigation history exists, otherwise navigates
 * to the previous onboarding step explicitly.
 *
 * @param currentRoute - The current onboarding route
 * @returns A function to safely navigate back, or undefined if no back is possible
 */
export function useSafeBack(currentRoute: OnboardingRoute): (() => void) | undefined {
  const router = useRouter();

  const previousRoute = PREVIOUS_ROUTE_MAP[currentRoute];

  return useMemo(() => {
    if (!previousRoute) {
      return undefined;
    }

    return () => {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace(previousRoute);
      }
    };
  }, [router, previousRoute]);
}
