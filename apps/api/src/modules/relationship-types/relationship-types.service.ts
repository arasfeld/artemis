import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { RelationshipType } from '../database/entities/relationship-type.entity';

@Injectable()
export class RelationshipTypesService {
  constructor(private readonly em: EntityManager) {}

  async findAll(): Promise<RelationshipType[]> {
    return this.em.find(
      RelationshipType,
      { isActive: true },
      { orderBy: { displayOrder: 'ASC' } }
    );
  }

  async findByIds(ids: string[]): Promise<RelationshipType[]> {
    return this.em.find(RelationshipType, { id: { $in: ids }, isActive: true });
  }

  async findById(id: string): Promise<RelationshipType | null> {
    return this.em.findOne(RelationshipType, { id, isActive: true });
  }
}
