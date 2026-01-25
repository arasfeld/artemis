import { Platform } from 'react-native';
import { getToken } from './storage';

// Android emulator uses 10.0.2.2 to reach host machine's localhost
const API_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const API_PORT = 4000;
export const API_BASE_URL = `http://${API_HOST}:${API_PORT}`;

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

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const token = await getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error: ApiError = {
        message: 'Request failed',
        statusCode: response.status,
      };

      try {
        const body = await response.json();
        error.message = body.message || error.message;
      } catch {
        // Ignore JSON parse errors
      }

      throw error;
    }

    return response.json();
  }

  async getProfile(): Promise<UserProfile> {
    return this.request<UserProfile>('/auth/profile');
  }

  async verifyToken(): Promise<{ valid: boolean; userId: string }> {
    return this.request<{ valid: boolean; userId: string }>('/auth/verify');
  }

  async logout(): Promise<void> {
    await this.request('/auth/logout', { method: 'POST' });
  }

  // Profile endpoints for onboarding data
  async getOnboardingProfile(): Promise<ProfileData> {
    return this.request<ProfileData>('/profile');
  }

  async updateProfile(data: UpdateProfileData): Promise<ProfileData> {
    return this.request<ProfileData>('/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async addPhoto(url: string, displayOrder?: number): Promise<ProfileData> {
    return this.request<ProfileData>('/profile/photos', {
      method: 'POST',
      body: JSON.stringify({ url, displayOrder }),
    });
  }

  async deletePhoto(photoId: string): Promise<ProfileData> {
    return this.request<ProfileData>(`/profile/photos/${photoId}`, {
      method: 'DELETE',
    });
  }

  async reorderPhotos(photoIds: string[]): Promise<ProfileData> {
    return this.request<ProfileData>('/profile/photos/reorder', {
      method: 'PATCH',
      body: JSON.stringify({ photoIds }),
    });
  }
}

export const api = new ApiClient();
