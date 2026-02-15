import {
  Cascade,
  Collection,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { v4 } from 'uuid';
import { PetPhoto } from './pet-photo.entity';
import { PetType } from './pet-type.entity';
import { User } from './user.entity';

@Entity({
  tableName: 'pets',
  comment: 'Pets belonging to users.',
})
export class Pet {
  @PrimaryKey({ type: 'uuid' })
  public id: string = v4();

  @Index()
  @ManyToOne({ entity: () => User, cascade: [Cascade.REMOVE] })
  public owner!: User;

  @Index()
  @ManyToOne({ entity: () => PetType })
  public petType!: PetType;

  @Property({
    length: 100,
    comment: 'Name of the pet.',
  })
  public name!: string;

  @Property({
    length: 100,
    nullable: true,
    comment: 'Breed of the pet.',
  })
  public breed?: string;

  @Property({
    type: 'date',
    nullable: true,
    comment: 'Birthday of the pet.',
  })
  public birthday?: Date;

  @Property({
    columnType: 'int',
    default: 0,
    comment: "Display order among the user's pets.",
  })
  public displayOrder: number = 0;

  @OneToMany(() => PetPhoto, (photo) => photo.pet)
  public photos = new Collection<PetPhoto>(this);

  @Property()
  public createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  public updatedAt: Date = new Date();

  constructor(pet: Partial<Pet>) {
    Object.assign(this, pet);
  }
}
