import { EntityManager } from '@mikro-orm/core';
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IStorageService, STORAGE_SERVICE } from '../cloud/interfaces';
import { Pet } from '../database/entities/pet.entity';
import { PetPhoto } from '../database/entities/pet-photo.entity';
import { PetType } from '../database/entities/pet-type.entity';
import { User } from '../database/entities/user.entity';

const MAX_PETS = 5;
const MAX_PET_PHOTOS = 4;

export interface CreatePetDto {
  birthday?: string;
  breed?: string;
  name: string;
  petTypeId: string;
}

export interface UpdatePetDto {
  birthday?: string | null;
  breed?: string | null;
  name?: string;
  petTypeId?: string;
}

export interface GetPetPhotoUploadUrlDto {
  contentType: string;
  filename: string;
}

export interface ConfirmPetPhotoUploadDto {
  displayOrder?: number;
  key: string;
}

@Injectable()
export class PetsService {
  constructor(
    private readonly em: EntityManager,
    @Inject(STORAGE_SERVICE) private readonly storage: IStorageService
  ) {}

  private isS3Key(url: string): boolean {
    return url.startsWith('users/');
  }

  async getUserPets(userId: string): Promise<Record<string, unknown>[]> {
    const pets = await this.em.find(
      Pet,
      { owner: userId },
      {
        orderBy: { displayOrder: 'ASC' },
        populate: ['petType', 'photos'],
      }
    );

    return Promise.all(pets.map((pet) => this.serializePet(pet)));
  }

  async createPet(
    userId: string,
    dto: CreatePetDto
  ): Promise<Record<string, unknown>> {
    const existingCount = await this.em.count(Pet, { owner: userId });
    if (existingCount >= MAX_PETS) {
      throw new BadRequestException(`Maximum of ${MAX_PETS} pets allowed`);
    }

    const user = await this.em.findOneOrFail(User, { id: userId });
    const petType = await this.em.findOneOrFail(PetType, {
      id: dto.petTypeId,
      isActive: true,
    });

    const pet = new Pet({
      birthday: dto.birthday ? new Date(dto.birthday) : undefined,
      breed: dto.breed,
      displayOrder: existingCount,
      name: dto.name,
      owner: user,
      petType,
    });

    await this.em.persistAndFlush(pet);

    // Refetch with relations
    const saved = await this.em.findOneOrFail(
      Pet,
      { id: pet.id },
      { populate: ['petType', 'photos'] }
    );
    return this.serializePet(saved);
  }

  async updatePet(
    userId: string,
    petId: string,
    dto: UpdatePetDto
  ): Promise<Record<string, unknown>> {
    const pet = await this.findOwnedPet(userId, petId);

    if (dto.name !== undefined) pet.name = dto.name;
    if (dto.breed !== undefined) pet.breed = dto.breed ?? undefined;
    if (dto.birthday !== undefined) {
      pet.birthday = dto.birthday ? new Date(dto.birthday) : undefined;
    }
    if (dto.petTypeId !== undefined) {
      const petType = await this.em.findOneOrFail(PetType, {
        id: dto.petTypeId,
        isActive: true,
      });
      pet.petType = petType;
    }

    await this.em.flush();
    return this.serializePet(pet);
  }

  async deletePet(userId: string, petId: string): Promise<void> {
    const pet = await this.findOwnedPet(userId, petId);

    // Delete all S3 photos
    for (const photo of pet.photos.getItems()) {
      if (this.isS3Key(photo.url)) {
        try {
          await this.storage.delete(photo.url);
        } catch {
          // Continue with deletion
        }
      }
    }

    await this.em.removeAndFlush(pet);
  }

  async getPhotoUploadUrl(
    userId: string,
    petId: string,
    dto: GetPetPhotoUploadUrlDto
  ): Promise<{ key: string; url: string }> {
    await this.findOwnedPet(userId, petId);

    const ext = dto.filename.split('.').pop() || 'jpg';
    const key = `users/${userId}/pets/${petId}/photos/${Date.now()}.${ext}`;
    return this.storage.getPresignedUploadUrl(key, dto.contentType);
  }

  async confirmPhotoUpload(
    userId: string,
    petId: string,
    dto: ConfirmPetPhotoUploadDto
  ): Promise<Record<string, unknown>> {
    const pet = await this.findOwnedPet(userId, petId);

    if (pet.photos.length >= MAX_PET_PHOTOS) {
      throw new BadRequestException(
        `Maximum of ${MAX_PET_PHOTOS} photos per pet allowed`
      );
    }

    const exists = await this.storage.exists(dto.key);
    if (!exists) {
      throw new BadRequestException('Photo not found in storage');
    }

    const displayOrder = dto.displayOrder ?? pet.photos.length;

    const photo = new PetPhoto({
      displayOrder,
      pet,
      url: dto.key,
    });

    this.em.persist(photo);
    await this.em.flush();

    await this.em.refresh(pet, { populate: ['petType', 'photos'] });
    return this.serializePet(pet);
  }

  async deletePhoto(
    userId: string,
    petId: string,
    photoId: string
  ): Promise<Record<string, unknown>> {
    const pet = await this.findOwnedPet(userId, petId);

    const photo = pet.photos.getItems().find((p) => p.id === photoId);
    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    if (this.isS3Key(photo.url)) {
      try {
        await this.storage.delete(photo.url);
      } catch {
        // Continue with deletion
      }
    }

    await this.em.removeAndFlush(photo);

    await this.em.refresh(pet, { populate: ['petType', 'photos'] });
    return this.serializePet(pet);
  }

  async reorderPhotos(
    userId: string,
    petId: string,
    photoIds: string[]
  ): Promise<Record<string, unknown>> {
    const pet = await this.findOwnedPet(userId, petId);

    for (let i = 0; i < photoIds.length; i++) {
      const photo = pet.photos.getItems().find((p) => p.id === photoIds[i]);
      if (photo) {
        photo.displayOrder = i;
      }
    }

    await this.em.flush();
    return this.serializePet(pet);
  }

  async serializePet(pet: Pet): Promise<Record<string, unknown>> {
    const photos = await Promise.all(
      pet.photos.getItems().map(async (photo) => {
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

    photos.sort((a, b) => a.displayOrder - b.displayOrder);

    return {
      birthday: pet.birthday?.toISOString().split('T')[0],
      breed: pet.breed,
      createdAt: pet.createdAt,
      displayOrder: pet.displayOrder,
      id: pet.id,
      name: pet.name,
      petType: {
        id: pet.petType.id,
        name: pet.petType.name,
      },
      photos,
    };
  }

  private async findOwnedPet(userId: string, petId: string): Promise<Pet> {
    const pet = await this.em.findOne(
      Pet,
      { id: petId },
      { populate: ['petType', 'photos', 'owner'] }
    );

    if (!pet) {
      throw new NotFoundException('Pet not found');
    }

    if (pet.owner.id !== userId) {
      throw new ForbiddenException('You do not own this pet');
    }

    return pet;
  }
}
