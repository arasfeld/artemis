import { Migration } from '@mikro-orm/migrations';

export class Permissions extends Migration {
  async up(): Promise<void> {
    this.addSql(
      `create table "permissions" (
        "id" uuid not null,
        "name" varchar(255) not null,
        "created_at" timestamptz(0) not null,
        "updated_at" timestamptz(0) not null,
        constraint "permissions_pkey" primary key ("id")
      );`,
    );
    this.addSql(
      'comment on table "permissions" is \'A permission is an individual right to perform some action on some resource\';',
    );
    this.addSql(
      'alter table "permissions" add constraint "permissions_name_unique" unique ("name");',
    );

    this.addSql(
      `create table "roles_permissions" (
        "role_id" uuid not null,
        "permission_id" uuid not null,
        constraint "roles_permissions_pkey" primary key ("role_id", "permission_id")
      );`,
    );
    this.addSql(
      'alter table "roles_permissions" add constraint "roles_permissions_role_id_foreign" foreign key ("role_id") references "roles" ("id") on update cascade on delete cascade;',
    );
    this.addSql(
      'alter table "roles_permissions" add constraint "roles_permissions_permission_id_foreign" foreign key ("permission_id") references "permissions" ("id") on update cascade on delete cascade;',
    );

    this.addSql(
      `create table "users_permissions" (
        "user_id" uuid not null,
        "permission_id" uuid not null, constraint "users_permissions_pkey" primary key ("user_id", "permission_id")
      );`,
    );
    this.addSql(
      'alter table "users_permissions" add constraint "users_permissions_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade on delete cascade;',
    );
    this.addSql(
      'alter table "users_permissions" add constraint "users_permissions_permission_id_foreign" foreign key ("permission_id") references "permissions" ("id") on update cascade on delete cascade;',
    );
  }

  async down(): Promise<void> {
    this.addSql(
      'alter table "users_permissions" drop constraint "users_permissions_permission_id_foreign";',
    );
    this.addSql(
      'alter table "users_permissions" drop constraint "users_permissions_user_id_foreign";',
    );
    this.addSql('drop table if exists "users_permissions" cascade;');

    this.addSql(
      'alter table "roles_permissions" drop constraint "roles_permissions_permission_id_foreign";',
    );
    this.addSql(
      'alter table "roles_permissions" drop constraint "roles_permissions_role_id_foreign";',
    );
    this.addSql('drop table if exists "roles_permissions" cascade;');

    this.addSql(
      'alter table "permissions" drop constraint "permissions_name_unique";',
    );
    this.addSql('drop table if exists "permissions" cascade;');
  }
}
