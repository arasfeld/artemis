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

// Profile types for onboarding data
export type RelationshipType = 'casual' | 'serious' | 'friendship' | 'unsure';
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
  relationshipType?: RelationshipType;
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
  relationshipType?: RelationshipType;
  seekingIds?: string[];
}

// Photo data
export interface PhotoData {
  createdAt: string;
  displayOrder: number;
  id: string;
  url: string;
}
