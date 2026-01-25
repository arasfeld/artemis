import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { User } from '../database/entities/user.entity';
import {
  UserProfile,
  Gender,
  Seeking,
  RelationshipType,
  LocationType,
} from '../database/entities/user-profile.entity';
import { UserPhoto } from '../database/entities/user-photo.entity';

export interface ProfileResponse {
  firstName?: string;
  dateOfBirth?: string;
  gender?: Gender;
  seeking?: Seeking;
  relationshipType?: RelationshipType;
  ageRangeMin: number;
  ageRangeMax: number;
  location?: {
    type: LocationType;
    country?: string;
    zipCode?: string;
    coordinates?: { lat: number; lng: number };
  };
  photos: { id: string; url: string; displayOrder: number }[];
  isOnboardingComplete: boolean;
}

export interface UpdateProfileDto {
  firstName?: string;
  dateOfBirth?: string;
  gender?: Gender;
  seeking?: Seeking;
  relationshipType?: RelationshipType;
  ageRangeMin?: number;
  ageRangeMax?: number;
  location?: {
    type: LocationType;
    country?: string;
    zipCode?: string;
    coordinates?: { lat: number; lng: number };
  };
}

export interface AddPhotoDto {
  url: string;
  displayOrder?: number;
}

@Injectable()
export class ProfileService {
  constructor(private readonly em: EntityManager) {}

  async getProfile(userId: string): Promise<ProfileResponse> {
    const profile = await this.findOrCreateProfile(userId);
    return this.mapProfileToResponse(profile);
  }

  private async findOrCreateProfile(userId: string): Promise<UserProfile> {
    const existing = await this.em.findOne(
      UserProfile,
      { user: userId },
      { populate: ['photos'] },
    );

    if (existing) {
      return existing;
    }

    // Create profile if it doesn't exist (lazy creation)
    const user = await this.em.findOneOrFail(User, { id: userId });
    const newProfile = new UserProfile({ user });
    await this.em.persistAndFlush(newProfile);

    // Refetch with photos populated
    return this.em.findOneOrFail(
      UserProfile,
      { user: userId },
      { populate: ['photos'] },
    );
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<ProfileResponse> {
    const profile = await this.findOrCreateProfile(userId);

    // Update scalar fields
    if (dto.firstName !== undefined) profile.firstName = dto.firstName;
    if (dto.dateOfBirth !== undefined)
      profile.dateOfBirth = new Date(dto.dateOfBirth);
    if (dto.gender !== undefined) profile.gender = dto.gender;
    if (dto.seeking !== undefined) profile.seeking = dto.seeking;
    if (dto.relationshipType !== undefined)
      profile.relationshipType = dto.relationshipType;
    if (dto.ageRangeMin !== undefined) profile.ageRangeMin = dto.ageRangeMin;
    if (dto.ageRangeMax !== undefined) profile.ageRangeMax = dto.ageRangeMax;

    // Update location fields
    if (dto.location !== undefined) {
      profile.locationType = dto.location.type;
      profile.locationCountry = dto.location.country;
      profile.locationZipCode = dto.location.zipCode;
      profile.locationLat = dto.location.coordinates?.lat;
      profile.locationLng = dto.location.coordinates?.lng;
    }

    await this.em.flush();
    return this.mapProfileToResponse(profile);
  }

  async addPhoto(userId: string, dto: AddPhotoDto): Promise<ProfileResponse> {
    const profile = await this.findOrCreateProfile(userId);

    // Determine display order
    const displayOrder = dto.displayOrder ?? profile.photos.length;

    const photo = new UserPhoto({
      userProfile: profile,
      url: dto.url,
      displayOrder,
    });

    this.em.persist(photo);
    await this.em.flush();

    // Refresh to get updated photos
    await this.em.refresh(profile, { populate: ['photos'] });
    return this.mapProfileToResponse(profile);
  }

  async deletePhoto(userId: string, photoId: string): Promise<ProfileResponse> {
    const photo = await this.em.findOne(UserPhoto, {
      id: photoId,
      userProfile: { user: userId },
    });

    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    await this.em.removeAndFlush(photo);

    const profile = await this.em.findOneOrFail(
      UserProfile,
      { user: userId },
      { populate: ['photos'] },
    );

    return this.mapProfileToResponse(profile);
  }

  async reorderPhotos(
    userId: string,
    photoIds: string[],
  ): Promise<ProfileResponse> {
    const profile = await this.em.findOneOrFail(
      UserProfile,
      { user: userId },
      { populate: ['photos'] },
    );

    // Update display order for each photo
    for (let i = 0; i < photoIds.length; i++) {
      const photo = profile.photos.getItems().find((p) => p.id === photoIds[i]);
      if (photo) {
        photo.displayOrder = i;
      }
    }

    await this.em.flush();
    return this.mapProfileToResponse(profile);
  }

  private mapProfileToResponse(profile: UserProfile): ProfileResponse {
    const photos = profile.photos
      .getItems()
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((p) => ({ id: p.id, url: p.url, displayOrder: p.displayOrder }));

    const location = profile.locationType
      ? {
          type: profile.locationType,
          country: profile.locationCountry,
          zipCode: profile.locationZipCode,
          coordinates:
            profile.locationLat !== undefined &&
            profile.locationLng !== undefined
              ? { lat: profile.locationLat, lng: profile.locationLng }
              : undefined,
        }
      : undefined;

    return {
      firstName: profile.firstName,
      dateOfBirth: profile.dateOfBirth?.toISOString().split('T')[0],
      gender: profile.gender,
      seeking: profile.seeking,
      relationshipType: profile.relationshipType,
      ageRangeMin: profile.ageRangeMin,
      ageRangeMax: profile.ageRangeMax,
      location,
      photos,
      isOnboardingComplete: this.calculateOnboardingComplete(
        profile,
        photos.length,
      ),
    };
  }

  private calculateOnboardingComplete(
    profile: UserProfile,
    photoCount: number,
  ): boolean {
    return (
      !!profile.firstName &&
      profile.firstName.length >= 2 &&
      !!profile.dateOfBirth &&
      !!profile.gender &&
      !!profile.seeking &&
      !!profile.relationshipType &&
      !!profile.locationType &&
      photoCount >= 2
    );
  }
}
