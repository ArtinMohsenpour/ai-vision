import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media" ADD COLUMN "sizes_thumbnail_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_thumbnail_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_thumbnail_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_thumbnail_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_thumbnail_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_thumbnail_filename" varchar;
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  ALTER TABLE "users" ADD COLUMN "first_name" varchar;
  ALTER TABLE "users" ADD COLUMN "last_name" varchar;
  -- Hand-edited: existing admins keep their name, split at the first space.
  UPDATE "users" SET
    "first_name" = COALESCE(NULLIF(split_part(btrim("name"), ' ', 1), ''), ''),
    "last_name" = COALESCE(NULLIF(btrim(substr(btrim("name"), length(split_part(btrim("name"), ' ', 1)) + 1)), ''), '');
  ALTER TABLE "users" ALTER COLUMN "first_name" SET NOT NULL;
  ALTER TABLE "users" ALTER COLUMN "last_name" SET NOT NULL;
  ALTER TABLE "users" DROP COLUMN "name";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx";
  ALTER TABLE "users" ADD COLUMN "name" varchar;
  UPDATE "users" SET "name" = NULLIF(btrim(concat_ws(' ', "first_name", "last_name")), '');
  ALTER TABLE "media" DROP COLUMN "sizes_thumbnail_url";
  ALTER TABLE "media" DROP COLUMN "sizes_thumbnail_width";
  ALTER TABLE "media" DROP COLUMN "sizes_thumbnail_height";
  ALTER TABLE "media" DROP COLUMN "sizes_thumbnail_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_thumbnail_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_thumbnail_filename";
  ALTER TABLE "users" DROP COLUMN "first_name";
  ALTER TABLE "users" DROP COLUMN "last_name";`)
}
