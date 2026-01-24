import {
  Collection,
  Entity,
  ManyToMany,
  PrimaryKey,
  Property,
  Unique,
} from '@mikro-orm/core';
import { v4 } from 'uuid';
import { Role } from './role.entity';
import { User } from './user.entity';

@Entity({
  tableName: 'permissions',
  comment:
    'A permission is an individual right to perform some action on some resource',
})
export class Permission {
  @PrimaryKey({ type: 'uuid' })
  public id: string = v4();

  @Unique()
  @Property()
  public name!: string;

  @Property()
  public createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  public updatedAt: Date = new Date();

  // relations
  @ManyToMany(() => Role, 'permissions')
  public roles = new Collection<Role>(this);

  @ManyToMany(() => User, 'permissions')
  public users = new Collection<User>(this);

  constructor(permission: Partial<Permission>) {
    Object.assign(this, permission);
  }
}
