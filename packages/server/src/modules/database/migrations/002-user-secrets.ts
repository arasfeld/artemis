import { Migration } from '@mikro-orm/migrations';

export class UserSecrets extends Migration {
  async up(): Promise<void> {
    this.addSql(
      `create table "user_secrets" (
        "user_id" uuid not null,
        "password_hash" varchar(255) null,
        "last_login_at" timestamptz(0) not null,
        "failed_password_attempts" int not null default 0,
        "first_failed_password_attempt" timestamptz(0) null,
        "reset_password_token" varchar(255) null,
        "reset_password_token_generated" timestamptz(0) null,
        "failed_reset_password_attempts" int not null default 0,
        "first_failed_reset_password_attempt" timestamptz(0) null,
        "delete_account_token" varchar(255) null,
        "delete_account_token_generated" timestamptz(0) null,
        constraint "user_secrets_pkey" primary key ("user_id")
      );`,
    );
    this.addSql(
      'comment on table "user_secrets" is \'The contents of this table should never be visible to the user. Contains data mostly related to authentication.\';',
    );
    this.addSql(
      'comment on column "user_secrets"."password_hash" is \'A cryptographic hash of the user\'\'s password. This will be null if the user signed up with a social login provider.\';',
    );
    this.addSql(
      'alter table "user_secrets" add constraint "user_secrets_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade on delete cascade;',
    );
  }

  async down(): Promise<void> {
    this.addSql(
      'alter table "user_secrets" drop constraint "user_secrets_user_id_foreign";',
    );
    this.addSql('drop table if exists "user_secrets" cascade;');
  }
}
