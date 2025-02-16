import { Migration } from '@mikro-orm/migrations';

export class UserEmailSecrets extends Migration {
  async up(): Promise<void> {
    this.addSql(
      `create table "user_email_secrets" (
        "user_email_id" uuid not null,
        "verification_token" varchar(255) null,
        "verification_email_sent_at" timestamptz(0) null,
        "password_reset_email_sent_at" timestamptz(0) null,
        constraint "user_email_secrets_pkey" primary key ("user_email_id")
      );`,
    );
    this.addSql(
      'comment on table "user_email_secrets" is \'The contents of this table should never be visible to the user. Contains data mostly related to email verification and avoiding spamming users.\';',
    );
    this.addSql(
      'comment on column "user_email_secrets"."password_reset_email_sent_at" is \'We store the time the last password reset was sent to this email to prevent the email getting flooded.\';',
    );
    this.addSql(
      'alter table "user_email_secrets" add constraint "user_email_secrets_user_email_id_foreign" foreign key ("user_email_id") references "user_emails" ("id") on update cascade on delete cascade;',
    );
  }

  async down(): Promise<void> {
    this.addSql(
      'alter table "user_email_secrets" drop constraint "user_email_secrets_user_email_id_foreign";',
    );
    this.addSql('drop table if exists "user_email_secrets" cascade;');
  }
}
