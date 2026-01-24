import { Cascade, Entity, OneToOne, Property } from '@mikro-orm/core';
import { UserEmail } from './user-email.entity';

@Entity({
  tableName: 'user_email_secrets',
  comment:
    'The contents of this table should never be visible to the user. Contains data mostly related to email verification and avoiding spamming users.',
})
export class UserEmailSecrets {
  @OneToOne({
    entity: () => UserEmail,
    primary: true,
    cascade: [Cascade.REMOVE],
  })
  public userEmail!: UserEmail;

  @Property({ nullable: true, hidden: true })
  public verificationToken?: string;

  @Property({ nullable: true, hidden: true })
  public verificationEmailSentAt?: Date;

  @Property({
    nullable: true,
    hidden: true,
    comment:
      'We store the time the last password reset was sent to this email to prevent the email getting flooded.',
  })
  public passwordResetEmailSentAt?: Date;

  constructor(userEmailSecrets: Partial<UserEmailSecrets>) {
    Object.assign(this, userEmailSecrets);
  }
}
