import { Cascade, Entity, OneToOne, Property } from '@mikro-orm/core';
import { User } from './user.entity';

@Entity({
  tableName: 'user_secrets',
  comment:
    'The contents of this table should never be visible to the user. Contains data mostly related to authentication.',
})
export class UserSecrets {
  @OneToOne({ entity: () => User, primary: true, cascade: [Cascade.REMOVE] })
  public user!: User;

  @Property({
    nullable: true,
    hidden: true,
    comment:
      "A cryptographic hash of the user's password. This will be null if the user signed up with a social login provider.",
  })
  public passwordHash?: string;

  @Property({ hidden: true })
  public lastLoginAt: Date = new Date();

  @Property({ columnType: 'int', default: 0, hidden: true })
  public failedPasswordAttempts = 0;

  @Property({ nullable: true, hidden: true })
  public firstFailedPasswordAttempt?: Date;

  @Property({ nullable: true, hidden: true })
  public resetPasswordToken?: string;

  @Property({ nullable: true, hidden: true })
  public resetPasswordTokenGenerated?: Date;

  @Property({ columnType: 'int', default: 0, hidden: true })
  public failedResetPasswordAttempts = 0;

  @Property({ nullable: true, hidden: true })
  public firstFailedResetPasswordAttempt?: Date;

  @Property({ nullable: true, hidden: true })
  public deleteAccountToken?: string;

  @Property({ nullable: true, hidden: true })
  public deleteAccountTokenGenerated?: Date;

  constructor(userSecrets: Partial<UserSecrets>) {
    Object.assign(this, userSecrets);
  }
}
