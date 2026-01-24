import {
  Cascade,
  Entity,
  Index,
  ManyToOne,
  PrimaryKey,
  Property,
  Unique,
} from '@mikro-orm/core';
import { v4 } from 'uuid';
import { User } from './user.entity';

@Entity({
  tableName: 'user_authentications',
  comment:
    'Contains information about the login providers this user has used, so that they may disconnect them should they wish.',
})
@Unique({ properties: ['service', 'identifier'] })
export class UserAuthentication {
  @PrimaryKey({ type: 'uuid' })
  public id: string = v4();

  @Index()
  @ManyToOne({ entity: () => User, index: true, cascade: [Cascade.REMOVE] })
  public user!: User;

  @Property({ comment: 'The login service used, e.g. `google` or `twitter`.' })
  public service!: string;

  @Property({
    hidden: true,
    comment: 'A unique identifier for the user within the login service.',
  })
  public identifier!: string;

  @Property()
  public createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  public updatedAt: Date = new Date();

  constructor(userAuthentication: Partial<UserAuthentication>) {
    Object.assign(this, userAuthentication);
  }
}
