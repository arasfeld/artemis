import {
  Collection,
  Entity,
  ManyToMany,
  PrimaryKey,
  Property,
  Unique,
} from '@mikro-orm/core';
import { v4 } from 'uuid';
import { Permission } from './permission.entity';
import { User } from './user.entity';

@Entity({
  tableName: 'roles',
  comment: 'Roles are groups of permissions that can be assigned to a user.',
})
export class Role {
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
  @ManyToMany(() => Permission, 'roles', { owner: true })
  public permissions = new Collection<Permission>(this);

  @ManyToMany(() => User, 'roles')
  public users = new Collection<User>(this);

  constructor(role: Partial<Role>) {
    Object.assign(this, role);
  }
}
