import { sql, type MigrateDownArgs, type MigrateUpArgs } from '@payloadcms/db-postgres'

import { initialServiceHeroFeatures } from './data/service-hero-features'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "services_hero_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "services_hero_features_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_services_v_version_hero_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_version_hero_features_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "services_hero_features" ADD CONSTRAINT "services_hero_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_hero_features_locales" ADD CONSTRAINT "services_hero_features_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_hero_features"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_hero_features" ADD CONSTRAINT "_services_v_version_hero_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_hero_features_locales" ADD CONSTRAINT "_services_v_version_hero_features_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_version_hero_features"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "services_hero_features_order_idx" ON "services_hero_features" USING btree ("_order");
  CREATE INDEX "services_hero_features_parent_id_idx" ON "services_hero_features" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "services_hero_features_locales_locale_parent_id_unique" ON "services_hero_features_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "services_hero_features_locales_parent_id_idx" ON "services_hero_features_locales" USING btree ("_parent_id");
  CREATE INDEX "_services_v_version_hero_features_order_idx" ON "_services_v_version_hero_features" USING btree ("_order");
  CREATE INDEX "_services_v_version_hero_features_parent_id_idx" ON "_services_v_version_hero_features" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_services_v_version_hero_features_locales_locale_parent_id_u" ON "_services_v_version_hero_features_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_services_v_version_hero_features_locales_parent_id_idx" ON "_services_v_version_hero_features_locales" USING btree ("_parent_id");`)

  const labels = Object.entries(initialServiceHeroFeatures).flatMap(([slug, features]) =>
    features.map(([de, en], index) => ({ slug, position: index + 1, de, en })),
  )

  // Backfill the new field without publishing drafts or changing other service fields.
  await db.execute(sql`
    WITH labels AS (
      SELECT * FROM jsonb_to_recordset(${JSON.stringify(labels)}::jsonb)
        AS copy(slug text, position integer, de text, en text)
    ), pages AS (
      INSERT INTO services_hero_features ("_order", "_parent_id", id)
      SELECT labels.position, services.id,
        left(md5('service-hero-' || services.id || '-' || labels.position), 24)
      FROM services JOIN labels USING (slug)
      RETURNING id, "_parent_id", "_order"
    ), page_translations AS (
      INSERT INTO services_hero_features_locales (label, "_locale", "_parent_id")
      SELECT translation.label, translation.locale::"_locales", pages.id
      FROM pages
      JOIN services ON services.id = pages."_parent_id"
      JOIN labels ON labels.slug = services.slug AND labels.position = pages."_order"
      CROSS JOIN LATERAL (VALUES ('de', labels.de), ('en', labels.en)) AS translation(locale, label)
    ), versions AS (
      INSERT INTO _services_v_version_hero_features ("_order", "_parent_id", "_uuid")
      SELECT labels.position, v.id,
        left(md5('service-hero-' || v.parent_id || '-' || labels.position), 24)
      FROM _services_v AS v JOIN labels ON labels.slug = v.version_slug
      RETURNING id, "_parent_id", "_order"
    )
    INSERT INTO _services_v_version_hero_features_locales (label, "_locale", "_parent_id")
    SELECT translation.label, translation.locale::"_locales", versions.id
    FROM versions
    JOIN _services_v AS v ON v.id = versions."_parent_id"
    JOIN labels ON labels.slug = v.version_slug AND labels.position = versions."_order"
    CROSS JOIN LATERAL (VALUES ('de', labels.de), ('en', labels.en)) AS translation(locale, label);
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "services_hero_features" CASCADE;
  DROP TABLE "services_hero_features_locales" CASCADE;
  DROP TABLE "_services_v_version_hero_features" CASCADE;
  DROP TABLE "_services_v_version_hero_features_locales" CASCADE;`)
}
