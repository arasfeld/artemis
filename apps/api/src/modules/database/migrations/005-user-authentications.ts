import { Migration } from '@mikro-orm/migrations';

export class UserAuthentications extends Migration {
  async up(): Promise<void> {
    this.addSql(
      `create table "user_authentications" (
        "id" uuid not null,
        "user_id" uuid not null,
        "service" varchar(255) not null,
        "identifier" varchar(255) not null,
        "created_at" timestamptz(0) not null,
        "updated_at" timestamptz(0) not null,
        constraint "user_authentications_pkey" primary key ("id")
      );`,
    );
    this.addSql(
      'comment on table "user_authentications" is \'Contains information about the login providers this user has used, so that they may disconnect them should they wish.\';',
    );
    this.addSql(
      'comment on column "user_authentications"."service" is \'The login service used, e.g. `google` or `twitter`.\';',
    );
    this.addSql(
      'comment on column "user_authentications"."identifier" is \'A unique identifier for the user within the login service.\';',
    );
    this.addSql(
      'create index "user_authentications_user_id_index" on "user_authentications" ("user_id");',
    );
    this.addSql(
      'alter table "user_authentications" add constraint "user_authentications_service_identifier_unique" unique ("service", "identifier");',
    );
    this.addSql(
      'alter table "user_authentications" add constraint "user_authentications_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade on delete cascade;',
    );
  }

  async down(): Promise<void> {
    this.addSql(
      'alter table "user_authentications" drop constraint "user_authentications_user_id_foreign";',
    );
    this.addSql(
      'alter table "user_authentications" drop constraint "user_authentications_service_identifier_unique";',
    );
    this.addSql('drop table if exists "user_authentications" cascade;');
  }
}
