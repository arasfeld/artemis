import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '@/lib/api-config';
import { getToken } from '@/lib/storage';
import type {
  ConfirmPhotoUploadRequest,
  ConversationData,
  DiscoverProfile,
  GenderData,
  GetUploadUrlRequest,
  GetUploadUrlResponse,
  MatchData,
  MessageData,
  PhotoData,
  ProfileData,
  RelationshipTypeData,
  SendMessageRequest,
  SwipeRequest,
  SwipeResponse,
  UnreadCountResponse,
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
  tagTypes: [
    'Conversations',
    'Discover',
    'Genders',
    'Matches',
    'Messages',
    'Profile',
    'RelationshipTypes',
    'UnreadCount',
    'User',
  ],
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

    // Relationship types (from backend)
    getRelationshipTypes: builder.query<RelationshipTypeData[], void>({
      query: () => '/relationship-types',
      providesTags: ['RelationshipTypes'],
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
            if (patch.firstName !== undefined)
              draft.firstName = patch.firstName;
            if (patch.dateOfBirth !== undefined)
              draft.dateOfBirth = patch.dateOfBirth;
            if (patch.relationshipIds !== undefined)
              draft.relationshipTypes = (patch.relationshipIds || []).map(
                (id) => ({ id, name: id })
              );
            if (patch.ageRangeMin !== undefined)
              draft.ageRangeMin = patch.ageRangeMin;
            if (patch.ageRangeMax !== undefined)
              draft.ageRangeMax = patch.ageRangeMax;
            if (patch.location !== undefined) draft.location = patch.location;
          })
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
    getPhotoUploadUrl: builder.mutation<
      GetUploadUrlResponse,
      GetUploadUrlRequest
    >({
      query: (data) => ({
        url: '/profile/photos/upload-url',
        method: 'POST',
        body: data,
      }),
    }),
    confirmPhotoUpload: builder.mutation<
      ProfileData,
      ConfirmPhotoUploadRequest
    >({
      query: (data) => ({
        url: '/profile/photos/confirm',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Profile'],
    }),
    addPhoto: builder.mutation<
      ProfileData,
      { url: string; displayOrder?: number }
    >({
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
            draft.photos = draft.photos.filter(
              (p: PhotoData) => p.id !== photoId
            );
          })
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
            const photosMap = new Map(
              draft.photos.map((p: PhotoData) => [p.id, p])
            );
            draft.photos = photoIds
              .map((id, idx) => {
                const photo = photosMap.get(id);
                return photo ? { ...photo, displayOrder: idx } : null;
              })
              .filter((p): p is PhotoData => p !== null);
          })
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
      invalidatesTags: ['Conversations', 'Discover', 'Matches'],
    }),

    // Messaging endpoints
    getConversations: builder.query<ConversationData[], void>({
      query: () => '/messages/conversations',
      providesTags: ['Conversations'],
    }),
    getUnreadCount: builder.query<UnreadCountResponse, void>({
      query: () => '/messages/unread-count',
      providesTags: ['UnreadCount'],
    }),
    getMessages: builder.query<
      MessageData[],
      { matchId: string; before?: string }
    >({
      query: ({ matchId, before }) => {
        const params = new URLSearchParams();
        if (before) params.set('before', before);
        const queryString = params.toString();
        return `/messages/${matchId}${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: (_result, _error, { matchId }) => [
        { type: 'Messages', id: matchId },
      ],
    }),
    sendMessage: builder.mutation<MessageData, SendMessageRequest>({
      query: ({ matchId, content }) => ({
        url: `/messages/${matchId}`,
        method: 'POST',
        body: { content },
      }),
      async onQueryStarted({ matchId, content }, { dispatch, queryFulfilled }) {
        // Optimistic update for messages list
        const tempId = `temp-${Date.now()}`;
        const optimisticMessage: MessageData = {
          content,
          createdAt: new Date().toISOString(),
          id: tempId,
          isFromMe: true,
          readAt: null,
        };
        const patchResult = dispatch(
          apiSlice.util.updateQueryData('getMessages', { matchId }, (draft) => {
            draft.unshift(optimisticMessage);
          })
        );
        try {
          const { data: newMessage } = await queryFulfilled;
          // Replace optimistic message with real one
          dispatch(
            apiSlice.util.updateQueryData(
              'getMessages',
              { matchId },
              (draft) => {
                const index = draft.findIndex((m) => m.id === tempId);
                if (index !== -1) {
                  draft[index] = newMessage;
                }
              }
            )
          );
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (_result, _error, { matchId }) => [
        'Conversations',
        { type: 'Messages', id: matchId },
      ],
    }),
    markMessagesAsRead: builder.mutation<{ success: boolean }, string>({
      query: (matchId) => ({
        url: `/messages/${matchId}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Conversations', 'UnreadCount'],
    }),
  }),
});

export const {
  useAddPhotoMutation,
  useConfirmPhotoUploadMutation,
  useDeletePhotoMutation,
  useGetAuthProfileQuery,
  useGetConversationsQuery,
  useGetDiscoverFeedQuery,
  useGetGendersQuery,
  useGetMatchesQuery,
  useGetMessagesQuery,
  useGetPhotoUploadUrlMutation,
  useGetProfileQuery,
  useGetRelationshipTypesQuery,
  useGetUnreadCountQuery,
  useLogoutMutation,
  useMarkMessagesAsReadMutation,
  useRecordSwipeMutation,
  useReorderPhotosMutation,
  useSendMessageMutation,
  useUpdateProfileMutation,
} = apiSlice;
