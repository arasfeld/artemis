import { Migration } from '@mikro-orm/migrations';

export class Users extends Migration {
  async up(): Promise<void> {
    this.addSql(
      `create table "users" (
        "id" uuid not null,
        "username" varchar(24) not null,
        "created_at" timestamptz(0) not null,
        "updated_at" timestamptz(0) not null,
        constraint "users_pkey" primary key ("id"),
        constraint users_username_check check (length(username) >= 2 and length(username) <= 24 and username ~ '^[a-zA-Z]([_]?[a-zA-Z0-9])+$')
      );`,
    );
    this.addSql(
      'comment on table "users" is \'A user who can log in to the application.\';',
    );
    this.addSql(
      "comment on column \"users\".\"username\" is 'Public-facing username (or ''handle'') of the user.';",
    );
    this.addSql(
      'alter table "users" add constraint "users_username_unique" unique ("username");',
    );
  }

  async down(): Promise<void> {
    this.addSql('alter table "users" drop constraint "users_username_unique";');
    this.addSql('drop table if exists "users" cascade;');
  }
}
