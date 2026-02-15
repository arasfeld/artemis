// API Types - used by RTK Query in store/api/apiSlice.ts

export interface UserProfile {
  id: string;
  username?: string;
  email?: string;
  createdAt: string;
  isOnboardingComplete?: boolean;
}

export interface ApiError {
  message: string;
  statusCode: number;
}

// Gender types
export interface GenderData {
  id: string;
  name: string;
  description?: string;
  isPrimary: boolean;
}

// Relationship type returned from API
export interface RelationshipTypeData {
  id: string;
  name: string;
  description?: string;
}

// Profile types for onboarding data
export type LocationType = 'automatic' | 'manual';

export interface LocationData {
  city?: string;
  coordinates?: { lat: number; lng: number };
  country?: string;
  isoCountryCode?: string;
  region?: string;
  type: LocationType;
  zipCode?: string;
}

// Profile data returned from API
export interface ProfileData {
  ageRangeMax: number;
  ageRangeMin: number;
  dateOfBirth?: string;
  firstName?: string;
  genders: GenderData[];
  isOnboardingComplete: boolean;
  // Location is returned as flat fields from the API
  locationCity?: string;
  locationCountry?: string;
  locationIsoCountryCode?: string;
  locationLat?: number;
  locationLng?: number;
  locationRegion?: string;
  locationType?: LocationType;
  locationZipCode?: string;
  pets: PetData[];
  photos: PhotoData[];
  relationshipTypes?: RelationshipTypeData[];
  seeking: GenderData[];
}

// Data for updating profile (partial updates allowed)
export interface UpdateProfileData {
  ageRangeMax?: number;
  ageRangeMin?: number;
  dateOfBirth?: string;
  firstName?: string;
  genderIds?: string[];
  location?: LocationData;
  relationshipIds?: string[];
  seekingIds?: string[];
}

// Photo data
export interface PhotoData {
  createdAt: string;
  displayOrder: number;
  id: string;
  url: string;
}

// Photo upload types
export interface GetUploadUrlRequest {
  contentType: string;
  filename: string;
}

export interface GetUploadUrlResponse {
  key: string;
  url: string;
}

export interface ConfirmPhotoUploadRequest {
  displayOrder?: number;
  key: string;
}

// Pet types
export interface PetTypeData {
  id: string;
  name: string;
}

export interface PetPhotoData {
  createdAt: string;
  displayOrder: number;
  id: string;
  url: string;
}

export interface PetData {
  birthday?: string;
  breed?: string;
  createdAt: string;
  displayOrder: number;
  id: string;
  name: string;
  petType: PetTypeData;
  photos: PetPhotoData[];
}

export interface CreatePetRequest {
  birthday?: string;
  breed?: string;
  name: string;
  petTypeId: string;
}

export interface UpdatePetRequest {
  birthday?: string | null;
  breed?: string | null;
  name?: string;
  petTypeId?: string;
}

// Discover types
export interface DiscoverProfile {
  age: number;
  firstName: string;
  genders: {
    id: string;
    name: string;
  }[];
  id: string;
  location?: string;
  pets: PetData[];
  photos: {
    displayOrder: number;
    id: string;
    url: string;
  }[];
  relationshipTypes?: RelationshipTypeData[];
}

export type SwipeAction = 'like' | 'pass';

export interface SwipeRequest {
  action: SwipeAction;
  userId: string;
}

export interface MatchedUser {
  firstName: string;
  id: string;
  photo: string | null;
}

export interface SwipeResponse {
  match: { id: string; user: MatchedUser } | null;
}

export interface MatchData {
  createdAt: string;
  id: string;
  user: MatchedUser;
}

// Messaging types
export interface ConversationUser {
  firstName: string;
  id: string;
  photo: string | null;
}

export interface LastMessage {
  content: string;
  createdAt: string;
  isFromMe: boolean;
}

export interface ConversationData {
  createdAt: string;
  id: string;
  lastMessage: LastMessage | null;
  unreadCount: number;
  user: ConversationUser;
}

export interface MessageData {
  content: string;
  createdAt: string;
  id: string;
  isFromMe: boolean;
  readAt: string | null;
}

export interface SendMessageRequest {
  content: string;
  matchId: string;
}

export interface UnreadCountResponse {
  count: number;
}
