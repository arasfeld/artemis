import {
  Check,
  Collection,
  Entity,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryKey,
  Property,
  Unique,
} from '@mikro-orm/core';
import { v4 } from 'uuid';
import { Permission } from './permission.entity';
import { Role } from './role.entity';
import { UserAuthentication } from './user-authentication.entity';
import { UserEmail } from './user-email.entity';
import { UserSecrets } from './user-secrets.entity';

@Entity({
  tableName: 'users',
  comment: 'A user who can log in to the application.',
})
export class User {
  @PrimaryKey({ type: 'uuid' })
  public id: string = v4();

  @Property({
    length: 24,
    comment: "Public-facing username (or 'handle') of the user.",
  })
  @Check<User>({
    expression: (columns) =>
      `length(${columns.username}) >= 2 and length(${columns.username}) <= 24 and ${columns.username} ~ '^[a-zA-Z]([_]?[a-zA-Z0-9])+$'`,
  })
  @Unique()
  public username!: string;

  @Property()
  public createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  public updatedAt: Date = new Date();

  // relations
  @ManyToMany(() => Permission, 'users', { owner: true })
  public permissions = new Collection<Permission>(this);

  @ManyToMany(() => Role, 'users', { owner: true })
  public roles = new Collection<Role>(this);

  @OneToMany(
    () => UserAuthentication,
    (userAuthentication) => userAuthentication.user,
  )
  public userAuthentications = new Collection<UserAuthentication>(this);

  @OneToMany(() => UserEmail, (userEmail) => userEmail.user)
  public userEmails = new Collection<UserEmail>(this);

  @OneToOne(() => UserSecrets, (userSecrets) => userSecrets.user, {
    hidden: true,
  })
  public userSecrets?: UserSecrets;

  constructor(user: Partial<User>) {
    Object.assign(this, user);
  }
}
