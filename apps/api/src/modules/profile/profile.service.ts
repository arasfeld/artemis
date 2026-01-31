import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Gender } from '../database/entities/gender.entity';
import { User } from '../database/entities/user.entity';
import {
  UserProfile,
  RelationshipType,
  LocationType,
} from '../database/entities/user-profile.entity';
import { UserPhoto } from '../database/entities/user-photo.entity';

export interface UpdateProfileDto {
  firstName?: string;
  dateOfBirth?: string;
  genderIds?: string[];
  seekingIds?: string[];
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

  async getProfile(userId: string): Promise<UserProfile> {
    return this.findOrCreateProfile(userId);
  }

  private async findOrCreateProfile(userId: string): Promise<UserProfile> {
    const existing = await this.em.findOne(
      UserProfile,
      { user: userId },
      { populate: ['photos', 'genders', 'seeking'] },
    );

    if (existing) {
      return existing;
    }

    // Create profile if it doesn't exist (lazy creation)
    const user = await this.em.findOneOrFail(User, { id: userId });
    const newProfile = new UserProfile({ user });
    await this.em.persistAndFlush(newProfile);

    // Refetch with all relations populated
    return this.em.findOneOrFail(
      UserProfile,
      { user: userId },
      { populate: ['photos', 'genders', 'seeking'] },
    );
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<UserProfile> {
    const profile = await this.findOrCreateProfile(userId);

    // Update scalar fields
    if (dto.firstName !== undefined) profile.firstName = dto.firstName;
    if (dto.dateOfBirth !== undefined)
      profile.dateOfBirth = new Date(dto.dateOfBirth);
    if (dto.relationshipType !== undefined)
      profile.relationshipType = dto.relationshipType;
    if (dto.ageRangeMin !== undefined) profile.ageRangeMin = dto.ageRangeMin;
    if (dto.ageRangeMax !== undefined) profile.ageRangeMax = dto.ageRangeMax;

    // Update genders relationships (up to 5)
    if (dto.genderIds !== undefined) {
      // Clear existing genders relationships
      profile.genders.removeAll();

      if (dto.genderIds.length > 0) {
        // Limit to 5 genders
        const limitedIds = dto.genderIds.slice(0, 5);
        const genders = await this.em.find(Gender, {
          id: { $in: limitedIds },
          isActive: true,
        });
        genders.forEach((gender) => profile.genders.add(gender));
      }
    }

    // Update seeking relationships
    if (dto.seekingIds !== undefined) {
      // Clear existing seeking relationships
      profile.seeking.removeAll();

      if (dto.seekingIds.length > 0) {
        const seekingGenders = await this.em.find(Gender, {
          id: { $in: dto.seekingIds },
          isActive: true,
        });
        seekingGenders.forEach((gender) => profile.seeking.add(gender));
      }
    }

    // Update location fields
    if (dto.location !== undefined) {
      profile.locationType = dto.location.type;
      profile.locationCountry = dto.location.country;
      profile.locationZipCode = dto.location.zipCode;
      profile.locationLat = dto.location.coordinates?.lat;
      profile.locationLng = dto.location.coordinates?.lng;
    }

    await this.em.flush();
    return profile;
  }

  async addPhoto(userId: string, dto: AddPhotoDto): Promise<UserProfile> {
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
    await this.em.refresh(profile, { populate: ['photos', 'genders', 'seeking'] });
    return profile;
  }

  async deletePhoto(userId: string, photoId: string): Promise<UserProfile> {
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
      { populate: ['photos', 'genders', 'seeking'] },
    );

    return profile;
  }

  async reorderPhotos(
    userId: string,
    photoIds: string[],
  ): Promise<UserProfile> {
    const profile = await this.em.findOneOrFail(
      UserProfile,
      { user: userId },
      { populate: ['photos', 'genders', 'seeking'] },
    );

    // Update display order for each photo
    for (let i = 0; i < photoIds.length; i++) {
      const photo = profile.photos.getItems().find((p) => p.id === photoIds[i]);
      if (photo) {
        photo.displayOrder = i;
      }
    }

    await this.em.flush();
    return profile;
  }

  private calculateOnboardingComplete(
    profile: UserProfile,
  ): boolean {
    const photoCount = profile.photos.length;
    return (
      !!profile.firstName &&
      profile.firstName.length >= 2 &&
      !!profile.dateOfBirth &&
      profile.genders.length > 0 &&
      profile.seeking.length > 0 &&
      !!profile.relationshipType &&
      !!profile.locationType &&
      photoCount >= 2
    );
  }
}
