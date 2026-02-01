import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '@/lib/api-config';
import { getToken } from '@/lib/storage';
import type {
  DiscoverProfile,
  GenderData,
  MatchData,
  PhotoData,
  ProfileData,
  SwipeRequest,
  SwipeResponse,
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
  tagTypes: ['Discover', 'Genders', 'Matches', 'Profile', 'User'],
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

    // Genders endpoints
    getGenders: builder.query<GenderData[], void>({
      query: () => '/genders',
      providesTags: ['Genders'],
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
            // Handle scalar fields optimistically
            // For genderIds and seekingIds, wait for server response
            if (patch.firstName !== undefined) draft.firstName = patch.firstName;
            if (patch.dateOfBirth !== undefined) draft.dateOfBirth = patch.dateOfBirth;
            if (patch.relationshipType !== undefined) draft.relationshipType = patch.relationshipType;
            if (patch.ageRangeMin !== undefined) draft.ageRangeMin = patch.ageRangeMin;
            if (patch.ageRangeMax !== undefined) draft.ageRangeMax = patch.ageRangeMax;
            if (patch.location !== undefined) draft.location = patch.location;
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

    // Discover endpoints
    getDiscoverFeed: builder.query<DiscoverProfile[], void>({
      query: () => '/discover',
      providesTags: ['Discover'],
    }),
    getMatches: builder.query<MatchData[], void>({
      query: () => '/discover/matches',
      providesTags: ['Matches'],
    }),
    recordSwipe: builder.mutation<SwipeResponse, SwipeRequest>({
      query: (data) => ({
        url: '/discover/swipe',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Discover', 'Matches'],
    }),
  }),
});

export const {
  useAddPhotoMutation,
  useDeletePhotoMutation,
  useGetAuthProfileQuery,
  useGetDiscoverFeedQuery,
  useGetGendersQuery,
  useGetMatchesQuery,
  useGetProfileQuery,
  useLogoutMutation,
  useRecordSwipeMutation,
  useReorderPhotosMutation,
  useUpdateProfileMutation,
} = apiSlice;
