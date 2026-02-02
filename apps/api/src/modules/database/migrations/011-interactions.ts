import { Migration } from '@mikro-orm/migrations';

export class Interactions extends Migration {
  override async up(): Promise<void> {
    // Create interactions table (unified table for all user interactions)
    this.addSql(`
      create table "interactions" (
        "id" uuid not null default gen_random_uuid(),
        "user_id" uuid not null,
        "target_user_id" uuid not null,
        "interaction_type" text check ("interaction_type" in ('like', 'pass', 'view', 'favorite', 'message_request')) not null,
        "created_at" timestamptz not null default current_timestamp,
        "updated_at" timestamptz not null default current_timestamp,
        constraint "interactions_pkey" primary key ("id"),
        constraint "interactions_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade on delete cascade,
        constraint "interactions_target_user_id_foreign" foreign key ("target_user_id") references "users" ("id") on update cascade on delete cascade
      );
    `);

    // Create unique index to prevent duplicate interactions of the same type
    this.addSql(`
      create unique index "interactions_user_target_type_unique" on "interactions" ("user_id", "target_user_id", "interaction_type");
    `);

    // Create indexes for faster lookups
    this.addSql(
      `create index "interactions_user_id_index" on "interactions" ("user_id");`
    );
    this.addSql(
      `create index "interactions_target_user_id_index" on "interactions" ("target_user_id");`
    );
    this.addSql(
      `create index "interactions_type_index" on "interactions" ("interaction_type");`
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "interactions" cascade;`);
  }
}
