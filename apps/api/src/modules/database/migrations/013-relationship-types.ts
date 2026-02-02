import { Migration } from '@mikro-orm/migrations';

export class Migration1738400000000 extends Migration {
  async up(): Promise<void> {
    // Create relationship_types table
    this.addSql(`
      create table "relationship_types" (
        "id" uuid primary key default gen_random_uuid(),
        "name" varchar(100) not null,
        "description" text null,
        "display_order" int not null default 0,
        "is_active" boolean not null default true,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now()
      );
    `);
    this.addSql(
      `comment on table "relationship_types" is 'Predefined relationship types users can select for their profile.'`
    );

    // Create pivot table for user profile relationships
    this.addSql(`
      create table "user_profile_relationship_types" (
        "user_profile_user_id" uuid not null,
        "relationship_type_id" uuid not null,
        constraint "user_profile_relationship_types_pkey" primary key ("user_profile_user_id", "relationship_type_id")
      )
    `);
    this.addSql(`
      alter table "user_profile_relationship_types"
        add constraint "user_profile_relationship_types_user_profile_user_id_fkey"
        foreign key ("user_profile_user_id") references "user_profiles" ("user_id") on delete cascade
    `);
    this.addSql(`
      alter table "user_profile_relationship_types"
        add constraint "user_profile_relationship_types_relationship_type_id_fkey"
        foreign key ("relationship_type_id") references "relationship_types" ("id") on delete cascade
    `);

    // Seed relationship options
    this.addSql(`
        insert into "relationship_types" ("name", "description", "display_order", "is_active") values
          ('New friends', null, 0, true),
          ('Long-term dating', null, 1, true),
          ('Short-term dating', null, 2, true),
          ('Hookups', null, 3, true)
      `);
  }

  async down(): Promise<void> {
    this.addSql(`drop table if exists "user_profile_relationship_types"`);
    this.addSql(`drop table if exists "relationship_types"`);
  }
}
