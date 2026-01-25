export type Gender = 'male' | 'female' | 'non-binary';
export type Seeking = 'male' | 'female' | 'everyone';
export type RelationshipType = 'casual' | 'serious' | 'friendship' | 'unsure';
export type LocationType = 'automatic' | 'manual';

export interface LocationData {
  type: LocationType;
  country?: string;
  zipCode?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface OnboardingData {
  firstName: string;
  location: LocationData | null;
  gender: Gender | null;
  seeking: Seeking | null;
  dateOfBirth: Date | null;
  relationshipType: RelationshipType | null;
  ageRange: {
    min: number;
    max: number;
  };
  photos: string[];
}

export interface OnboardingContextType {
  data: OnboardingData;
  updateData: (partial: Partial<OnboardingData>) => void;
  currentStep: number;
  totalSteps: number;
  setCurrentStep: (step: number) => void;
  reset: () => void;
  isComplete: boolean;
  // API sync state
  isSyncing: boolean;
  syncError: string | null;
  clearSyncError: () => void;
}

export const TOTAL_ONBOARDING_STEPS = 7;

export const initialOnboardingData: OnboardingData = {
  firstName: '',
  location: null,
  gender: null,
  seeking: null,
  dateOfBirth: null,
  relationshipType: null,
  ageRange: {
    min: 18,
    max: 45,
  },
  photos: [],
};
