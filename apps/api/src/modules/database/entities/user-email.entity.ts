import {
  Cascade,
  Entity,
  Index,
  ManyToOne,
  OneToOne,
  PrimaryKey,
  Property,
  Unique,
} from '@mikro-orm/core';
import { v4 } from 'uuid';
import { UserEmailSecrets } from './user-email-secrets.entity';
import { User } from './user.entity';

@Entity({
  tableName: 'user_emails',
  comment: "Information about a user's email address.",
})
@Index({ properties: ['user', 'isPrimary'] })
@Unique({ properties: ['user', 'email'] })
export class UserEmail {
  @PrimaryKey({ type: 'uuid' })
  public id: string = v4();

  @Index()
  @ManyToOne({ entity: () => User, cascade: [Cascade.REMOVE] })
  public user!: User;

  @Property({
    length: 255,
    comment: 'The users email address, in `a@b.c` format.',
  })
  public email!: string;

  @Property({
    default: false,
    type: 'boolean',
    comment:
      'True if the user has verified their email address (by clicking the link in the email we sent them, or logging in with a social login provider), false otherwise.',
  })
  public isVerified = false;

  @Property({ default: false, type: 'boolean' })
  public isPrimary = false;

  @Property()
  public createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  public updatedAt: Date = new Date();

  @OneToOne(
    () => UserEmailSecrets,
    (userEmailSecret) => userEmailSecret.userEmail,
    { hidden: true },
  )
  public userEmailSecrets?: UserEmailSecrets;

  constructor(userEmail: Partial<UserEmail>) {
    Object.assign(this, userEmail);
  }
}
