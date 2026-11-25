import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_services_ordering_extras_icon" AS ENUM('cms', 'portal', 'chatbot', 'payment', 'seo', 'language', 'design', 'analytics', 'automation', 'generic');
  CREATE TYPE "public"."enum_services_ordering_mode" AS ENUM('off', 'order', 'quote');
  CREATE TYPE "public"."enum__services_v_version_ordering_extras_icon" AS ENUM('cms', 'portal', 'chatbot', 'payment', 'seo', 'language', 'design', 'analytics', 'automation', 'generic');
  CREATE TYPE "public"."enum__services_v_version_ordering_mode" AS ENUM('off', 'order', 'quote');
  CREATE TYPE "public"."enum_shop_settings_vat_rate" AS ENUM('0', '19');
  CREATE TABLE "services_ordering_base_includes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "services_ordering_extras_includes" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "services_ordering_extras" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"price" numeric,
  	"days" numeric DEFAULT 0,
  	"active" boolean DEFAULT true,
  	"image_id" integer,
  	"icon" "enum_services_ordering_extras_icon" DEFAULT 'generic'
  );
  
  CREATE TABLE "services_ordering_extras_locales" (
  	"title" varchar,
  	"summary" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_services_v_version_ordering_base_includes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_version_ordering_extras_includes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_version_ordering_extras" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"price" numeric,
  	"days" numeric DEFAULT 0,
  	"active" boolean DEFAULT true,
  	"image_id" integer,
  	"icon" "enum__services_v_version_ordering_extras_icon" DEFAULT 'generic',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_version_ordering_extras_locales" (
  	"title" varchar,
  	"summary" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "shop_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"ordering_enabled" boolean DEFAULT false,
  	"vat_rate" "enum_shop_settings_vat_rate" DEFAULT '0' NOT NULL,
  	"order_notification_email" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "shop_settings_locales" (
  	"price_note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "services" ADD COLUMN "ordering_mode" "enum_services_ordering_mode" DEFAULT 'off';
  ALTER TABLE "services" ADD COLUMN "ordering_base_price" numeric;
  ALTER TABLE "services" ADD COLUMN "ordering_base_days" numeric;
  ALTER TABLE "services" ADD COLUMN "ordering_deposit_percent" numeric;
  ALTER TABLE "services_locales" ADD COLUMN "ordering_base_name" varchar;
  ALTER TABLE "services_locales" ADD COLUMN "ordering_base_description" varchar;
  ALTER TABLE "_services_v" ADD COLUMN "version_ordering_mode" "enum__services_v_version_ordering_mode" DEFAULT 'off';
  ALTER TABLE "_services_v" ADD COLUMN "version_ordering_base_price" numeric;
  ALTER TABLE "_services_v" ADD COLUMN "version_ordering_base_days" numeric;
  ALTER TABLE "_services_v" ADD COLUMN "version_ordering_deposit_percent" numeric;
  ALTER TABLE "_services_v_locales" ADD COLUMN "version_ordering_base_name" varchar;
  ALTER TABLE "_services_v_locales" ADD COLUMN "version_ordering_base_description" varchar;
  ALTER TABLE "services_ordering_base_includes" ADD CONSTRAINT "services_ordering_base_includes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_ordering_extras_includes" ADD CONSTRAINT "services_ordering_extras_includes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_ordering_extras"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_ordering_extras" ADD CONSTRAINT "services_ordering_extras_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_ordering_extras" ADD CONSTRAINT "services_ordering_extras_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_ordering_extras_locales" ADD CONSTRAINT "services_ordering_extras_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_ordering_extras"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_ordering_base_includes" ADD CONSTRAINT "_services_v_version_ordering_base_includes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_ordering_extras_includes" ADD CONSTRAINT "_services_v_version_ordering_extras_includes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_version_ordering_extras"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_ordering_extras" ADD CONSTRAINT "_services_v_version_ordering_extras_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_version_ordering_extras" ADD CONSTRAINT "_services_v_version_ordering_extras_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_ordering_extras_locales" ADD CONSTRAINT "_services_v_version_ordering_extras_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_version_ordering_extras"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "shop_settings_locales" ADD CONSTRAINT "shop_settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."shop_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "services_ordering_base_includes_order_idx" ON "services_ordering_base_includes" USING btree ("_order");
  CREATE INDEX "services_ordering_base_includes_parent_id_idx" ON "services_ordering_base_includes" USING btree ("_parent_id");
  CREATE INDEX "services_ordering_base_includes_locale_idx" ON "services_ordering_base_includes" USING btree ("_locale");
  CREATE INDEX "services_ordering_extras_includes_order_idx" ON "services_ordering_extras_includes" USING btree ("_order");
  CREATE INDEX "services_ordering_extras_includes_parent_id_idx" ON "services_ordering_extras_includes" USING btree ("_parent_id");
  CREATE INDEX "services_ordering_extras_includes_locale_idx" ON "services_ordering_extras_includes" USING btree ("_locale");
  CREATE INDEX "services_ordering_extras_order_idx" ON "services_ordering_extras" USING btree ("_order");
  CREATE INDEX "services_ordering_extras_parent_id_idx" ON "services_ordering_extras" USING btree ("_parent_id");
  CREATE INDEX "services_ordering_extras_image_idx" ON "services_ordering_extras" USING btree ("image_id");
  CREATE UNIQUE INDEX "services_ordering_extras_locales_locale_parent_id_unique" ON "services_ordering_extras_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "services_ordering_extras_locales_parent_id_idx" ON "services_ordering_extras_locales" USING btree ("_parent_id");
  CREATE INDEX "_services_v_version_ordering_base_includes_order_idx" ON "_services_v_version_ordering_base_includes" USING btree ("_order");
  CREATE INDEX "_services_v_version_ordering_base_includes_parent_id_idx" ON "_services_v_version_ordering_base_includes" USING btree ("_parent_id");
  CREATE INDEX "_services_v_version_ordering_base_includes_locale_idx" ON "_services_v_version_ordering_base_includes" USING btree ("_locale");
  CREATE INDEX "_services_v_version_ordering_extras_includes_order_idx" ON "_services_v_version_ordering_extras_includes" USING btree ("_order");
  CREATE INDEX "_services_v_version_ordering_extras_includes_parent_id_idx" ON "_services_v_version_ordering_extras_includes" USING btree ("_parent_id");
  CREATE INDEX "_services_v_version_ordering_extras_includes_locale_idx" ON "_services_v_version_ordering_extras_includes" USING btree ("_locale");
  CREATE INDEX "_services_v_version_ordering_extras_order_idx" ON "_services_v_version_ordering_extras" USING btree ("_order");
  CREATE INDEX "_services_v_version_ordering_extras_parent_id_idx" ON "_services_v_version_ordering_extras" USING btree ("_parent_id");
  CREATE INDEX "_services_v_version_ordering_extras_image_idx" ON "_services_v_version_ordering_extras" USING btree ("image_id");
  CREATE UNIQUE INDEX "_services_v_version_ordering_extras_locales_locale_parent_id" ON "_services_v_version_ordering_extras_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_services_v_version_ordering_extras_locales_parent_id_idx" ON "_services_v_version_ordering_extras_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "shop_settings_locales_locale_parent_id_unique" ON "shop_settings_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "shop_settings_locales_parent_id_idx" ON "shop_settings_locales" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "services_ordering_base_includes" CASCADE;
  DROP TABLE "services_ordering_extras_includes" CASCADE;
  DROP TABLE "services_ordering_extras" CASCADE;
  DROP TABLE "services_ordering_extras_locales" CASCADE;
  DROP TABLE "_services_v_version_ordering_base_includes" CASCADE;
  DROP TABLE "_services_v_version_ordering_extras_includes" CASCADE;
  DROP TABLE "_services_v_version_ordering_extras" CASCADE;
  DROP TABLE "_services_v_version_ordering_extras_locales" CASCADE;
  DROP TABLE "shop_settings" CASCADE;
  DROP TABLE "shop_settings_locales" CASCADE;
  ALTER TABLE "services" DROP COLUMN "ordering_mode";
  ALTER TABLE "services" DROP COLUMN "ordering_base_price";
  ALTER TABLE "services" DROP COLUMN "ordering_base_days";
  ALTER TABLE "services" DROP COLUMN "ordering_deposit_percent";
  ALTER TABLE "services_locales" DROP COLUMN "ordering_base_name";
  ALTER TABLE "services_locales" DROP COLUMN "ordering_base_description";
  ALTER TABLE "_services_v" DROP COLUMN "version_ordering_mode";
  ALTER TABLE "_services_v" DROP COLUMN "version_ordering_base_price";
  ALTER TABLE "_services_v" DROP COLUMN "version_ordering_base_days";
  ALTER TABLE "_services_v" DROP COLUMN "version_ordering_deposit_percent";
  ALTER TABLE "_services_v_locales" DROP COLUMN "version_ordering_base_name";
  ALTER TABLE "_services_v_locales" DROP COLUMN "version_ordering_base_description";
  DROP TYPE "public"."enum_services_ordering_extras_icon";
  DROP TYPE "public"."enum_services_ordering_mode";
  DROP TYPE "public"."enum__services_v_version_ordering_extras_icon";
  DROP TYPE "public"."enum__services_v_version_ordering_mode";
  DROP TYPE "public"."enum_shop_settings_vat_rate";`)
}
