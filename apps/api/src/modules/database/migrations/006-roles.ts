import { Migration } from '@mikro-orm/migrations';

export class Roles extends Migration {
  async up(): Promise<void> {
    this.addSql(
      `create table "roles" (
        "id" uuid not null,
        "name" varchar(255) not null,
        "created_at" timestamptz(0) not null,
        "updated_at" timestamptz(0) not null,
        constraint "roles_pkey" primary key ("id")
      );`,
    );
    this.addSql(
      'comment on table "roles" is \'Roles are groups of permissions that can be assigned to a user.\';',
    );
    this.addSql(
      'alter table "roles" add constraint "roles_name_unique" unique ("name");',
    );

    this.addSql(
      `create table "users_roles" (
        "user_id" uuid not null,
        "role_id" uuid not null,
        constraint "users_roles_pkey" primary key ("user_id", "role_id")
      );`,
    );
    this.addSql(
      'alter table "users_roles" add constraint "users_roles_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade on delete cascade;',
    );
    this.addSql(
      'alter table "users_roles" add constraint "users_roles_role_id_foreign" foreign key ("role_id") references "roles" ("id") on update cascade on delete cascade;',
    );
  }

  async down(): Promise<void> {
    this.addSql(
      'alter table "users_roles" drop constraint "users_roles_role_id_foreign";',
    );
    this.addSql(
      'alter table "users_roles" drop constraint "users_roles_user_id_foreign";',
    );
    this.addSql('drop table if exists "users_roles" cascade;');

    this.addSql('alter table "roles" drop constraint "roles_name_unique";');
    this.addSql('drop table if exists "roles" cascade;');
  }
}
