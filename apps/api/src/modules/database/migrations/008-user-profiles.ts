import { Migration } from '@mikro-orm/migrations';

export class UserProfiles extends Migration {
  async up(): Promise<void> {
    // Create enum types
    this.addSql(
      `create type "gender_enum" as enum ('male', 'female', 'non-binary');`
    );
    this.addSql(
      `create type "seeking_enum" as enum ('male', 'female', 'everyone');`
    );
    this.addSql(
      `create type "relationship_type_enum" as enum ('casual', 'serious', 'friendship', 'unsure');`
    );
    this.addSql(
      `create type "location_type_enum" as enum ('automatic', 'manual');`
    );

    // Create user_profiles table
    this.addSql(
      `create table "user_profiles" (
        "user_id" uuid not null,
        "first_name" varchar(50) null,
        "date_of_birth" date null,
        "gender" gender_enum null,
        "seeking" seeking_enum null,
        "relationship_type" relationship_type_enum null,
        "age_range_min" int not null default 18,
        "age_range_max" int not null default 45,
        "location_type" location_type_enum null,
        "location_city" varchar(100) null,
        "location_region" varchar(100) null,
        "location_country" varchar(100) null,
        "location_iso_country_code" varchar(10) null,
        "location_zip_code" varchar(20) null,
        "location_lat" double precision null,
        "location_lng" double precision null,
        "created_at" timestamptz(0) not null,
        "updated_at" timestamptz(0) not null,
        constraint "user_profiles_pkey" primary key ("user_id"),
        constraint "user_profiles_age_range_check" check ("age_range_min" >= 18 and "age_range_max" >= "age_range_min" and "age_range_max" <= 99)
      );`
    );

    this.addSql(
      `comment on table "user_profiles" is 'User profile information collected during onboarding.';`
    );
    this.addSql(
      `comment on column "user_profiles"."first_name" is 'User''s first name for display.';`
    );
    this.addSql(
      `comment on column "user_profiles"."date_of_birth" is 'User''s date of birth.';`
    );
    this.addSql(
      `comment on column "user_profiles"."gender" is 'User''s gender identity.';`
    );
    this.addSql(
      `comment on column "user_profiles"."seeking" is 'Gender(s) the user is seeking.';`
    );
    this.addSql(
      `comment on column "user_profiles"."relationship_type" is 'Type of relationship the user is looking for.';`
    );
    this.addSql(
      `comment on column "user_profiles"."age_range_min" is 'Minimum age preference for matches.';`
    );
    this.addSql(
      `comment on column "user_profiles"."age_range_max" is 'Maximum age preference for matches.';`
    );
    this.addSql(
      `comment on column "user_profiles"."location_type" is 'How location was determined.';`
    );
    this.addSql(
      `comment on column "user_profiles"."location_city" is 'City name.';`
    );
    this.addSql(
      `comment on column "user_profiles"."location_region" is 'State/Province/Region name.';`
    );
    this.addSql(
      `comment on column "user_profiles"."location_country" is 'Country name or code.';`
    );
    this.addSql(
      `comment on column "user_profiles"."location_iso_country_code" is 'ISO country code (e.g., US, UK).';`
    );
    this.addSql(
      `comment on column "user_profiles"."location_zip_code" is 'Postal/ZIP code.';`
    );
    this.addSql(
      `comment on column "user_profiles"."location_lat" is 'Latitude coordinate.';`
    );
    this.addSql(
      `comment on column "user_profiles"."location_lng" is 'Longitude coordinate.';`
    );

    // Add foreign key constraint
    this.addSql(
      `alter table "user_profiles" add constraint "user_profiles_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade on delete cascade;`
    );
  }

  async down(): Promise<void> {
    this.addSql(
      'alter table "user_profiles" drop constraint "user_profiles_user_id_foreign";'
    );
    this.addSql('drop table if exists "user_profiles" cascade;');
    this.addSql('drop type if exists "gender_enum";');
    this.addSql('drop type if exists "seeking_enum";');
    this.addSql('drop type if exists "relationship_type_enum";');
    this.addSql('drop type if exists "location_type_enum";');
  }
}
