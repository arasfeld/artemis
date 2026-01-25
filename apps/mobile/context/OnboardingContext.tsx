import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  type OnboardingData,
  type OnboardingContextType,
  TOTAL_ONBOARDING_STEPS,
  initialOnboardingData,
} from '../types/onboarding';
import { useAuth } from './AuthContext';
import {
  api,
  type ProfileData,
  type UpdateProfileData,
  type LocationData as ApiLocationData,
} from '../lib/api';

const STORAGE_KEY = 'onboarding_data';

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState<OnboardingData>(initialOnboardingData);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [serverProfile, setServerProfile] = useState<ProfileData | null>(null);

  // Track if we should skip API calls (for initial load)
  const isInitialLoad = useRef(true);

  // Load data - from server when authenticated, otherwise from local storage
  useEffect(() => {
    const loadData = async () => {
      if (isAuthenticated) {
        // Load from server
        try {
          const profile = await api.getOnboardingProfile();
          setServerProfile(profile);

          // Convert server profile to local data format
          setData({
            firstName: profile.firstName || '',
            location: profile.location
              ? {
                  type: profile.location.type,
                  country: profile.location.country,
                  zipCode: profile.location.zipCode,
                  coordinates: profile.location.coordinates,
                }
              : null,
            gender: profile.gender || null,
            seeking: profile.seeking || null,
            dateOfBirth: profile.dateOfBirth
              ? new Date(profile.dateOfBirth)
              : null,
            relationshipType: profile.relationshipType || null,
            ageRange: {
              min: profile.ageRangeMin,
              max: profile.ageRangeMax,
            },
            photos: profile.photos.map((p) => p.url),
          });
        } catch (error) {
          console.error('Failed to load profile from server:', error);
          // Fall back to local storage
          await loadFromLocalStorage();
        }
      } else {
        // Load from local storage when not authenticated
        await loadFromLocalStorage();
      }

      setIsLoaded(true);
      isInitialLoad.current = false;
    };

    const loadFromLocalStorage = async () => {
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
      }
    };

    loadData();
  }, [isAuthenticated]);

  // Save to local storage as backup (after initial load)
  useEffect(() => {
    if (!isLoaded || isInitialLoad.current) return;

    const saveToLocalStorage = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch {
        // Ignore save errors
      }
    };

    saveToLocalStorage();
  }, [data, isLoaded]);

  // Sync to server
  const syncToServer = useCallback(
    async (update: UpdateProfileData) => {
      if (!isAuthenticated) return;

      setIsSyncing(true);
      setSyncError(null);

      try {
        const profile = await api.updateProfile(update);
        setServerProfile(profile);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to sync profile';
        setSyncError(message);
        console.error('Failed to sync profile:', error);
      } finally {
        setIsSyncing(false);
      }
    },
    [isAuthenticated],
  );

  const updateData = useCallback(
    (partial: Partial<OnboardingData>) => {
      setData((prev) => {
        const updated = { ...prev, ...partial };

        // Build API update payload (only for non-photo fields)
        if (isAuthenticated && !isInitialLoad.current) {
          const apiUpdate: UpdateProfileData = {};

          if (partial.firstName !== undefined) {
            apiUpdate.firstName = partial.firstName;
          }
          if (partial.dateOfBirth !== undefined && partial.dateOfBirth) {
            apiUpdate.dateOfBirth = partial.dateOfBirth
              .toISOString()
              .split('T')[0];
          }
          if (partial.gender !== undefined) {
            apiUpdate.gender = partial.gender || undefined;
          }
          if (partial.seeking !== undefined) {
            apiUpdate.seeking = partial.seeking || undefined;
          }
          if (partial.relationshipType !== undefined) {
            apiUpdate.relationshipType = partial.relationshipType || undefined;
          }
          if (partial.ageRange !== undefined) {
            apiUpdate.ageRangeMin = partial.ageRange.min;
            apiUpdate.ageRangeMax = partial.ageRange.max;
          }
          if (partial.location !== undefined && partial.location) {
            apiUpdate.location = partial.location as ApiLocationData;
          }

          // Sync to server if there are updates
          if (Object.keys(apiUpdate).length > 0) {
            syncToServer(apiUpdate);
          }
        }

        return updated;
      });
    },
    [isAuthenticated, syncToServer],
  );

  const clearSyncError = useCallback(() => {
    setSyncError(null);
  }, []);

  const reset = useCallback(async () => {
    setData(initialOnboardingData);
    setCurrentStep(0);
    setServerProfile(null);
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore remove errors
    }
  }, []);

  // Calculate isComplete - prefer server value when available
  const isComplete = serverProfile
    ? serverProfile.isOnboardingComplete
    : data.firstName.length >= 2 &&
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
        isSyncing,
        syncError,
        clearSyncError,
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
