import { Migration } from '@mikro-orm/migrations';

export class Matches extends Migration {
  override async up(): Promise<void> {
    // Create matches table (mutual likes between users)
    this.addSql(`
      create table "matches" (
        "id" uuid not null default gen_random_uuid(),
        "user1_id" uuid not null,
        "user2_id" uuid not null,
        "created_at" timestamptz not null default current_timestamp,
        constraint "matches_pkey" primary key ("id"),
        constraint "matches_user1_id_foreign" foreign key ("user1_id") references "users" ("id") on update cascade on delete cascade,
        constraint "matches_user2_id_foreign" foreign key ("user2_id") references "users" ("id") on update cascade on delete cascade,
        constraint "matches_user1_user2_unique" unique ("user1_id", "user2_id")
      );
    `);

    // Create indexes for faster lookups
    this.addSql(
      `create index "matches_user1_id_index" on "matches" ("user1_id");`
    );
    this.addSql(
      `create index "matches_user2_id_index" on "matches" ("user2_id");`
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "matches" cascade;`);
  }
}
