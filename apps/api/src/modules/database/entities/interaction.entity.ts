import { Entity, Enum, ManyToOne, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { User } from './user.entity';

export enum InteractionType {
  LIKE = 'like',
  PASS = 'pass',
  VIEW = 'view',
  FAVORITE = 'favorite',
  MESSAGE_REQUEST = 'message_request',
}

@Entity({
  tableName: 'interactions',
  comment: 'Unified user interactions (replaces swipes and user_interactions).',
})
@Unique({ properties: ['user', 'targetUser', 'interactionType'] })
export class Interaction {
  @PrimaryKey({ type: 'uuid' })
  public id: string = v4();

  @ManyToOne(() => User)
  public user!: User;

  @ManyToOne(() => User)
  public targetUser!: User;

  @Enum({ items: () => InteractionType })
  public interactionType!: InteractionType;

  @Property()
  public createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  public updatedAt: Date = new Date();

  constructor(interaction: Partial<Interaction>) {
    Object.assign(this, interaction);
  }
}
