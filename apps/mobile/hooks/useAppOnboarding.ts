import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { uploadPhoto } from '@/lib/photo-upload';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  useAddPhotoMutation,
  useConfirmPhotoUploadMutation,
  useDeletePhotoMutation,
  useGetPhotoUploadUrlMutation,
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

const STORAGE_KEY = 'onboarding_data';

export function useAppOnboarding() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppAuth();
  const [syncError, setSyncError] = useState<string | null>(null);

  const currentStep = useAppSelector(selectCurrentStep);
  const onboardingData = useAppSelector(selectOnboardingData);

  // Helper to map server profile shape to local OnboardingData
  const mapServerProfileToOnboarding = (sp?: any): OnboardingData => {
    // Map flat location fields from server to nested LocationData object
    let location: OnboardingData['location'];
    if (sp?.locationType) {
      location = {
        city: sp.locationCity,
        coordinates:
          sp.locationLat && sp.locationLng
            ? { lat: sp.locationLat, lng: sp.locationLng }
            : undefined,
        country: sp.locationCountry,
        isoCountryCode: sp.locationIsoCountryCode,
        region: sp.locationRegion,
        type: sp.locationType,
        zipCode: sp.locationZipCode,
      };
    } else if (sp?.location) {
      // Fallback for if server ever returns nested location
      location = sp.location;
    }

    return {
      ageRangeMax: sp?.ageRangeMax ?? 45,
      ageRangeMin: sp?.ageRangeMin ?? 18,
      dateOfBirth: sp?.dateOfBirth,
      firstName: sp?.firstName || '',
      genderIds: sp?.genders?.map((g: any) => g.id) || [],
      location,
      photos: sp?.photos?.map((p: any) => p.url) || [],
      relationshipTypes:
        sp?.relationshipTypes?.map((r: any) => r.id) || sp?.relationshipTypes,
      seekingIds: sp?.seeking?.map((g: any) => g.id) || [],
    };
  };

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
  const [getPhotoUploadUrl] = useGetPhotoUploadUrlMutation();
  const [confirmPhotoUpload] = useConfirmPhotoUploadMutation();
  const [deletePhotoMutation] = useDeletePhotoMutation();
  const [reorderPhotosMutation] = useReorderPhotosMutation();
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

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

  // When server profile becomes available (e.g. after sign-in), replace
  // any locally saved onboarding data with the authoritative server data.
  useEffect(() => {
    if (!serverProfile) return;

    const serverData = mapServerProfileToOnboarding(serverProfile);

    // Replace redux state and persist to AsyncStorage
    dispatch(loadOnboardingData(serverData));
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(serverData)).catch(
      () => {}
    );
  }, [serverProfile, dispatch]);

  // Merge server data with local data using API format
  const data: OnboardingData = useMemo(() => {
    const base: OnboardingData = mapServerProfileToOnboarding(serverProfile);

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
          const payload: any = { ...partial };
          if ((partial as any).relationshipTypes !== undefined) {
            payload.relationshipIds = (partial as any).relationshipTypes;
            delete payload.relationshipTypes;
          }
          await updateProfile(payload).unwrap();
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to sync profile';
          setSyncError(errorMessage);
          console.error('Failed to sync profile:', error);
        }
      }
    },
    [dispatch, isAuthenticated, updateProfile]
  );

  // Photo operations

  // Upload a photo using presigned URL flow (for production S3/LocalStack)
  const uploadAndAddPhoto = useCallback(
    async (localUri: string, displayOrder?: number): Promise<boolean> => {
      setIsUploadingPhoto(true);
      setSyncError(null);

      try {
        if (isAuthenticated) {
          // Upload to S3 via presigned URL
          const s3Key = await uploadPhoto(localUri, async (params) => {
            return getPhotoUploadUrl(params).unwrap();
          });

          // Confirm the upload with our backend
          await confirmPhotoUpload({ key: s3Key, displayOrder }).unwrap();
        } else {
          // Not authenticated - just store locally for now
          // The photo will be uploaded when they complete onboarding
          const newPhotos = [...(data.photos || []), localUri];
          dispatch(updateOnboardingData({ photos: newPhotos }));
        }
        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to upload photo';
        setSyncError(errorMessage);
        console.error('Failed to upload photo:', error);
        return false;
      } finally {
        setIsUploadingPhoto(false);
      }
    },
    [
      isAuthenticated,
      getPhotoUploadUrl,
      confirmPhotoUpload,
      data.photos,
      dispatch,
    ]
  );

  // Legacy addPhoto for backwards compatibility (uses old URL-based approach)
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
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to add photo';
        setSyncError(errorMessage);
        console.error('Failed to add photo:', error);
      }
    },
    [isAuthenticated, addPhotoMutation, data.photos, dispatch]
  );

  const deletePhoto = useCallback(
    async (photoIdOrIndex: string | number) => {
      try {
        if (isAuthenticated && typeof photoIdOrIndex === 'string') {
          await deletePhotoMutation(photoIdOrIndex).unwrap();
        } else if (typeof photoIdOrIndex === 'number') {
          const newPhotos = data.photos.filter(
            (_: string, i: number) => i !== photoIdOrIndex
          );
          dispatch(updateOnboardingData({ photos: newPhotos }));
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to delete photo';
        setSyncError(errorMessage);
        console.error('Failed to delete photo:', error);
      }
    },
    [isAuthenticated, deletePhotoMutation, data.photos, dispatch]
  );

  const reorderPhotos = useCallback(
    async (photoIds: string[]) => {
      if (isAuthenticated) {
        await reorderPhotosMutation(photoIds).unwrap();
      }
    },
    [isAuthenticated, reorderPhotosMutation]
  );

  // Reset all onboarding state
  const reset = useCallback(() => {
    dispatch(resetOnboarding());
  }, [dispatch]);

  const handleSetCurrentStep = useCallback(
    (step: number) => {
      dispatch(setCurrentStep(step));
    },
    [dispatch]
  );

  // Calculate isComplete
  const isComplete = useMemo(() => {
    return (
      user?.isOnboardingComplete ??
      ((data.firstName?.length ?? 0) >= 2 &&
        data.location !== undefined &&
        (data.genderIds?.length ?? 0) > 0 &&
        (data.seekingIds?.length ?? 0) > 0 &&
        data.dateOfBirth !== undefined &&
        data.relationshipTypes !== undefined &&
        (data.relationshipTypes?.length ?? 0) > 0 &&
        (data.photos?.length ?? 0) >= 2)
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
    isUploadingPhoto,
    syncError, // RTK Query handles errors differently
    clearSyncError: () => {}, // No-op for API compatibility

    // Actions
    updateData,
    setCurrentStep: handleSetCurrentStep,
    reset,

    // Photo operations
    addPhoto,
    deletePhoto,
    reorderPhotos,
    uploadAndAddPhoto,
  };
}
