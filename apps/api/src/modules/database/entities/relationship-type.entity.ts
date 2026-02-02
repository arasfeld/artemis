import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 } from 'uuid';

@Entity({
  tableName: 'relationship_types',
  comment: 'Relationship types users can select for their profile.',
})
export class RelationshipType {
  @PrimaryKey({ type: 'uuid' })
  public id: string = v4();

  @Property({ length: 100, comment: 'Display name for the option.' })
  public name!: string;

  @Property({
    type: 'text',
    nullable: true,
    comment: 'Description explaining this relationship type.',
  })
  public description?: string;

  @Property({
    default: 0,
    comment: 'Order in which to display this relationship type in lists.',
  })
  public displayOrder: number = 0;

  @Property({
    default: true,
    comment: 'Whether this relationship type is active and selectable.',
  })
  public isActive: boolean = true;

  @Property()
  public createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  public updatedAt: Date = new Date();

  constructor(data: Partial<RelationshipType>) {
    Object.assign(this, data);
  }
}
