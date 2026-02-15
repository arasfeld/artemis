import {
  Cascade,
  Entity,
  Index,
  ManyToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { v4 } from 'uuid';
import { Pet } from './pet.entity';

@Entity({
  tableName: 'pet_photos',
  comment: 'Photos of pets.',
})
export class PetPhoto {
  @PrimaryKey({ type: 'uuid' })
  public id: string = v4();

  @Index()
  @ManyToOne({ entity: () => Pet, cascade: [Cascade.REMOVE] })
  public pet!: Pet;

  @Property({
    length: 500,
    comment: 'URL or S3 key for the photo.',
  })
  public url!: string;

  @Property({
    columnType: 'int',
    default: 0,
    comment: 'Display order (0 = primary photo).',
  })
  public displayOrder: number = 0;

  @Property()
  public createdAt: Date = new Date();

  constructor(petPhoto: Partial<PetPhoto>) {
    Object.assign(this, petPhoto);
  }
}
