import { Migration } from '@mikro-orm/migrations';

export class UserEmails extends Migration {
  async up(): Promise<void> {
    this.addSql(
      `create table "user_emails" (
        "id" uuid not null,
        "user_id" uuid not null,
        "email" varchar(255) not null,
        "is_verified" boolean not null default false,
        "is_primary" boolean not null default false,
        "created_at" timestamptz(0) not null,
        "updated_at" timestamptz(0) not null,
        constraint "user_emails_pkey" primary key ("id")
      );`,
    );
    this.addSql(
      "comment on table \"user_emails\" is 'Information about a user''s email address.';",
    );
    this.addSql(
      'comment on column "user_emails"."email" is \'The users email address, in `a@b.c` format.\';',
    );
    this.addSql(
      'comment on column "user_emails"."is_verified" is \'True if the user has verified their email address (by clicking the link in the email we sent them, or logging in with a social login provider), false otherwise.\';',
    );
    this.addSql(
      'create index "user_emails_user_id_index" on "user_emails" ("user_id");',
    );
    this.addSql(
      'create index "user_emails_user_id_is_primary_index" on "user_emails" ("user_id", "is_primary");',
    );
    this.addSql(
      'alter table "user_emails" add constraint "user_emails_user_id_email_unique" unique ("user_id", "email");',
    );
    this.addSql(
      'alter table "user_emails" add constraint "user_emails_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade on delete cascade;',
    );
  }

  async down(): Promise<void> {
    this.addSql(
      'alter table "user_emails" drop constraint "user_emails_user_id_foreign";',
    );
    this.addSql(
      'alter table "user_emails" drop constraint "user_emails_user_id_email_unique";',
    );
    this.addSql('drop table if exists "user_emails" cascade;');
  }
}
