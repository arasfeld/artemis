import { Migration } from '@mikro-orm/migrations';

export class Messages extends Migration {
  override async up(): Promise<void> {
    // Create messages table
    this.addSql(`
      create table "messages" (
        "id" uuid not null default gen_random_uuid(),
        "match_id" uuid not null,
        "sender_id" uuid not null,
        "content" text not null,
        "created_at" timestamptz not null default current_timestamp,
        "read_at" timestamptz,
        constraint "messages_pkey" primary key ("id"),
        constraint "messages_match_id_foreign" foreign key ("match_id") references "matches" ("id") on update cascade on delete cascade,
        constraint "messages_sender_id_foreign" foreign key ("sender_id") references "users" ("id") on update cascade on delete cascade
      );
    `);

    // Index for fetching messages by match (conversation)
    this.addSql(
      `create index "messages_match_id_index" on "messages" ("match_id");`
    );

    // Index for fetching messages by sender
    this.addSql(
      `create index "messages_sender_id_index" on "messages" ("sender_id");`
    );

    // Index for ordering messages by creation time
    this.addSql(
      `create index "messages_created_at_index" on "messages" ("created_at");`
    );

    // Partial index for unread messages (for efficient unread count queries)
    this.addSql(
      `create index "messages_unread_index" on "messages" ("match_id", "sender_id") where "read_at" is null;`
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "messages" cascade;`);
  }
}
