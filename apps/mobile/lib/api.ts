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

// Profile types for onboarding data
export type Gender = 'male' | 'female' | 'non-binary';
export type Seeking = 'male' | 'female' | 'everyone';
export type RelationshipType = 'casual' | 'serious' | 'friendship' | 'unsure';
export type LocationType = 'automatic' | 'manual';

export interface LocationData {
  type: LocationType;
  country?: string;
  zipCode?: string;
  coordinates?: { lat: number; lng: number };
}

export interface PhotoData {
  id: string;
  url: string;
  displayOrder: number;
}

export interface ProfileData {
  firstName?: string;
  dateOfBirth?: string;
  gender?: Gender;
  seeking?: Seeking;
  relationshipType?: RelationshipType;
  ageRangeMin: number;
  ageRangeMax: number;
  location?: LocationData;
  photos: PhotoData[];
  isOnboardingComplete: boolean;
}

export interface UpdateProfileData {
  firstName?: string;
  dateOfBirth?: string;
  gender?: Gender;
  seeking?: Seeking;
  relationshipType?: RelationshipType;
  ageRangeMin?: number;
  ageRangeMax?: number;
  location?: LocationData;
}
