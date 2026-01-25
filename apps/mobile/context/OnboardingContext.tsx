import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  type OnboardingData,
  type OnboardingContextType,
  TOTAL_ONBOARDING_STEPS,
  initialOnboardingData,
} from '../types/onboarding';

const STORAGE_KEY = 'onboarding_data';

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<OnboardingData>(initialOnboardingData);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load persisted data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          // Convert dateOfBirth string back to Date object
          if (parsed.dateOfBirth) {
            parsed.dateOfBirth = new Date(parsed.dateOfBirth);
          }
          setData(parsed);
        }
      } catch {
        // Ignore load errors, use initial data
      } finally {
        setIsLoaded(true);
      }
    };
    loadData();
  }, []);

  // Persist data on changes (after initial load)
  useEffect(() => {
    if (!isLoaded) return;
    const saveData = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch {
        // Ignore save errors
      }
    };
    saveData();
  }, [data, isLoaded]);

  const updateData = useCallback((partial: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...partial }));
  }, []);

  const reset = useCallback(async () => {
    setData(initialOnboardingData);
    setCurrentStep(0);
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore remove errors
    }
  }, []);

  const isComplete =
    data.firstName.length >= 2 &&
    data.location !== null &&
    data.gender !== null &&
    data.seeking !== null &&
    data.dateOfBirth !== null &&
    data.relationshipType !== null &&
    data.photos.length >= 2;

  return (
    <OnboardingContext.Provider
      value={{
        data,
        updateData,
        currentStep,
        totalSteps: TOTAL_ONBOARDING_STEPS,
        setCurrentStep,
        reset,
        isComplete,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding(): OnboardingContextType {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
