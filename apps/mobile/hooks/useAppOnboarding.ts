import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  useAddPhotoMutation,
  useDeletePhotoMutation,
  useGetProfileQuery,
  useReorderPhotosMutation,
  useUpdateProfileMutation,
} from '@/store/api/apiSlice';
import {
  loadOnboardingData,
  resetOnboarding,
  selectCurrentStep,
  selectOnboardingData,
  setCurrentStep,
  updateOnboardingData,
} from '@/store/slices/onboardingSlice';
import { useAppAuth } from './useAppAuth';
import {
  type OnboardingData,
  TOTAL_ONBOARDING_STEPS,
} from '@/types/onboarding';
import type { UpdateProfileData } from '@/types/api';

const STORAGE_KEY = 'onboarding_data';

export function useAppOnboarding() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppAuth();
  const [syncError, setSyncError] = useState<string | null>(null);

  const currentStep = useAppSelector(selectCurrentStep);
  const onboardingData = useAppSelector(selectOnboardingData);

  // RTK Query for profile data
  const {
    data: serverProfile,
    isLoading: isProfileLoading,
    isFetching,
  } = useGetProfileQuery(undefined, {
    skip: !isAuthenticated,
  });

  // Mutations
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [addPhotoMutation] = useAddPhotoMutation();
  const [deletePhotoMutation] = useDeletePhotoMutation();
  const [reorderPhotosMutation] = useReorderPhotosMutation();

  // Load local edits from AsyncStorage on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) {
        try {
          dispatch(loadOnboardingData(JSON.parse(stored)));
        } catch {
          // Ignore parse errors
        }
      }
    });
  }, [dispatch]);

  // Merge server data with local data using API format
  const data: OnboardingData = useMemo(() => {
    const base: OnboardingData = {
      ageRangeMax: serverProfile?.ageRangeMax ?? 45,
      ageRangeMin: serverProfile?.ageRangeMin ?? 18,
      dateOfBirth: serverProfile?.dateOfBirth,
      firstName: serverProfile?.firstName || '',
      genderIds: serverProfile?.genders?.map((g) => g.id) || [],
      location: serverProfile?.location,
      photos: serverProfile?.photos?.map((p) => p.url) || [],
      relationshipType: serverProfile?.relationshipType,
      seekingIds: serverProfile?.seeking?.map((g) => g.id) || [],
    };

    // Apply local data on top
    return {
      ...base,
      ...onboardingData,
    };
  }, [serverProfile, onboardingData]);

  // Update data (local + sync to server)
  const updateData = useCallback(
    async (partial: Partial<OnboardingData>) => {
      setSyncError(null);
      
      // Update local state immediately (API format is already storage-compatible)
      dispatch(updateOnboardingData(partial));

      // Sync to server if authenticated
      if (isAuthenticated && Object.keys(partial).length > 0) {
        try {
          await updateProfile(partial as UpdateProfileData).unwrap();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to sync profile';
          setSyncError(errorMessage);
          console.error('Failed to sync profile:', error);
        }
      }
    },
    [dispatch, isAuthenticated, updateProfile],
  );

  // Photo operations
  const addPhoto = useCallback(
    async (url: string, displayOrder?: number) => {
      try {
        if (isAuthenticated) {
          await addPhotoMutation({ url, displayOrder }).unwrap();
        } else {
          const newPhotos = [...(data.photos || []), url];
          dispatch(updateOnboardingData({ photos: newPhotos }));
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to add photo';
        setSyncError(errorMessage);
        console.error('Failed to add photo:', error);
      }
    },
    [isAuthenticated, addPhotoMutation, data.photos, dispatch],
  );

  const deletePhoto = useCallback(
    async (photoIdOrIndex: string | number) => {
      try {
        if (isAuthenticated && typeof photoIdOrIndex === 'string') {
          await deletePhotoMutation(photoIdOrIndex).unwrap();
        } else if (typeof photoIdOrIndex === 'number') {
          const newPhotos = data.photos.filter((_: string, i: number) => i !== photoIdOrIndex);
          dispatch(updateOnboardingData({ photos: newPhotos }));
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete photo';
        setSyncError(errorMessage);
        console.error('Failed to delete photo:', error);
      }
    },
    [isAuthenticated, deletePhotoMutation, data.photos, dispatch],
  );

  const reorderPhotos = useCallback(
    async (photoIds: string[]) => {
      if (isAuthenticated) {
        await reorderPhotosMutation(photoIds).unwrap();
      }
    },
    [isAuthenticated, reorderPhotosMutation],
  );

  // Reset all onboarding state
  const reset = useCallback(() => {
    dispatch(resetOnboarding());
  }, [dispatch]);

  const handleSetCurrentStep = useCallback(
    (step: number) => {
      dispatch(setCurrentStep(step));
    },
    [dispatch],
  );

  // Calculate isComplete
  const isComplete = useMemo(() => {
    return user?.isOnboardingComplete ?? (
      (data.firstName?.length ?? 0) >= 2 &&
      data.location !== undefined &&
      (data.genderIds?.length ?? 0) > 0 &&
      (data.seekingIds?.length ?? 0) > 0 &&
      data.dateOfBirth !== undefined &&
      data.relationshipType !== undefined &&
      (data.photos?.length ?? 0) >= 2
    );
  }, [user?.isOnboardingComplete, data]);

  return {
    // Data
    data,

    // State
    currentStep,
    totalSteps: TOTAL_ONBOARDING_STEPS,
    isComplete,
    isSyncing: isUpdating || isFetching,
    isLoading: isProfileLoading,
    syncError: null as string | null, // RTK Query handles errors differently
    clearSyncError: () => {}, // No-op for API compatibility

    // Actions
    updateData,
    setCurrentStep: handleSetCurrentStep,
    reset,

    // Photo operations
    addPhoto,
    deletePhoto,
    reorderPhotos,
  };
}
