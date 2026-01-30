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

// Profile data returned from API
export interface ProfileData {
  id: string;
  firstName?: string;
  dateOfBirth?: string;
  gender?: Gender;
  seeking?: Seeking;
  relationshipType?: RelationshipType;
  ageRangeMin: number;
  ageRangeMax: number;
  locationType?: LocationType;
  locationCountry?: string;
  locationZipCode?: string;
  locationCoordinates?: { lat: number; lng: number };
  location?: LocationData; // Combined location data for easier use
  photos: PhotoData[];
  isOnboardingComplete: boolean; // Required field
}

// Data for updating profile (partial updates allowed)
export type UpdateProfileData = Partial<{
  firstName: string;
  dateOfBirth: string;
  gender: Gender;
  seeking: Seeking;
  relationshipType: RelationshipType;
  ageRangeMin: number;
  ageRangeMax: number;
  locationType: LocationType;
  locationCountry: string;
  locationZipCode: string;
  locationCoordinates: { lat: number; lng: number };
  location: LocationData;
}>;

// Photo data
export interface PhotoData {
  id: string;
  url: string;
  displayOrder: number;
  createdAt: string;
}
