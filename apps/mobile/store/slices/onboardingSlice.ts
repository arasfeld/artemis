import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { RootState } from "../index";
import type { LocationData } from "@/types/onboarding";

// Use the same storage key as the hook to avoid duplication
const STORAGE_KEY = "onboarding_data";

export interface OnboardingData {
  ageRangeMax?: number;
  ageRangeMin?: number;
  dateOfBirth?: string;
  firstName?: string;
  genderIds?: string[];
  location?: LocationData;
  photos?: string[];
  relationshipTypes?: string[];
  seekingIds?: string[];
}

interface OnboardingState {
  currentStep: number;
  data: OnboardingData;
}

const initialState: OnboardingState = {
  currentStep: 0,
  data: {},
};

const onboardingSlice = createSlice({
  name: "onboarding",
  initialState,
  reducers: {
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
    updateOnboardingData: (
      state,
      action: PayloadAction<Partial<OnboardingData>>,
    ) => {
      state.data = { ...state.data, ...action.payload };
      // Persist to AsyncStorage (fire and forget)
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state.data)).catch(
        () => {},
      );
    },
    clearOnboardingData: (state) => {
      state.data = {};
      AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
    },
    loadOnboardingData: (state, action: PayloadAction<OnboardingData>) => {
      state.data = action.payload;
    },
    resetOnboarding: (state) => {
      state.currentStep = 0;
      state.data = {};
      AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
    },
  },
});

export const {
  clearOnboardingData,
  loadOnboardingData,
  resetOnboarding,
  setCurrentStep,
  updateOnboardingData,
} = onboardingSlice.actions;

// Selectors
export const selectCurrentStep = (state: RootState) =>
  state.onboarding.currentStep;
export const selectOnboardingData = (state: RootState) => state.onboarding.data;

export default onboardingSlice.reducer;
