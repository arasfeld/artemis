import { Migration } from '@mikro-orm/migrations';

export class Pets extends Migration {
  async up(): Promise<void> {
    // Create pet_types table
    this.addSql(`
      create table "pet_types" (
        "id" uuid primary key default gen_random_uuid(),
        "name" varchar(50) not null,
        "display_order" int not null default 0,
        "is_active" boolean not null default true,
        "created_at" timestamptz(0) not null default now(),
        "updated_at" timestamptz(0) not null default now()
      );
    `);

    this.addSql(
      `comment on table "pet_types" is 'Types of pets that users can add to their profile.';`
    );

    // Seed pet types
    this.addSql(`
      insert into "pet_types" ("name", "display_order") values
        ('Dog', 1),
        ('Cat', 2),
        ('Bird', 3),
        ('Fish', 4),
        ('Rabbit', 5),
        ('Hamster', 6),
        ('Guinea Pig', 7),
        ('Reptile', 8),
        ('Horse', 9),
        ('Other', 10);
    `);

    // Create pets table
    this.addSql(`
      create table "pets" (
        "id" uuid primary key default gen_random_uuid(),
        "owner_id" uuid not null,
        "pet_type_id" uuid not null,
        "name" varchar(100) not null,
        "breed" varchar(100) null,
        "birthday" date null,
        "display_order" int not null default 0,
        "created_at" timestamptz(0) not null default now(),
        "updated_at" timestamptz(0) not null default now(),
        constraint "pets_owner_id_foreign"
          foreign key ("owner_id") references "users" ("id")
          on update cascade on delete cascade,
        constraint "pets_pet_type_id_foreign"
          foreign key ("pet_type_id") references "pet_types" ("id")
          on update cascade on delete cascade
      );
    `);

    this.addSql(`comment on table "pets" is 'Pets belonging to users.';`);

    this.addSql(`create index "pets_owner_id_index" on "pets" ("owner_id");`);
    this.addSql(
      `create index "pets_pet_type_id_index" on "pets" ("pet_type_id");`
    );

    // Create pet_photos table
    this.addSql(`
      create table "pet_photos" (
        "id" uuid primary key default gen_random_uuid(),
        "pet_id" uuid not null,
        "url" varchar(500) not null,
        "display_order" int not null default 0,
        "created_at" timestamptz(0) not null default now(),
        constraint "pet_photos_pet_id_foreign"
          foreign key ("pet_id") references "pets" ("id")
          on update cascade on delete cascade
      );
    `);

    this.addSql(`comment on table "pet_photos" is 'Photos of pets.';`);

    this.addSql(
      `create index "pet_photos_pet_id_index" on "pet_photos" ("pet_id");`
    );
  }

  async down(): Promise<void> {
    this.addSql(`drop table if exists "pet_photos" cascade;`);
    this.addSql(`drop table if exists "pets" cascade;`);
    this.addSql(`drop table if exists "pet_types" cascade;`);
  }
}
