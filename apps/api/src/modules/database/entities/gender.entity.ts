import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 } from 'uuid';

@Entity({
  tableName: 'genders',
  comment: 'Gender identities that users can select for their profile.',
})
export class Gender {
  @PrimaryKey({ type: 'uuid' })
  public id: string = v4();

  @Property({
    length: 100,
    comment: 'Display name for the gender (e.g., "Man", "Non-binary").',
  })
  public name!: string;

  @Property({
    type: 'text',
    nullable: true,
    comment: 'Description explaining this gender identity.',
  })
  public description?: string;

  @Property({
    default: 0,
    comment: 'Order in which to display this gender in lists.',
  })
  public displayOrder: number = 0;

  @Property({
    default: false,
    comment:
      'Whether this is a primary gender shown by default (e.g., Man, Woman).',
  })
  public isPrimary: boolean = false;

  @Property({
    default: true,
    comment: 'Whether this gender is active and selectable.',
  })
  public isActive: boolean = true;

  @Property()
  public createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  public updatedAt: Date = new Date();

  constructor(gender: Partial<Gender>) {
    Object.assign(this, gender);
  }
}
