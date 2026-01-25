import { useCallback, useMemo, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useAddPhotoMutation,
  useDeletePhotoMutation,
  useReorderPhotosMutation,
} from '../store/api/apiSlice';
import {
  setCurrentStep,
  setLocalEdit,
  loadLocalEdits,
  resetOnboarding,
  selectCurrentStep,
  selectLocalEdits,
  type LocalEdits,
} from '../store/slices/onboardingSlice';
import { useAppAuth } from './useAppAuth';
import {
  type OnboardingData,
  TOTAL_ONBOARDING_STEPS,
} from '../types/onboarding';
import type { UpdateProfileData } from '../lib/api';

const STORAGE_KEY = 'onboarding_local_edits';

export function useAppOnboarding() {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppAuth();

  const currentStep = useAppSelector(selectCurrentStep);
  const localEdits = useAppSelector(selectLocalEdits);

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
          dispatch(loadLocalEdits(JSON.parse(stored)));
        } catch {
          // Ignore parse errors
        }
      }
    });
  }, [dispatch]);

  // Merge server data with local edits
  const data: OnboardingData = useMemo(() => {
    const base: OnboardingData = {
      firstName: serverProfile?.firstName || '',
      location: serverProfile?.location || null,
      gender: serverProfile?.gender || null,
      seeking: serverProfile?.seeking || null,
      dateOfBirth: serverProfile?.dateOfBirth
        ? new Date(serverProfile.dateOfBirth)
        : null,
      relationshipType: serverProfile?.relationshipType || null,
      ageRange: {
        min: serverProfile?.ageRangeMin ?? 18,
        max: serverProfile?.ageRangeMax ?? 45,
      },
      photos: serverProfile?.photos?.map((p) => p.url) || [],
    };

    // Apply local edits on top
    return {
      ...base,
      ...(localEdits.firstName !== undefined && {
        firstName: localEdits.firstName,
      }),
      ...(localEdits.location !== undefined && { location: localEdits.location }),
      ...(localEdits.gender !== undefined && { gender: localEdits.gender }),
      ...(localEdits.seeking !== undefined && { seeking: localEdits.seeking }),
      ...(localEdits.dateOfBirth !== undefined && {
        dateOfBirth: localEdits.dateOfBirth
          ? new Date(localEdits.dateOfBirth)
          : null,
      }),
      ...(localEdits.relationshipType !== undefined && {
        relationshipType: localEdits.relationshipType,
      }),
      ...(localEdits.ageRange !== undefined && { ageRange: localEdits.ageRange }),
      ...(localEdits.photos !== undefined && { photos: localEdits.photos }),
    };
  }, [serverProfile, localEdits]);

  // Update data (local + sync to server)
  const updateData = useCallback(
    async (partial: Partial<OnboardingData>) => {
      // Convert Date to string for local edits
      const editPayload: LocalEdits = {};
      if (partial.firstName !== undefined) {
        editPayload.firstName = partial.firstName;
      }
      if (partial.dateOfBirth !== undefined) {
        editPayload.dateOfBirth = partial.dateOfBirth?.toISOString();
      }
      if (partial.gender !== undefined) {
        editPayload.gender = partial.gender;
      }
      if (partial.seeking !== undefined) {
        editPayload.seeking = partial.seeking;
      }
      if (partial.relationshipType !== undefined) {
        editPayload.relationshipType = partial.relationshipType;
      }
      if (partial.ageRange !== undefined) {
        editPayload.ageRange = partial.ageRange;
      }
      if (partial.location !== undefined) {
        editPayload.location = partial.location;
      }
      if (partial.photos !== undefined) {
        editPayload.photos = partial.photos;
      }

      dispatch(setLocalEdit(editPayload));

      // Sync to server if authenticated
      if (isAuthenticated) {
        const apiUpdate: UpdateProfileData = {};
        if (partial.firstName !== undefined) {
          apiUpdate.firstName = partial.firstName;
        }
        if (partial.dateOfBirth !== undefined && partial.dateOfBirth) {
          apiUpdate.dateOfBirth = partial.dateOfBirth.toISOString().split('T')[0];
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
          apiUpdate.location = partial.location;
        }

        if (Object.keys(apiUpdate).length > 0) {
          try {
            await updateProfile(apiUpdate).unwrap();
          } catch (error) {
            console.error('Failed to sync profile:', error);
          }
        }
      }
    },
    [dispatch, isAuthenticated, updateProfile],
  );

  // Photo operations
  const addPhoto = useCallback(
    async (url: string, displayOrder?: number) => {
      if (isAuthenticated) {
        await addPhotoMutation({ url, displayOrder }).unwrap();
      } else {
        const newPhotos = [...(localEdits.photos || data.photos), url];
        dispatch(setLocalEdit({ photos: newPhotos }));
      }
    },
    [isAuthenticated, addPhotoMutation, localEdits.photos, data.photos, dispatch],
  );

  const deletePhoto = useCallback(
    async (photoIdOrIndex: string | number) => {
      if (isAuthenticated && typeof photoIdOrIndex === 'string') {
        await deletePhotoMutation(photoIdOrIndex).unwrap();
      } else {
        const photos = localEdits.photos || data.photos;
        const newPhotos = photos.filter((_, i) => i !== photoIdOrIndex);
        dispatch(setLocalEdit({ photos: newPhotos }));
      }
    },
    [isAuthenticated, deletePhotoMutation, localEdits.photos, data.photos, dispatch],
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
  const isComplete = serverProfile
    ? serverProfile.isOnboardingComplete
    : data.firstName.length >= 2 &&
      data.location !== null &&
      data.gender !== null &&
      data.seeking !== null &&
      data.dateOfBirth !== null &&
      data.relationshipType !== null &&
      data.photos.length >= 2;

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
