import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 } from 'uuid';

@Entity({
  tableName: 'pet_types',
  comment: 'Types of pets that users can add to their profile.',
})
export class PetType {
  @PrimaryKey({ type: 'uuid' })
  public id: string = v4();

  @Property({
    length: 50,
    comment: 'Display name for the pet type (e.g., "Dog", "Cat").',
  })
  public name!: string;

  @Property({
    default: 0,
    comment: 'Order in which to display this pet type in lists.',
  })
  public displayOrder: number = 0;

  @Property({
    default: true,
    comment: 'Whether this pet type is active and selectable.',
  })
  public isActive: boolean = true;

  @Property()
  public createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  public updatedAt: Date = new Date();

  constructor(petType: Partial<PetType>) {
    Object.assign(this, petType);
  }
}
