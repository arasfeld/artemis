import {
  Entity,
  ManyToOne,
  PrimaryKey,
  Property,
  Unique,
} from '@mikro-orm/core';
import { v4 } from 'uuid';
import { User } from './user.entity';

@Entity({
  tableName: 'matches',
  comment: 'Mutual matches between users (when both have liked each other).',
})
@Unique({ properties: ['user1', 'user2'] })
export class Match {
  @PrimaryKey({ type: 'uuid' })
  public id: string = v4();

  @ManyToOne(() => User)
  public user1!: User;

  @ManyToOne(() => User)
  public user2!: User;

  @Property()
  public createdAt: Date = new Date();

  constructor(match: Partial<Match>) {
    Object.assign(this, match);
  }
}
