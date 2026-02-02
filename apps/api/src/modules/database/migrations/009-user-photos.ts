import { Migration } from '@mikro-orm/migrations';

export class UserPhotos extends Migration {
  async up(): Promise<void> {
    this.addSql(
      `create table "user_photos" (
        "id" uuid not null,
        "user_profile_user_id" uuid not null,
        "url" varchar(500) not null,
        "display_order" int not null default 0,
        "created_at" timestamptz(0) not null,
        constraint "user_photos_pkey" primary key ("id")
      );`
    );

    this.addSql(
      `comment on table "user_photos" is 'Photos uploaded by users for their profile.';`
    );
    this.addSql(
      `comment on column "user_photos"."url" is 'URL to the photo.';`
    );
    this.addSql(
      `comment on column "user_photos"."display_order" is 'Display order (0 = primary photo).';`
    );

    this.addSql(
      'create index "user_photos_user_profile_user_id_index" on "user_photos" ("user_profile_user_id");'
    );

    this.addSql(
      `alter table "user_photos" add constraint "user_photos_user_profile_user_id_foreign" foreign key ("user_profile_user_id") references "user_profiles" ("user_id") on update cascade on delete cascade;`
    );
  }

  async down(): Promise<void> {
    this.addSql(
      'alter table "user_photos" drop constraint "user_photos_user_profile_user_id_foreign";'
    );
    this.addSql('drop table if exists "user_photos" cascade;');
  }
}
