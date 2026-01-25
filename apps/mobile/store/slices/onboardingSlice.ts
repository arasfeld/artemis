import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RootState } from '../index';
import type {
  Gender,
  Seeking,
  RelationshipType,
  LocationData,
} from '../../types/onboarding';

const STORAGE_KEY = 'onboarding_local_edits';

export interface LocalEdits {
  firstName?: string;
  dateOfBirth?: string; // ISO string for serializability
  gender?: Gender | null;
  seeking?: Seeking | null;
  relationshipType?: RelationshipType | null;
  ageRange?: { min: number; max: number };
  location?: LocationData | null;
  photos?: string[]; // Local URIs before upload
}

interface OnboardingState {
  currentStep: number;
  localEdits: LocalEdits;
}

const initialState: OnboardingState = {
  currentStep: 0,
  localEdits: {},
};

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
    setLocalEdit: (state, action: PayloadAction<Partial<LocalEdits>>) => {
      state.localEdits = { ...state.localEdits, ...action.payload };
      // Persist to AsyncStorage (fire and forget)
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state.localEdits)).catch(
        () => {},
      );
    },
    clearLocalEdits: (state) => {
      state.localEdits = {};
      AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
    },
    loadLocalEdits: (state, action: PayloadAction<LocalEdits>) => {
      state.localEdits = action.payload;
    },
    resetOnboarding: (state) => {
      state.currentStep = 0;
      state.localEdits = {};
      AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
    },
  },
});

export const {
  setCurrentStep,
  setLocalEdit,
  clearLocalEdits,
  loadLocalEdits,
  resetOnboarding,
} = onboardingSlice.actions;

// Selectors
export const selectCurrentStep = (state: RootState) =>
  state.onboarding.currentStep;
export const selectLocalEdits = (state: RootState) =>
  state.onboarding.localEdits;

export default onboardingSlice.reducer;
