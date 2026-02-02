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
  type: LocationType;
  country?: string;
  zipCode?: string;
  coordinates?: { lat: number; lng: number };
}

// Profile data returned from API
export interface ProfileData {
  ageRangeMax: number;
  ageRangeMin: number;
  dateOfBirth?: string;
  firstName?: string;
  genders: GenderData[];
  isOnboardingComplete: boolean;
  location?: LocationData;
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
