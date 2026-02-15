import { EntityManager } from '@mikro-orm/core';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IStorageService, STORAGE_SERVICE } from '../cloud/interfaces';
import { Gender } from '../database/entities/gender.entity';
import { RelationshipType } from '../database/entities/relationship-type.entity';
import { UserPhoto } from '../database/entities/user-photo.entity';
import {
  LocationType,
  UserProfile,
} from '../database/entities/user-profile.entity';
import { User } from '../database/entities/user.entity';
import { PetsService } from '../pets/pets.service';

export interface UpdateProfileDto {
  ageRangeMax?: number;
  ageRangeMin?: number;
  dateOfBirth?: string;
  firstName?: string;
  genderIds?: string[];
  location?: {
    city?: string;
    coordinates?: { lat: number; lng: number };
    country?: string;
    isoCountryCode?: string;
    region?: string;
    type: LocationType;
    zipCode?: string;
  };
  relationshipIds?: string[];
  seekingIds?: string[];
}

export interface AddPhotoDto {
  displayOrder?: number;
  url: string;
}

export interface GetPhotoUploadUrlDto {
  contentType: string;
  filename: string;
}

export interface ConfirmPhotoUploadDto {
  displayOrder?: number;
  key: string;
}

@Injectable()
export class ProfileService {
  constructor(
    private readonly em: EntityManager,
    private readonly petsService: PetsService,
    @Inject(STORAGE_SERVICE) private readonly storage: IStorageService
  ) {}

  async getProfile(userId: string): Promise<UserProfile> {
    return this.findOrCreateProfile(userId);
  }

  private async findOrCreateProfile(userId: string): Promise<UserProfile> {
    const existing = await this.em.findOne(
      UserProfile,
      { user: userId },
      { populate: ['photos', 'genders', 'seeking', 'relationshipTypes'] }
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
      { populate: ['photos', 'genders', 'seeking', 'relationshipTypes'] }
    );
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto
  ): Promise<UserProfile> {
    const profile = await this.findOrCreateProfile(userId);

    // Update scalar fields
    if (dto.firstName !== undefined) profile.firstName = dto.firstName;
    if (dto.dateOfBirth !== undefined)
      profile.dateOfBirth = new Date(dto.dateOfBirth);
    if (dto.relationshipIds !== undefined) {
      profile.relationshipTypes.removeAll();

      if (dto.relationshipIds.length > 0) {
        const options = await this.em.find(RelationshipType, {
          id: { $in: dto.relationshipIds },
        });
        options.forEach((opt) => profile.relationshipTypes.add(opt));
      }
    }
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
      profile.locationCity = dto.location.city;
      profile.locationCountry = dto.location.country;
      profile.locationIsoCountryCode = dto.location.isoCountryCode;
      profile.locationRegion = dto.location.region;
      profile.locationZipCode = dto.location.zipCode;
      profile.locationLat = dto.location.coordinates?.lat;
      profile.locationLng = dto.location.coordinates?.lng;
    }

    await this.em.flush();
    return profile;
  }

  async getPhotoUploadUrl(
    userId: string,
    dto: GetPhotoUploadUrlDto
  ): Promise<{ key: string; url: string }> {
    const ext = dto.filename.split('.').pop() || 'jpg';
    const key = `users/${userId}/photos/${Date.now()}.${ext}`;
    return this.storage.getPresignedUploadUrl(key, dto.contentType);
  }

  async confirmPhotoUpload(
    userId: string,
    dto: ConfirmPhotoUploadDto
  ): Promise<UserProfile> {
    // Verify the file exists in storage
    const exists = await this.storage.exists(dto.key);
    if (!exists) {
      throw new BadRequestException('Photo not found in storage');
    }

    const profile = await this.findOrCreateProfile(userId);

    // Determine display order
    const displayOrder = dto.displayOrder ?? profile.photos.length;

    // Store the S3 key as the URL (we'll generate signed URLs on read)
    const photo = new UserPhoto({
      displayOrder,
      url: dto.key,
      userProfile: profile,
    });

    this.em.persist(photo);
    await this.em.flush();

    // Refresh to get updated photos
    await this.em.refresh(profile, {
      populate: ['photos', 'genders', 'seeking', 'relationshipTypes'],
    });
    return profile;
  }

  async addPhoto(userId: string, dto: AddPhotoDto): Promise<UserProfile> {
    const profile = await this.findOrCreateProfile(userId);

    // Determine display order
    const displayOrder = dto.displayOrder ?? profile.photos.length;

    const photo = new UserPhoto({
      displayOrder,
      url: dto.url,
      userProfile: profile,
    });

    this.em.persist(photo);
    await this.em.flush();

    // Refresh to get updated photos
    await this.em.refresh(profile, {
      populate: ['photos', 'genders', 'seeking', 'relationshipTypes'],
    });
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

    // If the photo URL looks like an S3 key (starts with 'users/'), delete from storage
    if (photo.url.startsWith('users/')) {
      try {
        await this.storage.delete(photo.url);
      } catch {
        // Log error but continue with database deletion
      }
    }

    await this.em.removeAndFlush(photo);

    const profile = await this.em.findOneOrFail(
      UserProfile,
      { user: userId },
      { populate: ['photos', 'genders', 'seeking', 'relationshipTypes'] }
    );

    return profile;
  }

  async reorderPhotos(
    userId: string,
    photoIds: string[]
  ): Promise<UserProfile> {
    const profile = await this.em.findOneOrFail(
      UserProfile,
      { user: userId },
      { populate: ['photos', 'genders', 'seeking', 'relationshipTypes'] }
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

  async getSignedPhotoUrl(key: string): Promise<string> {
    return this.storage.getSignedUrl(key);
  }

  /**
   * Check if a URL is an S3 key that needs to be converted to a signed URL
   */
  private isS3Key(url: string): boolean {
    return url.startsWith('users/');
  }

  /**
   * Transform a profile's photo URLs to signed URLs for viewing
   */
  async serializeProfileWithSignedUrls(
    profile: UserProfile
  ): Promise<Record<string, unknown>> {
    const photos = await Promise.all(
      profile.photos.getItems().map(async (photo) => {
        let url = photo.url;
        if (this.isS3Key(photo.url)) {
          url = await this.storage.getSignedUrl(photo.url);
        }
        return {
          createdAt: photo.createdAt,
          displayOrder: photo.displayOrder,
          id: photo.id,
          url,
        };
      })
    );

    // Sort photos by display order
    photos.sort((a, b) => a.displayOrder - b.displayOrder);

    // Get user's pets with signed photo URLs
    const userId =
      typeof profile.user === 'string' ? profile.user : profile.user.id;
    const pets = await this.petsService.getUserPets(userId);

    return {
      ageRangeMax: profile.ageRangeMax,
      ageRangeMin: profile.ageRangeMin,
      dateOfBirth: profile.dateOfBirth?.toISOString().split('T')[0],
      firstName: profile.firstName,
      genders: profile.genders.getItems().map((g) => ({
        id: g.id,
        name: g.name,
      })),
      id: userId,
      isOnboardingComplete: this.calculateOnboardingComplete(profile),
      locationCity: profile.locationCity,
      locationCountry: profile.locationCountry,
      locationIsoCountryCode: profile.locationIsoCountryCode,
      locationLat: profile.locationLat,
      locationLng: profile.locationLng,
      locationRegion: profile.locationRegion,
      locationType: profile.locationType,
      locationZipCode: profile.locationZipCode,
      pets,
      photos,
      relationshipTypes: profile.relationshipTypes.getItems().map((r) => ({
        id: r.id,
        name: r.name,
      })),
      seeking: profile.seeking.getItems().map((g) => ({
        id: g.id,
        name: g.name,
      })),
    };
  }

  private calculateOnboardingComplete(profile: UserProfile): boolean {
    const photoCount = profile.photos.length;
    return (
      !!profile.firstName &&
      profile.firstName.length >= 2 &&
      !!profile.dateOfBirth &&
      profile.genders.length > 0 &&
      profile.seeking.length > 0 &&
      profile.relationshipTypes.length > 0 &&
      !!profile.locationType &&
      photoCount >= 2
    );
  }
}
