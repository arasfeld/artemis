import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Gender } from '../database/entities/gender.entity';

@Injectable()
export class GendersService {
  constructor(private readonly em: EntityManager) {}

  async findAll(): Promise<Gender[]> {
    return this.em.find(
      Gender,
      { isActive: true },
      { orderBy: { displayOrder: 'ASC' } },
    );
  }

  async findByIds(ids: string[]): Promise<Gender[]> {
    return this.em.find(Gender, { id: { $in: ids }, isActive: true });
  }

  async findById(id: string): Promise<Gender | null> {
    return this.em.findOne(Gender, { id, isActive: true });
  }
}
