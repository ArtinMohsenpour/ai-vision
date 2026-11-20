import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "home_locales" ADD COLUMN "hero_artwork_id" integer;
  ALTER TABLE "_home_v_locales" ADD COLUMN "version_hero_artwork_id" integer;
  ALTER TABLE "home_locales" ADD CONSTRAINT "home_locales_hero_artwork_id_media_id_fk" FOREIGN KEY ("hero_artwork_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v_locales" ADD CONSTRAINT "_home_v_locales_version_hero_artwork_id_media_id_fk" FOREIGN KEY ("version_hero_artwork_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "home_hero_artwork_idx" ON "home_locales" USING btree ("hero_artwork_id","_locale");
  CREATE INDEX "_home_v_version_version_hero_artwork_idx" ON "_home_v_locales" USING btree ("version_hero_artwork_id","_locale");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "home_locales" DROP CONSTRAINT "home_locales_hero_artwork_id_media_id_fk";
  
  ALTER TABLE "_home_v_locales" DROP CONSTRAINT "_home_v_locales_version_hero_artwork_id_media_id_fk";
  
  DROP INDEX "home_hero_artwork_idx";
  DROP INDEX "_home_v_version_version_hero_artwork_idx";
  ALTER TABLE "home_locales" DROP COLUMN "hero_artwork_id";
  ALTER TABLE "_home_v_locales" DROP COLUMN "version_hero_artwork_id";`)
}
