export type RelationshipType = string;
export type LocationType = 'automatic' | 'manual';

export interface GenderOption {
  id: string;
  name: string;
  description?: string;
  isPrimary: boolean;
}

export interface LocationData {
  city?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  country?: string;
  isoCountryCode?: string;
  region?: string;
  type: LocationType;
  zipCode?: string;
}

// Use API format throughout for consistency
export interface OnboardingData {
  ageRangeMax: number;
  ageRangeMin: number;
  dateOfBirth?: string;
  firstName?: string;
  genderIds: string[];
  location?: LocationData;
  photos: string[];
  relationshipTypes?: RelationshipType[];
  seekingIds: string[];
}

export interface OnboardingContextType {
  clearSyncError: () => void;
  currentStep: number;
  data: OnboardingData;
  isComplete: boolean;
  isSyncing: boolean;
  reset: () => void;
  setCurrentStep: (step: number) => void;
  syncError: string | null;
  totalSteps: number;
  updateData: (partial: Partial<OnboardingData>) => void;
}

export const TOTAL_ONBOARDING_STEPS = 7;

export const initialOnboardingData: OnboardingData = {
  ageRangeMax: 45,
  ageRangeMin: 18,
  dateOfBirth: undefined,
  firstName: '',
  genderIds: [],
  location: undefined,
  photos: [],
  relationshipTypes: undefined,
  seekingIds: [],
};
