import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { PetType } from '../database/entities/pet-type.entity';

@Injectable()
export class PetTypesService {
  constructor(private readonly em: EntityManager) {}

  async findAll(): Promise<PetType[]> {
    return this.em.find(
      PetType,
      { isActive: true },
      { orderBy: { displayOrder: 'ASC' } }
    );
  }
}
