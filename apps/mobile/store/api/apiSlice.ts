import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '@/lib/api-config';
import { getToken } from '@/lib/storage';
import type {
  PhotoData,
  ProfileData,
  UpdateProfileData,
  UserProfile,
} from '@/types/api';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: async (headers) => {
      const token = await getToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['User', 'Profile'],
  endpoints: (builder) => ({
    // Auth endpoints
    getAuthProfile: builder.query<UserProfile, void>({
      query: () => '/auth/profile',
      providesTags: ['User'],
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['User', 'Profile'],
    }),

    // Profile/Onboarding endpoints
    getProfile: builder.query<ProfileData, void>({
      query: () => '/profile',
      providesTags: ['Profile'],
    }),
    updateProfile: builder.mutation<ProfileData, UpdateProfileData>({
      query: (data) => ({
        url: '/profile',
        method: 'PATCH',
        body: data,
      }),
      async onQueryStarted(patch, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          apiSlice.util.updateQueryData('getProfile', undefined, (draft) => {
            Object.assign(draft, patch);
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: ['Profile'],
    }),

    // Photo endpoints
    addPhoto: builder.mutation<ProfileData, { url: string; displayOrder?: number }>({
      query: ({ url, displayOrder }) => ({
        url: '/profile/photos',
        method: 'POST',
        body: { url, displayOrder },
      }),
      invalidatesTags: ['Profile'],
    }),
    deletePhoto: builder.mutation<ProfileData, string>({
      query: (photoId) => ({
        url: `/profile/photos/${photoId}`,
        method: 'DELETE',
      }),
      async onQueryStarted(photoId, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          apiSlice.util.updateQueryData('getProfile', undefined, (draft) => {
            draft.photos = draft.photos.filter((p: PhotoData) => p.id !== photoId);
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: ['Profile'],
    }),
    reorderPhotos: builder.mutation<ProfileData, string[]>({
      query: (photoIds) => ({
        url: '/profile/photos/reorder',
        method: 'PATCH',
        body: { photoIds },
      }),
      async onQueryStarted(photoIds, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          apiSlice.util.updateQueryData('getProfile', undefined, (draft) => {
            const photosMap = new Map(draft.photos.map((p: PhotoData) => [p.id, p]));
            draft.photos = photoIds
              .map((id, idx) => {
                const photo = photosMap.get(id);
                return photo ? { ...photo, displayOrder: idx } : null;
              })
              .filter((p): p is PhotoData => p !== null);
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: ['Profile'],
    }),
  }),
});

export const {
  useGetAuthProfileQuery,
  useLogoutMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useAddPhotoMutation,
  useDeletePhotoMutation,
  useReorderPhotosMutation,
} = apiSlice;
