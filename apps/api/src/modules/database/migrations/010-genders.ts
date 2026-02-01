import { Migration } from "@mikro-orm/migrations";

export class Genders extends Migration {
  async up(): Promise<void> {
    // Create genders table
    this.addSql(`
      create table "genders" (
        "id" uuid primary key default gen_random_uuid(),
        "name" varchar(100) not null,
        "description" text null,
        "display_order" int not null default 0,
        "is_primary" boolean not null default false,
        "is_active" boolean not null default true,
        "created_at" timestamptz(0) not null default now(),
        "updated_at" timestamptz(0) not null default now()
      );
    `);

    this.addSql(
      `comment on column "genders"."name" is 'Display name for the gender.';`,
    );
    this.addSql(
      `comment on column "genders"."description" is 'Description explaining this gender identity.';`,
    );
    this.addSql(
      `comment on column "genders"."display_order" is 'Order in which to display this gender in lists.';`,
    );
    this.addSql(
      `comment on column "genders"."is_primary" is 'Whether this is a primary gender shown by default (e.g., Man, Woman).';`,
    );
    this.addSql(
      `comment on column "genders"."is_active" is 'Whether this gender is active and selectable.';`,
    );

    // Seed genders data
    this.addSql(`
      insert into "genders" ("name", "description", "display_order", "is_primary") values
        ('Man', null, 1, true),
        ('Woman', null, 2, true),
        ('Agender', 'Individuals with no gender identity or a neutral gender identity', 3, false),
        ('Androgynous', 'Individuals with both male & female presentation or nature', 4, false),
        ('Bigender', 'Individuals who identify as multiple genders', 5, false),
        ('Cis Man', 'Individuals whose gender identity matches the male sex assigned at birth', 6, false),
        ('Cis Woman', 'Individuals whose gender identity matches the female sex assigned at birth', 7, false),
        ('Genderfluid', 'Individuals who don''t have a fixed gender identity', 8, false),
        ('Genderqueer', 'Individuals who don''t identify with binary gender identity norms', 9, false),
        ('Gender Nonconforming', 'Individuals whose gender expressions don''t match masculine & feminine norms', 10, false),
        ('Hijra', 'A third gender identity, largely used in the Indian subcontinent', 11, false),
        ('Intersex', 'Individuals born with reproductive anatomy that doesn''t fit typical definitions', 12, false),
        ('Non-binary', 'A term covering any gender identity outside the gender binary', 13, false),
        ('Other', 'Individuals who identify with any other gender expressions', 14, false),
        ('Pangender', 'Individuals who identify with a wide multiplicity of gender identities', 15, false),
        ('Transfeminine', 'Transgender individuals with more feminine presenting expression', 16, false),
        ('Transgender', 'Individuals whose gender identity differs from sex assigned at birth', 17, false),
        ('Trans Man', 'Individuals assigned female at birth but have a male gender identity', 18, false),
        ('Transmasculine', 'Transgender individuals with more masculine presenting expression', 19, false),
        ('Transsexual', 'Trans individuals who wish to align gender identity & sex through medical intervention', 20, false),
        ('Trans Woman', 'Individuals assigned male at birth but have a female gender identity', 21, false),
        ('Two Spirit', 'Term used in Indigenous cultures for individuals with multiple gender identities', 22, false);
    `);

    // Create user_profile_seeking join table for many-to-many relationship
    this.addSql(`
      create table "user_profile_seeking" (
        "user_profile_user_id" uuid not null,
        "gender_id" uuid not null,
        constraint "user_profile_seeking_pkey" primary key ("user_profile_user_id", "gender_id")
      );
    `);

    this.addSql(
      `comment on table "user_profile_seeking" is 'Join table for user profiles and genders they are seeking.';`,
    );

    // Add foreign keys for join table
    this.addSql(`
      alter table "user_profile_seeking"
        add constraint "user_profile_seeking_user_profile_user_id_foreign"
          foreign key ("user_profile_user_id") references "user_profiles" ("user_id")
          on update cascade on delete cascade;
    `);

    this.addSql(`
      alter table "user_profile_seeking"
        add constraint "user_profile_seeking_gender_id_foreign"
          foreign key ("gender_id") references "genders" ("id")
          on update cascade on delete cascade;
    `);

    // Create user_profile_genders join table for many-to-many relationship (user's own genders)
    this.addSql(`
      create table "user_profile_genders" (
        "user_profile_user_id" uuid not null,
        "gender_id" uuid not null,
        constraint "user_profile_genders_pkey" primary key ("user_profile_user_id", "gender_id")
      );
    `);

    this.addSql(
      `comment on table "user_profile_genders" is 'Join table for user profiles and their gender identities (up to 5).';`,
    );

    // Add foreign keys for user_profile_genders join table
    this.addSql(`
      alter table "user_profile_genders"
        add constraint "user_profile_genders_user_profile_user_id_foreign"
          foreign key ("user_profile_user_id") references "user_profiles" ("user_id")
          on update cascade on delete cascade;
    `);

    this.addSql(`
      alter table "user_profile_genders"
        add constraint "user_profile_genders_gender_id_foreign"
          foreign key ("gender_id") references "genders" ("id")
          on update cascade on delete cascade;
    `);

    // Migrate existing gender enum data to new join table
    this.addSql(`
      insert into "user_profile_genders" ("user_profile_user_id", "gender_id")
      select up."user_id", g."id"
      from "user_profiles" up
      cross join "genders" g
      where up."gender" = 'male' and g."name" = 'Man';
    `);

    this.addSql(`
      insert into "user_profile_genders" ("user_profile_user_id", "gender_id")
      select up."user_id", g."id"
      from "user_profiles" up
      cross join "genders" g
      where up."gender" = 'female' and g."name" = 'Woman';
    `);

    this.addSql(`
      insert into "user_profile_genders" ("user_profile_user_id", "gender_id")
      select up."user_id", g."id"
      from "user_profiles" up
      cross join "genders" g
      where up."gender" = 'non-binary' and g."name" = 'Non-binary';
    `);

    // Migrate existing seeking enum data to join table
    this.addSql(`
      insert into "user_profile_seeking" ("user_profile_user_id", "gender_id")
      select up."user_id", g."id"
      from "user_profiles" up
      cross join "genders" g
      where up."seeking" = 'male' and g."name" = 'Man';
    `);

    this.addSql(`
      insert into "user_profile_seeking" ("user_profile_user_id", "gender_id")
      select up."user_id", g."id"
      from "user_profiles" up
      cross join "genders" g
      where up."seeking" = 'female' and g."name" = 'Woman';
    `);

    this.addSql(`
      insert into "user_profile_seeking" ("user_profile_user_id", "gender_id")
      select up."user_id", g."id"
      from "user_profiles" up
      cross join "genders" g
      where up."seeking" = 'everyone' and g."name" in ('Man', 'Woman');
    `);

    // Drop old enum columns
    this.addSql(`alter table "user_profiles" drop column "gender";`);
    this.addSql(`alter table "user_profiles" drop column "seeking";`);

    // Drop old enum types
    this.addSql(`drop type if exists "gender_enum";`);
    this.addSql(`drop type if exists "seeking_enum";`);
  }

  async down(): Promise<void> {
    // Recreate enum types
    this.addSql(
      `create type "gender_enum" as enum ('male', 'female', 'non-binary');`,
    );
    this.addSql(
      `create type "seeking_enum" as enum ('male', 'female', 'everyone');`,
    );

    // Add back old enum columns
    this.addSql(
      `alter table "user_profiles" add column "gender" gender_enum null;`,
    );
    this.addSql(
      `alter table "user_profiles" add column "seeking" seeking_enum null;`,
    );

    // Migrate data back from new structure to old enums (take first gender from join table)
    this.addSql(`
      update "user_profiles" up
      set "gender" = (
        case
          when exists (
            select 1 from "user_profile_genders" upg
            join "genders" g on g."id" = upg."gender_id"
            where upg."user_profile_user_id" = up."user_id" and g."name" = 'Man'
          ) then 'male'::gender_enum
          when exists (
            select 1 from "user_profile_genders" upg
            join "genders" g on g."id" = upg."gender_id"
            where upg."user_profile_user_id" = up."user_id" and g."name" = 'Woman'
          ) then 'female'::gender_enum
          when exists (
            select 1 from "user_profile_genders" upg
            join "genders" g on g."id" = upg."gender_id"
            where upg."user_profile_user_id" = up."user_id" and g."name" = 'Non-binary'
          ) then 'non-binary'::gender_enum
          else null
        end
      );
    `);

    // Migrate seeking data back - simplified: if seeking both man and woman, set to 'everyone'
    this.addSql(`
      update "user_profiles" up
      set "seeking" = (
        case
          when (
            select count(*) from "user_profile_seeking" ups
            join "genders" g on g."id" = ups."gender_id"
            where ups."user_profile_user_id" = up."user_id" and g."name" in ('Man', 'Woman')
          ) = 2 then 'everyone'::seeking_enum
          when exists (
            select 1 from "user_profile_seeking" ups
            join "genders" g on g."id" = ups."gender_id"
            where ups."user_profile_user_id" = up."user_id" and g."name" = 'Man'
          ) then 'male'::seeking_enum
          when exists (
            select 1 from "user_profile_seeking" ups
            join "genders" g on g."id" = ups."gender_id"
            where ups."user_profile_user_id" = up."user_id" and g."name" = 'Woman'
          ) then 'female'::seeking_enum
          else null
        end
      );
    `);

    // Drop join tables
    this.addSql(`drop table if exists "user_profile_genders" cascade;`);
    this.addSql(`drop table if exists "user_profile_seeking" cascade;`);

    // Drop genders table
    this.addSql(`drop table if exists "genders" cascade;`);
  }
}
