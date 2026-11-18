import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_services_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__services_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__services_v_published_locale" AS ENUM('de', 'en');
  CREATE TYPE "public"."enum_home_actions_appearance" AS ENUM('primary', 'secondary');
  CREATE TYPE "public"."enum_home_actions_link_type" AS ENUM('page', 'service', 'path', 'external');
  CREATE TYPE "public"."enum_home_actions_link_page" AS ENUM('home', 'services-overview', 'pricing', 'about', 'how-it-works', 'faq', 'contact', 'impressum', 'privacy', 'terms');
  CREATE TYPE "public"."enum_home_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__home_v_version_actions_appearance" AS ENUM('primary', 'secondary');
  CREATE TYPE "public"."enum__home_v_version_actions_link_type" AS ENUM('page', 'service', 'path', 'external');
  CREATE TYPE "public"."enum__home_v_version_actions_link_page" AS ENUM('home', 'services-overview', 'pricing', 'about', 'how-it-works', 'faq', 'contact', 'impressum', 'privacy', 'terms');
  CREATE TYPE "public"."enum__home_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__home_v_published_locale" AS ENUM('de', 'en');
  CREATE TYPE "public"."enum_services_overview_actions_appearance" AS ENUM('primary', 'secondary');
  CREATE TYPE "public"."enum_services_overview_actions_link_type" AS ENUM('page', 'service', 'path', 'external');
  CREATE TYPE "public"."enum_services_overview_actions_link_page" AS ENUM('home', 'services-overview', 'pricing', 'about', 'how-it-works', 'faq', 'contact', 'impressum', 'privacy', 'terms');
  CREATE TYPE "public"."enum_services_overview_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__services_overview_v_version_actions_appearance" AS ENUM('primary', 'secondary');
  CREATE TYPE "public"."enum__services_overview_v_version_actions_link_type" AS ENUM('page', 'service', 'path', 'external');
  CREATE TYPE "public"."enum__services_overview_v_version_actions_link_page" AS ENUM('home', 'services-overview', 'pricing', 'about', 'how-it-works', 'faq', 'contact', 'impressum', 'privacy', 'terms');
  CREATE TYPE "public"."enum__services_overview_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__services_overview_v_published_locale" AS ENUM('de', 'en');
  CREATE TYPE "public"."enum_pricing_actions_appearance" AS ENUM('primary', 'secondary');
  CREATE TYPE "public"."enum_pricing_actions_link_type" AS ENUM('page', 'service', 'path', 'external');
  CREATE TYPE "public"."enum_pricing_actions_link_page" AS ENUM('home', 'services-overview', 'pricing', 'about', 'how-it-works', 'faq', 'contact', 'impressum', 'privacy', 'terms');
  CREATE TYPE "public"."enum_pricing_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pricing_v_version_actions_appearance" AS ENUM('primary', 'secondary');
  CREATE TYPE "public"."enum__pricing_v_version_actions_link_type" AS ENUM('page', 'service', 'path', 'external');
  CREATE TYPE "public"."enum__pricing_v_version_actions_link_page" AS ENUM('home', 'services-overview', 'pricing', 'about', 'how-it-works', 'faq', 'contact', 'impressum', 'privacy', 'terms');
  CREATE TYPE "public"."enum__pricing_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pricing_v_published_locale" AS ENUM('de', 'en');
  CREATE TYPE "public"."enum_about_actions_appearance" AS ENUM('primary', 'secondary');
  CREATE TYPE "public"."enum_about_actions_link_type" AS ENUM('page', 'service', 'path', 'external');
  CREATE TYPE "public"."enum_about_actions_link_page" AS ENUM('home', 'services-overview', 'pricing', 'about', 'how-it-works', 'faq', 'contact', 'impressum', 'privacy', 'terms');
  CREATE TYPE "public"."enum_about_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__about_v_version_actions_appearance" AS ENUM('primary', 'secondary');
  CREATE TYPE "public"."enum__about_v_version_actions_link_type" AS ENUM('page', 'service', 'path', 'external');
  CREATE TYPE "public"."enum__about_v_version_actions_link_page" AS ENUM('home', 'services-overview', 'pricing', 'about', 'how-it-works', 'faq', 'contact', 'impressum', 'privacy', 'terms');
  CREATE TYPE "public"."enum__about_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__about_v_published_locale" AS ENUM('de', 'en');
  CREATE TYPE "public"."enum_how_it_works_actions_appearance" AS ENUM('primary', 'secondary');
  CREATE TYPE "public"."enum_how_it_works_actions_link_type" AS ENUM('page', 'service', 'path', 'external');
  CREATE TYPE "public"."enum_how_it_works_actions_link_page" AS ENUM('home', 'services-overview', 'pricing', 'about', 'how-it-works', 'faq', 'contact', 'impressum', 'privacy', 'terms');
  CREATE TYPE "public"."enum_how_it_works_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__how_it_works_v_version_actions_appearance" AS ENUM('primary', 'secondary');
  CREATE TYPE "public"."enum__how_it_works_v_version_actions_link_type" AS ENUM('page', 'service', 'path', 'external');
  CREATE TYPE "public"."enum__how_it_works_v_version_actions_link_page" AS ENUM('home', 'services-overview', 'pricing', 'about', 'how-it-works', 'faq', 'contact', 'impressum', 'privacy', 'terms');
  CREATE TYPE "public"."enum__how_it_works_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__how_it_works_v_published_locale" AS ENUM('de', 'en');
  CREATE TYPE "public"."enum_faq_actions_appearance" AS ENUM('primary', 'secondary');
  CREATE TYPE "public"."enum_faq_actions_link_type" AS ENUM('page', 'service', 'path', 'external');
  CREATE TYPE "public"."enum_faq_actions_link_page" AS ENUM('home', 'services-overview', 'pricing', 'about', 'how-it-works', 'faq', 'contact', 'impressum', 'privacy', 'terms');
  CREATE TYPE "public"."enum_faq_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__faq_v_version_actions_appearance" AS ENUM('primary', 'secondary');
  CREATE TYPE "public"."enum__faq_v_version_actions_link_type" AS ENUM('page', 'service', 'path', 'external');
  CREATE TYPE "public"."enum__faq_v_version_actions_link_page" AS ENUM('home', 'services-overview', 'pricing', 'about', 'how-it-works', 'faq', 'contact', 'impressum', 'privacy', 'terms');
  CREATE TYPE "public"."enum__faq_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__faq_v_published_locale" AS ENUM('de', 'en');
  CREATE TYPE "public"."enum_contact_actions_appearance" AS ENUM('primary', 'secondary');
  CREATE TYPE "public"."enum_contact_actions_link_type" AS ENUM('page', 'service', 'path', 'external');
  CREATE TYPE "public"."enum_contact_actions_link_page" AS ENUM('home', 'services-overview', 'pricing', 'about', 'how-it-works', 'faq', 'contact', 'impressum', 'privacy', 'terms');
  CREATE TYPE "public"."enum_contact_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__contact_v_version_actions_appearance" AS ENUM('primary', 'secondary');
  CREATE TYPE "public"."enum__contact_v_version_actions_link_type" AS ENUM('page', 'service', 'path', 'external');
  CREATE TYPE "public"."enum__contact_v_version_actions_link_page" AS ENUM('home', 'services-overview', 'pricing', 'about', 'how-it-works', 'faq', 'contact', 'impressum', 'privacy', 'terms');
  CREATE TYPE "public"."enum__contact_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__contact_v_published_locale" AS ENUM('de', 'en');
  CREATE TYPE "public"."enum_impressum_actions_appearance" AS ENUM('primary', 'secondary');
  CREATE TYPE "public"."enum_impressum_actions_link_type" AS ENUM('page', 'service', 'path', 'external');
  CREATE TYPE "public"."enum_impressum_actions_link_page" AS ENUM('home', 'services-overview', 'pricing', 'about', 'how-it-works', 'faq', 'contact', 'impressum', 'privacy', 'terms');
  CREATE TYPE "public"."enum_impressum_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__impressum_v_version_actions_appearance" AS ENUM('primary', 'secondary');
  CREATE TYPE "public"."enum__impressum_v_version_actions_link_type" AS ENUM('page', 'service', 'path', 'external');
  CREATE TYPE "public"."enum__impressum_v_version_actions_link_page" AS ENUM('home', 'services-overview', 'pricing', 'about', 'how-it-works', 'faq', 'contact', 'impressum', 'privacy', 'terms');
  CREATE TYPE "public"."enum__impressum_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__impressum_v_published_locale" AS ENUM('de', 'en');
  CREATE TYPE "public"."enum_privacy_actions_appearance" AS ENUM('primary', 'secondary');
  CREATE TYPE "public"."enum_privacy_actions_link_type" AS ENUM('page', 'service', 'path', 'external');
  CREATE TYPE "public"."enum_privacy_actions_link_page" AS ENUM('home', 'services-overview', 'pricing', 'about', 'how-it-works', 'faq', 'contact', 'impressum', 'privacy', 'terms');
  CREATE TYPE "public"."enum_privacy_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__privacy_v_version_actions_appearance" AS ENUM('primary', 'secondary');
  CREATE TYPE "public"."enum__privacy_v_version_actions_link_type" AS ENUM('page', 'service', 'path', 'external');
  CREATE TYPE "public"."enum__privacy_v_version_actions_link_page" AS ENUM('home', 'services-overview', 'pricing', 'about', 'how-it-works', 'faq', 'contact', 'impressum', 'privacy', 'terms');
  CREATE TYPE "public"."enum__privacy_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__privacy_v_published_locale" AS ENUM('de', 'en');
  CREATE TYPE "public"."enum_terms_actions_appearance" AS ENUM('primary', 'secondary');
  CREATE TYPE "public"."enum_terms_actions_link_type" AS ENUM('page', 'service', 'path', 'external');
  CREATE TYPE "public"."enum_terms_actions_link_page" AS ENUM('home', 'services-overview', 'pricing', 'about', 'how-it-works', 'faq', 'contact', 'impressum', 'privacy', 'terms');
  CREATE TYPE "public"."enum_terms_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__terms_v_version_actions_appearance" AS ENUM('primary', 'secondary');
  CREATE TYPE "public"."enum__terms_v_version_actions_link_type" AS ENUM('page', 'service', 'path', 'external');
  CREATE TYPE "public"."enum__terms_v_version_actions_link_page" AS ENUM('home', 'services-overview', 'pricing', 'about', 'how-it-works', 'faq', 'contact', 'impressum', 'privacy', 'terms');
  CREATE TYPE "public"."enum__terms_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__terms_v_published_locale" AS ENUM('de', 'en');
  CREATE TYPE "public"."enum_navbar_items_children_link_type" AS ENUM('page', 'service', 'path', 'external');
  CREATE TYPE "public"."enum_navbar_items_children_link_page" AS ENUM('home', 'services-overview', 'pricing', 'about', 'how-it-works', 'faq', 'contact', 'impressum', 'privacy', 'terms');
  CREATE TYPE "public"."enum_navbar_items_type" AS ENUM('link', 'dropdown');
  CREATE TYPE "public"."enum_navbar_items_appearance" AS ENUM('link', 'button');
  CREATE TYPE "public"."enum_navbar_items_link_type" AS ENUM('page', 'service', 'path', 'external');
  CREATE TYPE "public"."enum_navbar_items_link_page" AS ENUM('home', 'services-overview', 'pricing', 'about', 'how-it-works', 'faq', 'contact', 'impressum', 'privacy', 'terms');
  CREATE TYPE "public"."enum_navbar_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__navbar_v_version_items_children_link_type" AS ENUM('page', 'service', 'path', 'external');
  CREATE TYPE "public"."enum__navbar_v_version_items_children_link_page" AS ENUM('home', 'services-overview', 'pricing', 'about', 'how-it-works', 'faq', 'contact', 'impressum', 'privacy', 'terms');
  CREATE TYPE "public"."enum__navbar_v_version_items_type" AS ENUM('link', 'dropdown');
  CREATE TYPE "public"."enum__navbar_v_version_items_appearance" AS ENUM('link', 'button');
  CREATE TYPE "public"."enum__navbar_v_version_items_link_type" AS ENUM('page', 'service', 'path', 'external');
  CREATE TYPE "public"."enum__navbar_v_version_items_link_page" AS ENUM('home', 'services-overview', 'pricing', 'about', 'how-it-works', 'faq', 'contact', 'impressum', 'privacy', 'terms');
  CREATE TYPE "public"."enum__navbar_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__navbar_v_published_locale" AS ENUM('de', 'en');
  CREATE TYPE "public"."enum_footer_columns_links_link_type" AS ENUM('page', 'service', 'path', 'external');
  CREATE TYPE "public"."enum_footer_columns_links_link_page" AS ENUM('home', 'services-overview', 'pricing', 'about', 'how-it-works', 'faq', 'contact', 'impressum', 'privacy', 'terms');
  CREATE TYPE "public"."enum_footer_social_platform" AS ENUM('linkedin', 'xing', 'instagram', 'facebook', 'x', 'youtube', 'github', 'website');
  CREATE TYPE "public"."enum_footer_legal_links_link_type" AS ENUM('page', 'service', 'path', 'external');
  CREATE TYPE "public"."enum_footer_legal_links_link_page" AS ENUM('home', 'services-overview', 'pricing', 'about', 'how-it-works', 'faq', 'contact', 'impressum', 'privacy', 'terms');
  CREATE TYPE "public"."enum_footer_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__footer_v_version_columns_links_link_type" AS ENUM('page', 'service', 'path', 'external');
  CREATE TYPE "public"."enum__footer_v_version_columns_links_link_page" AS ENUM('home', 'services-overview', 'pricing', 'about', 'how-it-works', 'faq', 'contact', 'impressum', 'privacy', 'terms');
  CREATE TYPE "public"."enum__footer_v_version_social_platform" AS ENUM('linkedin', 'xing', 'instagram', 'facebook', 'x', 'youtube', 'github', 'website');
  CREATE TYPE "public"."enum__footer_v_version_legal_links_link_type" AS ENUM('page', 'service', 'path', 'external');
  CREATE TYPE "public"."enum__footer_v_version_legal_links_link_page" AS ENUM('home', 'services-overview', 'pricing', 'about', 'how-it-works', 'faq', 'contact', 'impressum', 'privacy', 'terms');
  CREATE TYPE "public"."enum__footer_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__footer_v_published_locale" AS ENUM('de', 'en');
  CREATE TABLE "services_key_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "services" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"sort_order" numeric DEFAULT 100,
  	"image_id" integer,
  	"seo_image_id" integer,
  	"seo_no_index" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_services_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "services_locales" (
  	"title" varchar,
  	"summary" varchar,
  	"sections" jsonb,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_services_v_version_key_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar,
  	"version_sort_order" numeric DEFAULT 100,
  	"version_image_id" integer,
  	"version_seo_image_id" integer,
  	"version_seo_no_index" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__services_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__services_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_services_v_locales" (
  	"version_title" varchar,
  	"version_summary" varchar,
  	"version_sections" jsonb,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "home_actions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"appearance" "enum_home_actions_appearance" DEFAULT 'primary',
  	"link_type" "enum_home_actions_link_type" DEFAULT 'page',
  	"link_page" "enum_home_actions_link_page",
  	"link_service_id" integer,
  	"link_path" varchar,
  	"link_url" varchar,
  	"link_new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "home_actions_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "home" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"seo_image_id" integer,
  	"seo_no_index" boolean DEFAULT false,
  	"_status" "enum_home_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "home_locales" (
  	"eyebrow" varchar,
  	"title" varchar,
  	"subtitle" varchar,
  	"sections" jsonb,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_home_v_version_actions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"appearance" "enum__home_v_version_actions_appearance" DEFAULT 'primary',
  	"link_type" "enum__home_v_version_actions_link_type" DEFAULT 'page',
  	"link_page" "enum__home_v_version_actions_link_page",
  	"link_service_id" integer,
  	"link_path" varchar,
  	"link_url" varchar,
  	"link_new_tab" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_v_version_actions_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_home_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_seo_image_id" integer,
  	"version_seo_no_index" boolean DEFAULT false,
  	"version__status" "enum__home_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__home_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_home_v_locales" (
  	"version_eyebrow" varchar,
  	"version_title" varchar,
  	"version_subtitle" varchar,
  	"version_sections" jsonb,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "services_overview_actions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"appearance" "enum_services_overview_actions_appearance" DEFAULT 'primary',
  	"link_type" "enum_services_overview_actions_link_type" DEFAULT 'page',
  	"link_page" "enum_services_overview_actions_link_page",
  	"link_service_id" integer,
  	"link_path" varchar,
  	"link_url" varchar,
  	"link_new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "services_overview_actions_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "services_overview" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"seo_image_id" integer,
  	"seo_no_index" boolean DEFAULT false,
  	"_status" "enum_services_overview_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "services_overview_locales" (
  	"eyebrow" varchar,
  	"title" varchar,
  	"subtitle" varchar,
  	"sections" jsonb,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_services_overview_v_version_actions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"appearance" "enum__services_overview_v_version_actions_appearance" DEFAULT 'primary',
  	"link_type" "enum__services_overview_v_version_actions_link_type" DEFAULT 'page',
  	"link_page" "enum__services_overview_v_version_actions_link_page",
  	"link_service_id" integer,
  	"link_path" varchar,
  	"link_url" varchar,
  	"link_new_tab" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_overview_v_version_actions_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_services_overview_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_seo_image_id" integer,
  	"version_seo_no_index" boolean DEFAULT false,
  	"version__status" "enum__services_overview_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__services_overview_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_services_overview_v_locales" (
  	"version_eyebrow" varchar,
  	"version_title" varchar,
  	"version_subtitle" varchar,
  	"version_sections" jsonb,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "pricing_actions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"appearance" "enum_pricing_actions_appearance" DEFAULT 'primary',
  	"link_type" "enum_pricing_actions_link_type" DEFAULT 'page',
  	"link_page" "enum_pricing_actions_link_page",
  	"link_service_id" integer,
  	"link_path" varchar,
  	"link_url" varchar,
  	"link_new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "pricing_actions_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pricing" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"seo_image_id" integer,
  	"seo_no_index" boolean DEFAULT false,
  	"_status" "enum_pricing_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "pricing_locales" (
  	"eyebrow" varchar,
  	"title" varchar,
  	"subtitle" varchar,
  	"sections" jsonb,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pricing_v_version_actions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"appearance" "enum__pricing_v_version_actions_appearance" DEFAULT 'primary',
  	"link_type" "enum__pricing_v_version_actions_link_type" DEFAULT 'page',
  	"link_page" "enum__pricing_v_version_actions_link_page",
  	"link_service_id" integer,
  	"link_path" varchar,
  	"link_url" varchar,
  	"link_new_tab" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pricing_v_version_actions_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pricing_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_seo_image_id" integer,
  	"version_seo_no_index" boolean DEFAULT false,
  	"version__status" "enum__pricing_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__pricing_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_pricing_v_locales" (
  	"version_eyebrow" varchar,
  	"version_title" varchar,
  	"version_subtitle" varchar,
  	"version_sections" jsonb,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "about_actions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"appearance" "enum_about_actions_appearance" DEFAULT 'primary',
  	"link_type" "enum_about_actions_link_type" DEFAULT 'page',
  	"link_page" "enum_about_actions_link_page",
  	"link_service_id" integer,
  	"link_path" varchar,
  	"link_url" varchar,
  	"link_new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "about_actions_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "about" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"seo_image_id" integer,
  	"seo_no_index" boolean DEFAULT false,
  	"_status" "enum_about_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "about_locales" (
  	"eyebrow" varchar,
  	"title" varchar,
  	"subtitle" varchar,
  	"sections" jsonb,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_about_v_version_actions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"appearance" "enum__about_v_version_actions_appearance" DEFAULT 'primary',
  	"link_type" "enum__about_v_version_actions_link_type" DEFAULT 'page',
  	"link_page" "enum__about_v_version_actions_link_page",
  	"link_service_id" integer,
  	"link_path" varchar,
  	"link_url" varchar,
  	"link_new_tab" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_about_v_version_actions_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_about_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_seo_image_id" integer,
  	"version_seo_no_index" boolean DEFAULT false,
  	"version__status" "enum__about_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__about_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_about_v_locales" (
  	"version_eyebrow" varchar,
  	"version_title" varchar,
  	"version_subtitle" varchar,
  	"version_sections" jsonb,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "how_it_works_actions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"appearance" "enum_how_it_works_actions_appearance" DEFAULT 'primary',
  	"link_type" "enum_how_it_works_actions_link_type" DEFAULT 'page',
  	"link_page" "enum_how_it_works_actions_link_page",
  	"link_service_id" integer,
  	"link_path" varchar,
  	"link_url" varchar,
  	"link_new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "how_it_works_actions_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "how_it_works" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"seo_image_id" integer,
  	"seo_no_index" boolean DEFAULT false,
  	"_status" "enum_how_it_works_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "how_it_works_locales" (
  	"eyebrow" varchar,
  	"title" varchar,
  	"subtitle" varchar,
  	"sections" jsonb,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_how_it_works_v_version_actions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"appearance" "enum__how_it_works_v_version_actions_appearance" DEFAULT 'primary',
  	"link_type" "enum__how_it_works_v_version_actions_link_type" DEFAULT 'page',
  	"link_page" "enum__how_it_works_v_version_actions_link_page",
  	"link_service_id" integer,
  	"link_path" varchar,
  	"link_url" varchar,
  	"link_new_tab" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_how_it_works_v_version_actions_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_how_it_works_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_seo_image_id" integer,
  	"version_seo_no_index" boolean DEFAULT false,
  	"version__status" "enum__how_it_works_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__how_it_works_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_how_it_works_v_locales" (
  	"version_eyebrow" varchar,
  	"version_title" varchar,
  	"version_subtitle" varchar,
  	"version_sections" jsonb,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "faq_actions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"appearance" "enum_faq_actions_appearance" DEFAULT 'primary',
  	"link_type" "enum_faq_actions_link_type" DEFAULT 'page',
  	"link_page" "enum_faq_actions_link_page",
  	"link_service_id" integer,
  	"link_path" varchar,
  	"link_url" varchar,
  	"link_new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "faq_actions_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "faq" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"seo_image_id" integer,
  	"seo_no_index" boolean DEFAULT false,
  	"_status" "enum_faq_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "faq_locales" (
  	"eyebrow" varchar,
  	"title" varchar,
  	"subtitle" varchar,
  	"sections" jsonb,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_faq_v_version_actions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"appearance" "enum__faq_v_version_actions_appearance" DEFAULT 'primary',
  	"link_type" "enum__faq_v_version_actions_link_type" DEFAULT 'page',
  	"link_page" "enum__faq_v_version_actions_link_page",
  	"link_service_id" integer,
  	"link_path" varchar,
  	"link_url" varchar,
  	"link_new_tab" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_faq_v_version_actions_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_faq_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_seo_image_id" integer,
  	"version_seo_no_index" boolean DEFAULT false,
  	"version__status" "enum__faq_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__faq_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_faq_v_locales" (
  	"version_eyebrow" varchar,
  	"version_title" varchar,
  	"version_subtitle" varchar,
  	"version_sections" jsonb,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "contact_actions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"appearance" "enum_contact_actions_appearance" DEFAULT 'primary',
  	"link_type" "enum_contact_actions_link_type" DEFAULT 'page',
  	"link_page" "enum_contact_actions_link_page",
  	"link_service_id" integer,
  	"link_path" varchar,
  	"link_url" varchar,
  	"link_new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "contact_actions_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "contact" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"seo_image_id" integer,
  	"seo_no_index" boolean DEFAULT false,
  	"_status" "enum_contact_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "contact_locales" (
  	"eyebrow" varchar,
  	"title" varchar,
  	"subtitle" varchar,
  	"sections" jsonb,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_contact_v_version_actions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"appearance" "enum__contact_v_version_actions_appearance" DEFAULT 'primary',
  	"link_type" "enum__contact_v_version_actions_link_type" DEFAULT 'page',
  	"link_page" "enum__contact_v_version_actions_link_page",
  	"link_service_id" integer,
  	"link_path" varchar,
  	"link_url" varchar,
  	"link_new_tab" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_contact_v_version_actions_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_contact_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_seo_image_id" integer,
  	"version_seo_no_index" boolean DEFAULT false,
  	"version__status" "enum__contact_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__contact_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_contact_v_locales" (
  	"version_eyebrow" varchar,
  	"version_title" varchar,
  	"version_subtitle" varchar,
  	"version_sections" jsonb,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "impressum_actions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"appearance" "enum_impressum_actions_appearance" DEFAULT 'primary',
  	"link_type" "enum_impressum_actions_link_type" DEFAULT 'page',
  	"link_page" "enum_impressum_actions_link_page",
  	"link_service_id" integer,
  	"link_path" varchar,
  	"link_url" varchar,
  	"link_new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "impressum_actions_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "impressum" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"seo_image_id" integer,
  	"seo_no_index" boolean DEFAULT false,
  	"_status" "enum_impressum_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "impressum_locales" (
  	"eyebrow" varchar,
  	"title" varchar,
  	"subtitle" varchar,
  	"sections" jsonb,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_impressum_v_version_actions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"appearance" "enum__impressum_v_version_actions_appearance" DEFAULT 'primary',
  	"link_type" "enum__impressum_v_version_actions_link_type" DEFAULT 'page',
  	"link_page" "enum__impressum_v_version_actions_link_page",
  	"link_service_id" integer,
  	"link_path" varchar,
  	"link_url" varchar,
  	"link_new_tab" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_impressum_v_version_actions_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_impressum_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_seo_image_id" integer,
  	"version_seo_no_index" boolean DEFAULT false,
  	"version__status" "enum__impressum_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__impressum_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_impressum_v_locales" (
  	"version_eyebrow" varchar,
  	"version_title" varchar,
  	"version_subtitle" varchar,
  	"version_sections" jsonb,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "privacy_actions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"appearance" "enum_privacy_actions_appearance" DEFAULT 'primary',
  	"link_type" "enum_privacy_actions_link_type" DEFAULT 'page',
  	"link_page" "enum_privacy_actions_link_page",
  	"link_service_id" integer,
  	"link_path" varchar,
  	"link_url" varchar,
  	"link_new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "privacy_actions_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "privacy" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"seo_image_id" integer,
  	"seo_no_index" boolean DEFAULT false,
  	"_status" "enum_privacy_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "privacy_locales" (
  	"eyebrow" varchar,
  	"title" varchar,
  	"subtitle" varchar,
  	"sections" jsonb,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_privacy_v_version_actions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"appearance" "enum__privacy_v_version_actions_appearance" DEFAULT 'primary',
  	"link_type" "enum__privacy_v_version_actions_link_type" DEFAULT 'page',
  	"link_page" "enum__privacy_v_version_actions_link_page",
  	"link_service_id" integer,
  	"link_path" varchar,
  	"link_url" varchar,
  	"link_new_tab" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_privacy_v_version_actions_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_privacy_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_seo_image_id" integer,
  	"version_seo_no_index" boolean DEFAULT false,
  	"version__status" "enum__privacy_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__privacy_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_privacy_v_locales" (
  	"version_eyebrow" varchar,
  	"version_title" varchar,
  	"version_subtitle" varchar,
  	"version_sections" jsonb,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "terms_actions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"appearance" "enum_terms_actions_appearance" DEFAULT 'primary',
  	"link_type" "enum_terms_actions_link_type" DEFAULT 'page',
  	"link_page" "enum_terms_actions_link_page",
  	"link_service_id" integer,
  	"link_path" varchar,
  	"link_url" varchar,
  	"link_new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "terms_actions_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "terms" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"seo_image_id" integer,
  	"seo_no_index" boolean DEFAULT false,
  	"_status" "enum_terms_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "terms_locales" (
  	"eyebrow" varchar,
  	"title" varchar,
  	"subtitle" varchar,
  	"sections" jsonb,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_terms_v_version_actions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"appearance" "enum__terms_v_version_actions_appearance" DEFAULT 'primary',
  	"link_type" "enum__terms_v_version_actions_link_type" DEFAULT 'page',
  	"link_page" "enum__terms_v_version_actions_link_page",
  	"link_service_id" integer,
  	"link_path" varchar,
  	"link_url" varchar,
  	"link_new_tab" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_terms_v_version_actions_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_terms_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_seo_image_id" integer,
  	"version_seo_no_index" boolean DEFAULT false,
  	"version__status" "enum__terms_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__terms_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_terms_v_locales" (
  	"version_eyebrow" varchar,
  	"version_title" varchar,
  	"version_subtitle" varchar,
  	"version_sections" jsonb,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "navbar_items_children" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_navbar_items_children_link_type" DEFAULT 'page',
  	"link_page" "enum_navbar_items_children_link_page",
  	"link_service_id" integer,
  	"link_path" varchar,
  	"link_url" varchar,
  	"link_new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "navbar_items_children_locales" (
  	"label" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "navbar_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" "enum_navbar_items_type" DEFAULT 'link',
  	"appearance" "enum_navbar_items_appearance" DEFAULT 'link',
  	"link_type" "enum_navbar_items_link_type" DEFAULT 'page',
  	"link_page" "enum_navbar_items_link_page",
  	"link_service_id" integer,
  	"link_path" varchar,
  	"link_url" varchar,
  	"link_new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "navbar_items_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "navbar" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"logo_id" integer,
  	"_status" "enum_navbar_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_navbar_v_version_items_children" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__navbar_v_version_items_children_link_type" DEFAULT 'page',
  	"link_page" "enum__navbar_v_version_items_children_link_page",
  	"link_service_id" integer,
  	"link_path" varchar,
  	"link_url" varchar,
  	"link_new_tab" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_navbar_v_version_items_children_locales" (
  	"label" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_navbar_v_version_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"type" "enum__navbar_v_version_items_type" DEFAULT 'link',
  	"appearance" "enum__navbar_v_version_items_appearance" DEFAULT 'link',
  	"link_type" "enum__navbar_v_version_items_link_type" DEFAULT 'page',
  	"link_page" "enum__navbar_v_version_items_link_page",
  	"link_service_id" integer,
  	"link_path" varchar,
  	"link_url" varchar,
  	"link_new_tab" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_navbar_v_version_items_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_navbar_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_logo_id" integer,
  	"version__status" "enum__navbar_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__navbar_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "footer_columns_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_footer_columns_links_link_type" DEFAULT 'page',
  	"link_page" "enum_footer_columns_links_link_page",
  	"link_service_id" integer,
  	"link_path" varchar,
  	"link_url" varchar,
  	"link_new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "footer_columns_links_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "footer_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "footer_columns_locales" (
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "footer_social" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"platform" "enum_footer_social_platform",
  	"url" varchar
  );
  
  CREATE TABLE "footer_legal_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_footer_legal_links_link_type" DEFAULT 'page',
  	"link_page" "enum_footer_legal_links_link_page",
  	"link_service_id" integer,
  	"link_path" varchar,
  	"link_url" varchar,
  	"link_new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "footer_legal_links_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "footer" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"logo_id" integer,
  	"contact_email" varchar,
  	"contact_phone" varchar,
  	"_status" "enum_footer_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "footer_locales" (
  	"tagline" varchar,
  	"contact_address" varchar,
  	"copyright" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_footer_v_version_columns_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__footer_v_version_columns_links_link_type" DEFAULT 'page',
  	"link_page" "enum__footer_v_version_columns_links_link_page",
  	"link_service_id" integer,
  	"link_path" varchar,
  	"link_url" varchar,
  	"link_new_tab" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_footer_v_version_columns_links_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_footer_v_version_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_footer_v_version_columns_locales" (
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_footer_v_version_social" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"platform" "enum__footer_v_version_social_platform",
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_footer_v_version_legal_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__footer_v_version_legal_links_link_type" DEFAULT 'page',
  	"link_page" "enum__footer_v_version_legal_links_link_page",
  	"link_service_id" integer,
  	"link_path" varchar,
  	"link_url" varchar,
  	"link_new_tab" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_footer_v_version_legal_links_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_footer_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_logo_id" integer,
  	"version_contact_email" varchar,
  	"version_contact_phone" varchar,
  	"version__status" "enum__footer_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__footer_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_footer_v_locales" (
  	"version_tagline" varchar,
  	"version_contact_address" varchar,
  	"version_copyright" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "services_id" integer;
  ALTER TABLE "services_key_points" ADD CONSTRAINT "services_key_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services" ADD CONSTRAINT "services_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services" ADD CONSTRAINT "services_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_locales" ADD CONSTRAINT "services_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_key_points" ADD CONSTRAINT "_services_v_version_key_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_parent_id_services_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_locales" ADD CONSTRAINT "_services_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_actions" ADD CONSTRAINT "home_actions_link_service_id_services_id_fk" FOREIGN KEY ("link_service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_actions" ADD CONSTRAINT "home_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_actions_locales" ADD CONSTRAINT "home_actions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_actions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home" ADD CONSTRAINT "home_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_locales" ADD CONSTRAINT "home_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_version_actions" ADD CONSTRAINT "_home_v_version_actions_link_service_id_services_id_fk" FOREIGN KEY ("link_service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v_version_actions" ADD CONSTRAINT "_home_v_version_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_version_actions_locales" ADD CONSTRAINT "_home_v_version_actions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v_version_actions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v" ADD CONSTRAINT "_home_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v_locales" ADD CONSTRAINT "_home_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_overview_actions" ADD CONSTRAINT "services_overview_actions_link_service_id_services_id_fk" FOREIGN KEY ("link_service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_overview_actions" ADD CONSTRAINT "services_overview_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_overview"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_overview_actions_locales" ADD CONSTRAINT "services_overview_actions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_overview_actions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_overview" ADD CONSTRAINT "services_overview_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_overview_locales" ADD CONSTRAINT "services_overview_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_overview"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_overview_v_version_actions" ADD CONSTRAINT "_services_overview_v_version_actions_link_service_id_services_id_fk" FOREIGN KEY ("link_service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_overview_v_version_actions" ADD CONSTRAINT "_services_overview_v_version_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_overview_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_overview_v_version_actions_locales" ADD CONSTRAINT "_services_overview_v_version_actions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_overview_v_version_actions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_overview_v" ADD CONSTRAINT "_services_overview_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_overview_v_locales" ADD CONSTRAINT "_services_overview_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_overview_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pricing_actions" ADD CONSTRAINT "pricing_actions_link_service_id_services_id_fk" FOREIGN KEY ("link_service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pricing_actions" ADD CONSTRAINT "pricing_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pricing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pricing_actions_locales" ADD CONSTRAINT "pricing_actions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pricing_actions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pricing" ADD CONSTRAINT "pricing_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pricing_locales" ADD CONSTRAINT "pricing_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pricing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pricing_v_version_actions" ADD CONSTRAINT "_pricing_v_version_actions_link_service_id_services_id_fk" FOREIGN KEY ("link_service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pricing_v_version_actions" ADD CONSTRAINT "_pricing_v_version_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pricing_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pricing_v_version_actions_locales" ADD CONSTRAINT "_pricing_v_version_actions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pricing_v_version_actions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pricing_v" ADD CONSTRAINT "_pricing_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pricing_v_locales" ADD CONSTRAINT "_pricing_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pricing_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_actions" ADD CONSTRAINT "about_actions_link_service_id_services_id_fk" FOREIGN KEY ("link_service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "about_actions" ADD CONSTRAINT "about_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_actions_locales" ADD CONSTRAINT "about_actions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_actions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about" ADD CONSTRAINT "about_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "about_locales" ADD CONSTRAINT "about_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_about_v_version_actions" ADD CONSTRAINT "_about_v_version_actions_link_service_id_services_id_fk" FOREIGN KEY ("link_service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_about_v_version_actions" ADD CONSTRAINT "_about_v_version_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_about_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_about_v_version_actions_locales" ADD CONSTRAINT "_about_v_version_actions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_about_v_version_actions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_about_v" ADD CONSTRAINT "_about_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_about_v_locales" ADD CONSTRAINT "_about_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_about_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "how_it_works_actions" ADD CONSTRAINT "how_it_works_actions_link_service_id_services_id_fk" FOREIGN KEY ("link_service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "how_it_works_actions" ADD CONSTRAINT "how_it_works_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."how_it_works"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "how_it_works_actions_locales" ADD CONSTRAINT "how_it_works_actions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."how_it_works_actions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "how_it_works" ADD CONSTRAINT "how_it_works_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "how_it_works_locales" ADD CONSTRAINT "how_it_works_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."how_it_works"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_how_it_works_v_version_actions" ADD CONSTRAINT "_how_it_works_v_version_actions_link_service_id_services_id_fk" FOREIGN KEY ("link_service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_how_it_works_v_version_actions" ADD CONSTRAINT "_how_it_works_v_version_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_how_it_works_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_how_it_works_v_version_actions_locales" ADD CONSTRAINT "_how_it_works_v_version_actions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_how_it_works_v_version_actions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_how_it_works_v" ADD CONSTRAINT "_how_it_works_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_how_it_works_v_locales" ADD CONSTRAINT "_how_it_works_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_how_it_works_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "faq_actions" ADD CONSTRAINT "faq_actions_link_service_id_services_id_fk" FOREIGN KEY ("link_service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "faq_actions" ADD CONSTRAINT "faq_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "faq_actions_locales" ADD CONSTRAINT "faq_actions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."faq_actions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "faq" ADD CONSTRAINT "faq_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "faq_locales" ADD CONSTRAINT "faq_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_faq_v_version_actions" ADD CONSTRAINT "_faq_v_version_actions_link_service_id_services_id_fk" FOREIGN KEY ("link_service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_faq_v_version_actions" ADD CONSTRAINT "_faq_v_version_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_faq_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_faq_v_version_actions_locales" ADD CONSTRAINT "_faq_v_version_actions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_faq_v_version_actions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_faq_v" ADD CONSTRAINT "_faq_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_faq_v_locales" ADD CONSTRAINT "_faq_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_faq_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_actions" ADD CONSTRAINT "contact_actions_link_service_id_services_id_fk" FOREIGN KEY ("link_service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "contact_actions" ADD CONSTRAINT "contact_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_actions_locales" ADD CONSTRAINT "contact_actions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_actions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact" ADD CONSTRAINT "contact_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "contact_locales" ADD CONSTRAINT "contact_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contact_v_version_actions" ADD CONSTRAINT "_contact_v_version_actions_link_service_id_services_id_fk" FOREIGN KEY ("link_service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_contact_v_version_actions" ADD CONSTRAINT "_contact_v_version_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contact_v_version_actions_locales" ADD CONSTRAINT "_contact_v_version_actions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_v_version_actions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contact_v" ADD CONSTRAINT "_contact_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_contact_v_locales" ADD CONSTRAINT "_contact_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "impressum_actions" ADD CONSTRAINT "impressum_actions_link_service_id_services_id_fk" FOREIGN KEY ("link_service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "impressum_actions" ADD CONSTRAINT "impressum_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."impressum"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "impressum_actions_locales" ADD CONSTRAINT "impressum_actions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."impressum_actions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "impressum" ADD CONSTRAINT "impressum_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "impressum_locales" ADD CONSTRAINT "impressum_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."impressum"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_impressum_v_version_actions" ADD CONSTRAINT "_impressum_v_version_actions_link_service_id_services_id_fk" FOREIGN KEY ("link_service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_impressum_v_version_actions" ADD CONSTRAINT "_impressum_v_version_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_impressum_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_impressum_v_version_actions_locales" ADD CONSTRAINT "_impressum_v_version_actions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_impressum_v_version_actions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_impressum_v" ADD CONSTRAINT "_impressum_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_impressum_v_locales" ADD CONSTRAINT "_impressum_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_impressum_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "privacy_actions" ADD CONSTRAINT "privacy_actions_link_service_id_services_id_fk" FOREIGN KEY ("link_service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "privacy_actions" ADD CONSTRAINT "privacy_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."privacy"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "privacy_actions_locales" ADD CONSTRAINT "privacy_actions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."privacy_actions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "privacy" ADD CONSTRAINT "privacy_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "privacy_locales" ADD CONSTRAINT "privacy_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."privacy"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_privacy_v_version_actions" ADD CONSTRAINT "_privacy_v_version_actions_link_service_id_services_id_fk" FOREIGN KEY ("link_service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_privacy_v_version_actions" ADD CONSTRAINT "_privacy_v_version_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_privacy_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_privacy_v_version_actions_locales" ADD CONSTRAINT "_privacy_v_version_actions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_privacy_v_version_actions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_privacy_v" ADD CONSTRAINT "_privacy_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_privacy_v_locales" ADD CONSTRAINT "_privacy_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_privacy_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "terms_actions" ADD CONSTRAINT "terms_actions_link_service_id_services_id_fk" FOREIGN KEY ("link_service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "terms_actions" ADD CONSTRAINT "terms_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."terms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "terms_actions_locales" ADD CONSTRAINT "terms_actions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."terms_actions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "terms" ADD CONSTRAINT "terms_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "terms_locales" ADD CONSTRAINT "terms_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."terms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_terms_v_version_actions" ADD CONSTRAINT "_terms_v_version_actions_link_service_id_services_id_fk" FOREIGN KEY ("link_service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_terms_v_version_actions" ADD CONSTRAINT "_terms_v_version_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_terms_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_terms_v_version_actions_locales" ADD CONSTRAINT "_terms_v_version_actions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_terms_v_version_actions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_terms_v" ADD CONSTRAINT "_terms_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_terms_v_locales" ADD CONSTRAINT "_terms_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_terms_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navbar_items_children" ADD CONSTRAINT "navbar_items_children_link_service_id_services_id_fk" FOREIGN KEY ("link_service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navbar_items_children" ADD CONSTRAINT "navbar_items_children_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navbar_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navbar_items_children_locales" ADD CONSTRAINT "navbar_items_children_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navbar_items_children"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navbar_items" ADD CONSTRAINT "navbar_items_link_service_id_services_id_fk" FOREIGN KEY ("link_service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navbar_items" ADD CONSTRAINT "navbar_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navbar"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navbar_items_locales" ADD CONSTRAINT "navbar_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navbar_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navbar" ADD CONSTRAINT "navbar_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_navbar_v_version_items_children" ADD CONSTRAINT "_navbar_v_version_items_children_link_service_id_services_id_fk" FOREIGN KEY ("link_service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_navbar_v_version_items_children" ADD CONSTRAINT "_navbar_v_version_items_children_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_navbar_v_version_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_navbar_v_version_items_children_locales" ADD CONSTRAINT "_navbar_v_version_items_children_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_navbar_v_version_items_children"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_navbar_v_version_items" ADD CONSTRAINT "_navbar_v_version_items_link_service_id_services_id_fk" FOREIGN KEY ("link_service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_navbar_v_version_items" ADD CONSTRAINT "_navbar_v_version_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_navbar_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_navbar_v_version_items_locales" ADD CONSTRAINT "_navbar_v_version_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_navbar_v_version_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_navbar_v" ADD CONSTRAINT "_navbar_v_version_logo_id_media_id_fk" FOREIGN KEY ("version_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "footer_columns_links" ADD CONSTRAINT "footer_columns_links_link_service_id_services_id_fk" FOREIGN KEY ("link_service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "footer_columns_links" ADD CONSTRAINT "footer_columns_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_columns_links_locales" ADD CONSTRAINT "footer_columns_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_columns_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_columns" ADD CONSTRAINT "footer_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_columns_locales" ADD CONSTRAINT "footer_columns_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_social" ADD CONSTRAINT "footer_social_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_legal_links" ADD CONSTRAINT "footer_legal_links_link_service_id_services_id_fk" FOREIGN KEY ("link_service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "footer_legal_links" ADD CONSTRAINT "footer_legal_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_legal_links_locales" ADD CONSTRAINT "footer_legal_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_legal_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer" ADD CONSTRAINT "footer_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "footer_locales" ADD CONSTRAINT "footer_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_version_columns_links" ADD CONSTRAINT "_footer_v_version_columns_links_link_service_id_services_id_fk" FOREIGN KEY ("link_service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_footer_v_version_columns_links" ADD CONSTRAINT "_footer_v_version_columns_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_footer_v_version_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_version_columns_links_locales" ADD CONSTRAINT "_footer_v_version_columns_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_footer_v_version_columns_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_version_columns" ADD CONSTRAINT "_footer_v_version_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_footer_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_version_columns_locales" ADD CONSTRAINT "_footer_v_version_columns_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_footer_v_version_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_version_social" ADD CONSTRAINT "_footer_v_version_social_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_footer_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_version_legal_links" ADD CONSTRAINT "_footer_v_version_legal_links_link_service_id_services_id_fk" FOREIGN KEY ("link_service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_footer_v_version_legal_links" ADD CONSTRAINT "_footer_v_version_legal_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_footer_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_version_legal_links_locales" ADD CONSTRAINT "_footer_v_version_legal_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_footer_v_version_legal_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v" ADD CONSTRAINT "_footer_v_version_logo_id_media_id_fk" FOREIGN KEY ("version_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_footer_v_locales" ADD CONSTRAINT "_footer_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_footer_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "services_key_points_order_idx" ON "services_key_points" USING btree ("_order");
  CREATE INDEX "services_key_points_parent_id_idx" ON "services_key_points" USING btree ("_parent_id");
  CREATE INDEX "services_key_points_locale_idx" ON "services_key_points" USING btree ("_locale");
  CREATE UNIQUE INDEX "services_slug_idx" ON "services" USING btree ("slug");
  CREATE INDEX "services_sort_order_idx" ON "services" USING btree ("sort_order");
  CREATE INDEX "services_image_idx" ON "services" USING btree ("image_id");
  CREATE INDEX "services_seo_seo_image_idx" ON "services" USING btree ("seo_image_id");
  CREATE INDEX "services_updated_at_idx" ON "services" USING btree ("updated_at");
  CREATE INDEX "services_created_at_idx" ON "services" USING btree ("created_at");
  CREATE INDEX "services__status_idx" ON "services" USING btree ("_status");
  CREATE UNIQUE INDEX "services_locales_locale_parent_id_unique" ON "services_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "services_locales_parent_id_idx" ON "services_locales" USING btree ("_parent_id");
  CREATE INDEX "_services_v_version_key_points_order_idx" ON "_services_v_version_key_points" USING btree ("_order");
  CREATE INDEX "_services_v_version_key_points_parent_id_idx" ON "_services_v_version_key_points" USING btree ("_parent_id");
  CREATE INDEX "_services_v_version_key_points_locale_idx" ON "_services_v_version_key_points" USING btree ("_locale");
  CREATE INDEX "_services_v_parent_idx" ON "_services_v" USING btree ("parent_id");
  CREATE INDEX "_services_v_version_version_slug_idx" ON "_services_v" USING btree ("version_slug");
  CREATE INDEX "_services_v_version_version_sort_order_idx" ON "_services_v" USING btree ("version_sort_order");
  CREATE INDEX "_services_v_version_version_image_idx" ON "_services_v" USING btree ("version_image_id");
  CREATE INDEX "_services_v_version_seo_version_seo_image_idx" ON "_services_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_services_v_version_version_updated_at_idx" ON "_services_v" USING btree ("version_updated_at");
  CREATE INDEX "_services_v_version_version_created_at_idx" ON "_services_v" USING btree ("version_created_at");
  CREATE INDEX "_services_v_version_version__status_idx" ON "_services_v" USING btree ("version__status");
  CREATE INDEX "_services_v_created_at_idx" ON "_services_v" USING btree ("created_at");
  CREATE INDEX "_services_v_updated_at_idx" ON "_services_v" USING btree ("updated_at");
  CREATE INDEX "_services_v_snapshot_idx" ON "_services_v" USING btree ("snapshot");
  CREATE INDEX "_services_v_published_locale_idx" ON "_services_v" USING btree ("published_locale");
  CREATE INDEX "_services_v_latest_idx" ON "_services_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_services_v_locales_locale_parent_id_unique" ON "_services_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_services_v_locales_parent_id_idx" ON "_services_v_locales" USING btree ("_parent_id");
  CREATE INDEX "home_actions_order_idx" ON "home_actions" USING btree ("_order");
  CREATE INDEX "home_actions_parent_id_idx" ON "home_actions" USING btree ("_parent_id");
  CREATE INDEX "home_actions_link_link_service_idx" ON "home_actions" USING btree ("link_service_id");
  CREATE UNIQUE INDEX "home_actions_locales_locale_parent_id_unique" ON "home_actions_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "home_actions_locales_parent_id_idx" ON "home_actions_locales" USING btree ("_parent_id");
  CREATE INDEX "home_seo_seo_image_idx" ON "home" USING btree ("seo_image_id");
  CREATE INDEX "home__status_idx" ON "home" USING btree ("_status");
  CREATE UNIQUE INDEX "home_locales_locale_parent_id_unique" ON "home_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "home_locales_parent_id_idx" ON "home_locales" USING btree ("_parent_id");
  CREATE INDEX "_home_v_version_actions_order_idx" ON "_home_v_version_actions" USING btree ("_order");
  CREATE INDEX "_home_v_version_actions_parent_id_idx" ON "_home_v_version_actions" USING btree ("_parent_id");
  CREATE INDEX "_home_v_version_actions_link_link_service_idx" ON "_home_v_version_actions" USING btree ("link_service_id");
  CREATE UNIQUE INDEX "_home_v_version_actions_locales_locale_parent_id_unique" ON "_home_v_version_actions_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_home_v_version_actions_locales_parent_id_idx" ON "_home_v_version_actions_locales" USING btree ("_parent_id");
  CREATE INDEX "_home_v_version_seo_version_seo_image_idx" ON "_home_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_home_v_version_version__status_idx" ON "_home_v" USING btree ("version__status");
  CREATE INDEX "_home_v_created_at_idx" ON "_home_v" USING btree ("created_at");
  CREATE INDEX "_home_v_updated_at_idx" ON "_home_v" USING btree ("updated_at");
  CREATE INDEX "_home_v_snapshot_idx" ON "_home_v" USING btree ("snapshot");
  CREATE INDEX "_home_v_published_locale_idx" ON "_home_v" USING btree ("published_locale");
  CREATE INDEX "_home_v_latest_idx" ON "_home_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_home_v_locales_locale_parent_id_unique" ON "_home_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_home_v_locales_parent_id_idx" ON "_home_v_locales" USING btree ("_parent_id");
  CREATE INDEX "services_overview_actions_order_idx" ON "services_overview_actions" USING btree ("_order");
  CREATE INDEX "services_overview_actions_parent_id_idx" ON "services_overview_actions" USING btree ("_parent_id");
  CREATE INDEX "services_overview_actions_link_link_service_idx" ON "services_overview_actions" USING btree ("link_service_id");
  CREATE UNIQUE INDEX "services_overview_actions_locales_locale_parent_id_unique" ON "services_overview_actions_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "services_overview_actions_locales_parent_id_idx" ON "services_overview_actions_locales" USING btree ("_parent_id");
  CREATE INDEX "services_overview_seo_seo_image_idx" ON "services_overview" USING btree ("seo_image_id");
  CREATE INDEX "services_overview__status_idx" ON "services_overview" USING btree ("_status");
  CREATE UNIQUE INDEX "services_overview_locales_locale_parent_id_unique" ON "services_overview_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "services_overview_locales_parent_id_idx" ON "services_overview_locales" USING btree ("_parent_id");
  CREATE INDEX "_services_overview_v_version_actions_order_idx" ON "_services_overview_v_version_actions" USING btree ("_order");
  CREATE INDEX "_services_overview_v_version_actions_parent_id_idx" ON "_services_overview_v_version_actions" USING btree ("_parent_id");
  CREATE INDEX "_services_overview_v_version_actions_link_link_service_idx" ON "_services_overview_v_version_actions" USING btree ("link_service_id");
  CREATE UNIQUE INDEX "_services_overview_v_version_actions_locales_locale_parent_i" ON "_services_overview_v_version_actions_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_services_overview_v_version_actions_locales_parent_id_idx" ON "_services_overview_v_version_actions_locales" USING btree ("_parent_id");
  CREATE INDEX "_services_overview_v_version_seo_version_seo_image_idx" ON "_services_overview_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_services_overview_v_version_version__status_idx" ON "_services_overview_v" USING btree ("version__status");
  CREATE INDEX "_services_overview_v_created_at_idx" ON "_services_overview_v" USING btree ("created_at");
  CREATE INDEX "_services_overview_v_updated_at_idx" ON "_services_overview_v" USING btree ("updated_at");
  CREATE INDEX "_services_overview_v_snapshot_idx" ON "_services_overview_v" USING btree ("snapshot");
  CREATE INDEX "_services_overview_v_published_locale_idx" ON "_services_overview_v" USING btree ("published_locale");
  CREATE INDEX "_services_overview_v_latest_idx" ON "_services_overview_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_services_overview_v_locales_locale_parent_id_unique" ON "_services_overview_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_services_overview_v_locales_parent_id_idx" ON "_services_overview_v_locales" USING btree ("_parent_id");
  CREATE INDEX "pricing_actions_order_idx" ON "pricing_actions" USING btree ("_order");
  CREATE INDEX "pricing_actions_parent_id_idx" ON "pricing_actions" USING btree ("_parent_id");
  CREATE INDEX "pricing_actions_link_link_service_idx" ON "pricing_actions" USING btree ("link_service_id");
  CREATE UNIQUE INDEX "pricing_actions_locales_locale_parent_id_unique" ON "pricing_actions_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pricing_actions_locales_parent_id_idx" ON "pricing_actions_locales" USING btree ("_parent_id");
  CREATE INDEX "pricing_seo_seo_image_idx" ON "pricing" USING btree ("seo_image_id");
  CREATE INDEX "pricing__status_idx" ON "pricing" USING btree ("_status");
  CREATE UNIQUE INDEX "pricing_locales_locale_parent_id_unique" ON "pricing_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pricing_locales_parent_id_idx" ON "pricing_locales" USING btree ("_parent_id");
  CREATE INDEX "_pricing_v_version_actions_order_idx" ON "_pricing_v_version_actions" USING btree ("_order");
  CREATE INDEX "_pricing_v_version_actions_parent_id_idx" ON "_pricing_v_version_actions" USING btree ("_parent_id");
  CREATE INDEX "_pricing_v_version_actions_link_link_service_idx" ON "_pricing_v_version_actions" USING btree ("link_service_id");
  CREATE UNIQUE INDEX "_pricing_v_version_actions_locales_locale_parent_id_unique" ON "_pricing_v_version_actions_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pricing_v_version_actions_locales_parent_id_idx" ON "_pricing_v_version_actions_locales" USING btree ("_parent_id");
  CREATE INDEX "_pricing_v_version_seo_version_seo_image_idx" ON "_pricing_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_pricing_v_version_version__status_idx" ON "_pricing_v" USING btree ("version__status");
  CREATE INDEX "_pricing_v_created_at_idx" ON "_pricing_v" USING btree ("created_at");
  CREATE INDEX "_pricing_v_updated_at_idx" ON "_pricing_v" USING btree ("updated_at");
  CREATE INDEX "_pricing_v_snapshot_idx" ON "_pricing_v" USING btree ("snapshot");
  CREATE INDEX "_pricing_v_published_locale_idx" ON "_pricing_v" USING btree ("published_locale");
  CREATE INDEX "_pricing_v_latest_idx" ON "_pricing_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_pricing_v_locales_locale_parent_id_unique" ON "_pricing_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pricing_v_locales_parent_id_idx" ON "_pricing_v_locales" USING btree ("_parent_id");
  CREATE INDEX "about_actions_order_idx" ON "about_actions" USING btree ("_order");
  CREATE INDEX "about_actions_parent_id_idx" ON "about_actions" USING btree ("_parent_id");
  CREATE INDEX "about_actions_link_link_service_idx" ON "about_actions" USING btree ("link_service_id");
  CREATE UNIQUE INDEX "about_actions_locales_locale_parent_id_unique" ON "about_actions_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "about_actions_locales_parent_id_idx" ON "about_actions_locales" USING btree ("_parent_id");
  CREATE INDEX "about_seo_seo_image_idx" ON "about" USING btree ("seo_image_id");
  CREATE INDEX "about__status_idx" ON "about" USING btree ("_status");
  CREATE UNIQUE INDEX "about_locales_locale_parent_id_unique" ON "about_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "about_locales_parent_id_idx" ON "about_locales" USING btree ("_parent_id");
  CREATE INDEX "_about_v_version_actions_order_idx" ON "_about_v_version_actions" USING btree ("_order");
  CREATE INDEX "_about_v_version_actions_parent_id_idx" ON "_about_v_version_actions" USING btree ("_parent_id");
  CREATE INDEX "_about_v_version_actions_link_link_service_idx" ON "_about_v_version_actions" USING btree ("link_service_id");
  CREATE UNIQUE INDEX "_about_v_version_actions_locales_locale_parent_id_unique" ON "_about_v_version_actions_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_about_v_version_actions_locales_parent_id_idx" ON "_about_v_version_actions_locales" USING btree ("_parent_id");
  CREATE INDEX "_about_v_version_seo_version_seo_image_idx" ON "_about_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_about_v_version_version__status_idx" ON "_about_v" USING btree ("version__status");
  CREATE INDEX "_about_v_created_at_idx" ON "_about_v" USING btree ("created_at");
  CREATE INDEX "_about_v_updated_at_idx" ON "_about_v" USING btree ("updated_at");
  CREATE INDEX "_about_v_snapshot_idx" ON "_about_v" USING btree ("snapshot");
  CREATE INDEX "_about_v_published_locale_idx" ON "_about_v" USING btree ("published_locale");
  CREATE INDEX "_about_v_latest_idx" ON "_about_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_about_v_locales_locale_parent_id_unique" ON "_about_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_about_v_locales_parent_id_idx" ON "_about_v_locales" USING btree ("_parent_id");
  CREATE INDEX "how_it_works_actions_order_idx" ON "how_it_works_actions" USING btree ("_order");
  CREATE INDEX "how_it_works_actions_parent_id_idx" ON "how_it_works_actions" USING btree ("_parent_id");
  CREATE INDEX "how_it_works_actions_link_link_service_idx" ON "how_it_works_actions" USING btree ("link_service_id");
  CREATE UNIQUE INDEX "how_it_works_actions_locales_locale_parent_id_unique" ON "how_it_works_actions_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "how_it_works_actions_locales_parent_id_idx" ON "how_it_works_actions_locales" USING btree ("_parent_id");
  CREATE INDEX "how_it_works_seo_seo_image_idx" ON "how_it_works" USING btree ("seo_image_id");
  CREATE INDEX "how_it_works__status_idx" ON "how_it_works" USING btree ("_status");
  CREATE UNIQUE INDEX "how_it_works_locales_locale_parent_id_unique" ON "how_it_works_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "how_it_works_locales_parent_id_idx" ON "how_it_works_locales" USING btree ("_parent_id");
  CREATE INDEX "_how_it_works_v_version_actions_order_idx" ON "_how_it_works_v_version_actions" USING btree ("_order");
  CREATE INDEX "_how_it_works_v_version_actions_parent_id_idx" ON "_how_it_works_v_version_actions" USING btree ("_parent_id");
  CREATE INDEX "_how_it_works_v_version_actions_link_link_service_idx" ON "_how_it_works_v_version_actions" USING btree ("link_service_id");
  CREATE UNIQUE INDEX "_how_it_works_v_version_actions_locales_locale_parent_id_uni" ON "_how_it_works_v_version_actions_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_how_it_works_v_version_actions_locales_parent_id_idx" ON "_how_it_works_v_version_actions_locales" USING btree ("_parent_id");
  CREATE INDEX "_how_it_works_v_version_seo_version_seo_image_idx" ON "_how_it_works_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_how_it_works_v_version_version__status_idx" ON "_how_it_works_v" USING btree ("version__status");
  CREATE INDEX "_how_it_works_v_created_at_idx" ON "_how_it_works_v" USING btree ("created_at");
  CREATE INDEX "_how_it_works_v_updated_at_idx" ON "_how_it_works_v" USING btree ("updated_at");
  CREATE INDEX "_how_it_works_v_snapshot_idx" ON "_how_it_works_v" USING btree ("snapshot");
  CREATE INDEX "_how_it_works_v_published_locale_idx" ON "_how_it_works_v" USING btree ("published_locale");
  CREATE INDEX "_how_it_works_v_latest_idx" ON "_how_it_works_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_how_it_works_v_locales_locale_parent_id_unique" ON "_how_it_works_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_how_it_works_v_locales_parent_id_idx" ON "_how_it_works_v_locales" USING btree ("_parent_id");
  CREATE INDEX "faq_actions_order_idx" ON "faq_actions" USING btree ("_order");
  CREATE INDEX "faq_actions_parent_id_idx" ON "faq_actions" USING btree ("_parent_id");
  CREATE INDEX "faq_actions_link_link_service_idx" ON "faq_actions" USING btree ("link_service_id");
  CREATE UNIQUE INDEX "faq_actions_locales_locale_parent_id_unique" ON "faq_actions_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "faq_actions_locales_parent_id_idx" ON "faq_actions_locales" USING btree ("_parent_id");
  CREATE INDEX "faq_seo_seo_image_idx" ON "faq" USING btree ("seo_image_id");
  CREATE INDEX "faq__status_idx" ON "faq" USING btree ("_status");
  CREATE UNIQUE INDEX "faq_locales_locale_parent_id_unique" ON "faq_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "faq_locales_parent_id_idx" ON "faq_locales" USING btree ("_parent_id");
  CREATE INDEX "_faq_v_version_actions_order_idx" ON "_faq_v_version_actions" USING btree ("_order");
  CREATE INDEX "_faq_v_version_actions_parent_id_idx" ON "_faq_v_version_actions" USING btree ("_parent_id");
  CREATE INDEX "_faq_v_version_actions_link_link_service_idx" ON "_faq_v_version_actions" USING btree ("link_service_id");
  CREATE UNIQUE INDEX "_faq_v_version_actions_locales_locale_parent_id_unique" ON "_faq_v_version_actions_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_faq_v_version_actions_locales_parent_id_idx" ON "_faq_v_version_actions_locales" USING btree ("_parent_id");
  CREATE INDEX "_faq_v_version_seo_version_seo_image_idx" ON "_faq_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_faq_v_version_version__status_idx" ON "_faq_v" USING btree ("version__status");
  CREATE INDEX "_faq_v_created_at_idx" ON "_faq_v" USING btree ("created_at");
  CREATE INDEX "_faq_v_updated_at_idx" ON "_faq_v" USING btree ("updated_at");
  CREATE INDEX "_faq_v_snapshot_idx" ON "_faq_v" USING btree ("snapshot");
  CREATE INDEX "_faq_v_published_locale_idx" ON "_faq_v" USING btree ("published_locale");
  CREATE INDEX "_faq_v_latest_idx" ON "_faq_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_faq_v_locales_locale_parent_id_unique" ON "_faq_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_faq_v_locales_parent_id_idx" ON "_faq_v_locales" USING btree ("_parent_id");
  CREATE INDEX "contact_actions_order_idx" ON "contact_actions" USING btree ("_order");
  CREATE INDEX "contact_actions_parent_id_idx" ON "contact_actions" USING btree ("_parent_id");
  CREATE INDEX "contact_actions_link_link_service_idx" ON "contact_actions" USING btree ("link_service_id");
  CREATE UNIQUE INDEX "contact_actions_locales_locale_parent_id_unique" ON "contact_actions_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "contact_actions_locales_parent_id_idx" ON "contact_actions_locales" USING btree ("_parent_id");
  CREATE INDEX "contact_seo_seo_image_idx" ON "contact" USING btree ("seo_image_id");
  CREATE INDEX "contact__status_idx" ON "contact" USING btree ("_status");
  CREATE UNIQUE INDEX "contact_locales_locale_parent_id_unique" ON "contact_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "contact_locales_parent_id_idx" ON "contact_locales" USING btree ("_parent_id");
  CREATE INDEX "_contact_v_version_actions_order_idx" ON "_contact_v_version_actions" USING btree ("_order");
  CREATE INDEX "_contact_v_version_actions_parent_id_idx" ON "_contact_v_version_actions" USING btree ("_parent_id");
  CREATE INDEX "_contact_v_version_actions_link_link_service_idx" ON "_contact_v_version_actions" USING btree ("link_service_id");
  CREATE UNIQUE INDEX "_contact_v_version_actions_locales_locale_parent_id_unique" ON "_contact_v_version_actions_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_contact_v_version_actions_locales_parent_id_idx" ON "_contact_v_version_actions_locales" USING btree ("_parent_id");
  CREATE INDEX "_contact_v_version_seo_version_seo_image_idx" ON "_contact_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_contact_v_version_version__status_idx" ON "_contact_v" USING btree ("version__status");
  CREATE INDEX "_contact_v_created_at_idx" ON "_contact_v" USING btree ("created_at");
  CREATE INDEX "_contact_v_updated_at_idx" ON "_contact_v" USING btree ("updated_at");
  CREATE INDEX "_contact_v_snapshot_idx" ON "_contact_v" USING btree ("snapshot");
  CREATE INDEX "_contact_v_published_locale_idx" ON "_contact_v" USING btree ("published_locale");
  CREATE INDEX "_contact_v_latest_idx" ON "_contact_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_contact_v_locales_locale_parent_id_unique" ON "_contact_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_contact_v_locales_parent_id_idx" ON "_contact_v_locales" USING btree ("_parent_id");
  CREATE INDEX "impressum_actions_order_idx" ON "impressum_actions" USING btree ("_order");
  CREATE INDEX "impressum_actions_parent_id_idx" ON "impressum_actions" USING btree ("_parent_id");
  CREATE INDEX "impressum_actions_link_link_service_idx" ON "impressum_actions" USING btree ("link_service_id");
  CREATE UNIQUE INDEX "impressum_actions_locales_locale_parent_id_unique" ON "impressum_actions_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "impressum_actions_locales_parent_id_idx" ON "impressum_actions_locales" USING btree ("_parent_id");
  CREATE INDEX "impressum_seo_seo_image_idx" ON "impressum" USING btree ("seo_image_id");
  CREATE INDEX "impressum__status_idx" ON "impressum" USING btree ("_status");
  CREATE UNIQUE INDEX "impressum_locales_locale_parent_id_unique" ON "impressum_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "impressum_locales_parent_id_idx" ON "impressum_locales" USING btree ("_parent_id");
  CREATE INDEX "_impressum_v_version_actions_order_idx" ON "_impressum_v_version_actions" USING btree ("_order");
  CREATE INDEX "_impressum_v_version_actions_parent_id_idx" ON "_impressum_v_version_actions" USING btree ("_parent_id");
  CREATE INDEX "_impressum_v_version_actions_link_link_service_idx" ON "_impressum_v_version_actions" USING btree ("link_service_id");
  CREATE UNIQUE INDEX "_impressum_v_version_actions_locales_locale_parent_id_unique" ON "_impressum_v_version_actions_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_impressum_v_version_actions_locales_parent_id_idx" ON "_impressum_v_version_actions_locales" USING btree ("_parent_id");
  CREATE INDEX "_impressum_v_version_seo_version_seo_image_idx" ON "_impressum_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_impressum_v_version_version__status_idx" ON "_impressum_v" USING btree ("version__status");
  CREATE INDEX "_impressum_v_created_at_idx" ON "_impressum_v" USING btree ("created_at");
  CREATE INDEX "_impressum_v_updated_at_idx" ON "_impressum_v" USING btree ("updated_at");
  CREATE INDEX "_impressum_v_snapshot_idx" ON "_impressum_v" USING btree ("snapshot");
  CREATE INDEX "_impressum_v_published_locale_idx" ON "_impressum_v" USING btree ("published_locale");
  CREATE INDEX "_impressum_v_latest_idx" ON "_impressum_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_impressum_v_locales_locale_parent_id_unique" ON "_impressum_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_impressum_v_locales_parent_id_idx" ON "_impressum_v_locales" USING btree ("_parent_id");
  CREATE INDEX "privacy_actions_order_idx" ON "privacy_actions" USING btree ("_order");
  CREATE INDEX "privacy_actions_parent_id_idx" ON "privacy_actions" USING btree ("_parent_id");
  CREATE INDEX "privacy_actions_link_link_service_idx" ON "privacy_actions" USING btree ("link_service_id");
  CREATE UNIQUE INDEX "privacy_actions_locales_locale_parent_id_unique" ON "privacy_actions_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "privacy_actions_locales_parent_id_idx" ON "privacy_actions_locales" USING btree ("_parent_id");
  CREATE INDEX "privacy_seo_seo_image_idx" ON "privacy" USING btree ("seo_image_id");
  CREATE INDEX "privacy__status_idx" ON "privacy" USING btree ("_status");
  CREATE UNIQUE INDEX "privacy_locales_locale_parent_id_unique" ON "privacy_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "privacy_locales_parent_id_idx" ON "privacy_locales" USING btree ("_parent_id");
  CREATE INDEX "_privacy_v_version_actions_order_idx" ON "_privacy_v_version_actions" USING btree ("_order");
  CREATE INDEX "_privacy_v_version_actions_parent_id_idx" ON "_privacy_v_version_actions" USING btree ("_parent_id");
  CREATE INDEX "_privacy_v_version_actions_link_link_service_idx" ON "_privacy_v_version_actions" USING btree ("link_service_id");
  CREATE UNIQUE INDEX "_privacy_v_version_actions_locales_locale_parent_id_unique" ON "_privacy_v_version_actions_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_privacy_v_version_actions_locales_parent_id_idx" ON "_privacy_v_version_actions_locales" USING btree ("_parent_id");
  CREATE INDEX "_privacy_v_version_seo_version_seo_image_idx" ON "_privacy_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_privacy_v_version_version__status_idx" ON "_privacy_v" USING btree ("version__status");
  CREATE INDEX "_privacy_v_created_at_idx" ON "_privacy_v" USING btree ("created_at");
  CREATE INDEX "_privacy_v_updated_at_idx" ON "_privacy_v" USING btree ("updated_at");
  CREATE INDEX "_privacy_v_snapshot_idx" ON "_privacy_v" USING btree ("snapshot");
  CREATE INDEX "_privacy_v_published_locale_idx" ON "_privacy_v" USING btree ("published_locale");
  CREATE INDEX "_privacy_v_latest_idx" ON "_privacy_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_privacy_v_locales_locale_parent_id_unique" ON "_privacy_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_privacy_v_locales_parent_id_idx" ON "_privacy_v_locales" USING btree ("_parent_id");
  CREATE INDEX "terms_actions_order_idx" ON "terms_actions" USING btree ("_order");
  CREATE INDEX "terms_actions_parent_id_idx" ON "terms_actions" USING btree ("_parent_id");
  CREATE INDEX "terms_actions_link_link_service_idx" ON "terms_actions" USING btree ("link_service_id");
  CREATE UNIQUE INDEX "terms_actions_locales_locale_parent_id_unique" ON "terms_actions_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "terms_actions_locales_parent_id_idx" ON "terms_actions_locales" USING btree ("_parent_id");
  CREATE INDEX "terms_seo_seo_image_idx" ON "terms" USING btree ("seo_image_id");
  CREATE INDEX "terms__status_idx" ON "terms" USING btree ("_status");
  CREATE UNIQUE INDEX "terms_locales_locale_parent_id_unique" ON "terms_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "terms_locales_parent_id_idx" ON "terms_locales" USING btree ("_parent_id");
  CREATE INDEX "_terms_v_version_actions_order_idx" ON "_terms_v_version_actions" USING btree ("_order");
  CREATE INDEX "_terms_v_version_actions_parent_id_idx" ON "_terms_v_version_actions" USING btree ("_parent_id");
  CREATE INDEX "_terms_v_version_actions_link_link_service_idx" ON "_terms_v_version_actions" USING btree ("link_service_id");
  CREATE UNIQUE INDEX "_terms_v_version_actions_locales_locale_parent_id_unique" ON "_terms_v_version_actions_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_terms_v_version_actions_locales_parent_id_idx" ON "_terms_v_version_actions_locales" USING btree ("_parent_id");
  CREATE INDEX "_terms_v_version_seo_version_seo_image_idx" ON "_terms_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_terms_v_version_version__status_idx" ON "_terms_v" USING btree ("version__status");
  CREATE INDEX "_terms_v_created_at_idx" ON "_terms_v" USING btree ("created_at");
  CREATE INDEX "_terms_v_updated_at_idx" ON "_terms_v" USING btree ("updated_at");
  CREATE INDEX "_terms_v_snapshot_idx" ON "_terms_v" USING btree ("snapshot");
  CREATE INDEX "_terms_v_published_locale_idx" ON "_terms_v" USING btree ("published_locale");
  CREATE INDEX "_terms_v_latest_idx" ON "_terms_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_terms_v_locales_locale_parent_id_unique" ON "_terms_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_terms_v_locales_parent_id_idx" ON "_terms_v_locales" USING btree ("_parent_id");
  CREATE INDEX "navbar_items_children_order_idx" ON "navbar_items_children" USING btree ("_order");
  CREATE INDEX "navbar_items_children_parent_id_idx" ON "navbar_items_children" USING btree ("_parent_id");
  CREATE INDEX "navbar_items_children_link_link_service_idx" ON "navbar_items_children" USING btree ("link_service_id");
  CREATE UNIQUE INDEX "navbar_items_children_locales_locale_parent_id_unique" ON "navbar_items_children_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "navbar_items_children_locales_parent_id_idx" ON "navbar_items_children_locales" USING btree ("_parent_id");
  CREATE INDEX "navbar_items_order_idx" ON "navbar_items" USING btree ("_order");
  CREATE INDEX "navbar_items_parent_id_idx" ON "navbar_items" USING btree ("_parent_id");
  CREATE INDEX "navbar_items_link_link_service_idx" ON "navbar_items" USING btree ("link_service_id");
  CREATE UNIQUE INDEX "navbar_items_locales_locale_parent_id_unique" ON "navbar_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "navbar_items_locales_parent_id_idx" ON "navbar_items_locales" USING btree ("_parent_id");
  CREATE INDEX "navbar_logo_idx" ON "navbar" USING btree ("logo_id");
  CREATE INDEX "navbar__status_idx" ON "navbar" USING btree ("_status");
  CREATE INDEX "_navbar_v_version_items_children_order_idx" ON "_navbar_v_version_items_children" USING btree ("_order");
  CREATE INDEX "_navbar_v_version_items_children_parent_id_idx" ON "_navbar_v_version_items_children" USING btree ("_parent_id");
  CREATE INDEX "_navbar_v_version_items_children_link_link_service_idx" ON "_navbar_v_version_items_children" USING btree ("link_service_id");
  CREATE UNIQUE INDEX "_navbar_v_version_items_children_locales_locale_parent_id_un" ON "_navbar_v_version_items_children_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_navbar_v_version_items_children_locales_parent_id_idx" ON "_navbar_v_version_items_children_locales" USING btree ("_parent_id");
  CREATE INDEX "_navbar_v_version_items_order_idx" ON "_navbar_v_version_items" USING btree ("_order");
  CREATE INDEX "_navbar_v_version_items_parent_id_idx" ON "_navbar_v_version_items" USING btree ("_parent_id");
  CREATE INDEX "_navbar_v_version_items_link_link_service_idx" ON "_navbar_v_version_items" USING btree ("link_service_id");
  CREATE UNIQUE INDEX "_navbar_v_version_items_locales_locale_parent_id_unique" ON "_navbar_v_version_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_navbar_v_version_items_locales_parent_id_idx" ON "_navbar_v_version_items_locales" USING btree ("_parent_id");
  CREATE INDEX "_navbar_v_version_version_logo_idx" ON "_navbar_v" USING btree ("version_logo_id");
  CREATE INDEX "_navbar_v_version_version__status_idx" ON "_navbar_v" USING btree ("version__status");
  CREATE INDEX "_navbar_v_created_at_idx" ON "_navbar_v" USING btree ("created_at");
  CREATE INDEX "_navbar_v_updated_at_idx" ON "_navbar_v" USING btree ("updated_at");
  CREATE INDEX "_navbar_v_snapshot_idx" ON "_navbar_v" USING btree ("snapshot");
  CREATE INDEX "_navbar_v_published_locale_idx" ON "_navbar_v" USING btree ("published_locale");
  CREATE INDEX "_navbar_v_latest_idx" ON "_navbar_v" USING btree ("latest");
  CREATE INDEX "footer_columns_links_order_idx" ON "footer_columns_links" USING btree ("_order");
  CREATE INDEX "footer_columns_links_parent_id_idx" ON "footer_columns_links" USING btree ("_parent_id");
  CREATE INDEX "footer_columns_links_link_link_service_idx" ON "footer_columns_links" USING btree ("link_service_id");
  CREATE UNIQUE INDEX "footer_columns_links_locales_locale_parent_id_unique" ON "footer_columns_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "footer_columns_links_locales_parent_id_idx" ON "footer_columns_links_locales" USING btree ("_parent_id");
  CREATE INDEX "footer_columns_order_idx" ON "footer_columns" USING btree ("_order");
  CREATE INDEX "footer_columns_parent_id_idx" ON "footer_columns" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "footer_columns_locales_locale_parent_id_unique" ON "footer_columns_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "footer_columns_locales_parent_id_idx" ON "footer_columns_locales" USING btree ("_parent_id");
  CREATE INDEX "footer_social_order_idx" ON "footer_social" USING btree ("_order");
  CREATE INDEX "footer_social_parent_id_idx" ON "footer_social" USING btree ("_parent_id");
  CREATE INDEX "footer_legal_links_order_idx" ON "footer_legal_links" USING btree ("_order");
  CREATE INDEX "footer_legal_links_parent_id_idx" ON "footer_legal_links" USING btree ("_parent_id");
  CREATE INDEX "footer_legal_links_link_link_service_idx" ON "footer_legal_links" USING btree ("link_service_id");
  CREATE UNIQUE INDEX "footer_legal_links_locales_locale_parent_id_unique" ON "footer_legal_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "footer_legal_links_locales_parent_id_idx" ON "footer_legal_links_locales" USING btree ("_parent_id");
  CREATE INDEX "footer_logo_idx" ON "footer" USING btree ("logo_id");
  CREATE INDEX "footer__status_idx" ON "footer" USING btree ("_status");
  CREATE UNIQUE INDEX "footer_locales_locale_parent_id_unique" ON "footer_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "footer_locales_parent_id_idx" ON "footer_locales" USING btree ("_parent_id");
  CREATE INDEX "_footer_v_version_columns_links_order_idx" ON "_footer_v_version_columns_links" USING btree ("_order");
  CREATE INDEX "_footer_v_version_columns_links_parent_id_idx" ON "_footer_v_version_columns_links" USING btree ("_parent_id");
  CREATE INDEX "_footer_v_version_columns_links_link_link_service_idx" ON "_footer_v_version_columns_links" USING btree ("link_service_id");
  CREATE UNIQUE INDEX "_footer_v_version_columns_links_locales_locale_parent_id_uni" ON "_footer_v_version_columns_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_footer_v_version_columns_links_locales_parent_id_idx" ON "_footer_v_version_columns_links_locales" USING btree ("_parent_id");
  CREATE INDEX "_footer_v_version_columns_order_idx" ON "_footer_v_version_columns" USING btree ("_order");
  CREATE INDEX "_footer_v_version_columns_parent_id_idx" ON "_footer_v_version_columns" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_footer_v_version_columns_locales_locale_parent_id_unique" ON "_footer_v_version_columns_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_footer_v_version_columns_locales_parent_id_idx" ON "_footer_v_version_columns_locales" USING btree ("_parent_id");
  CREATE INDEX "_footer_v_version_social_order_idx" ON "_footer_v_version_social" USING btree ("_order");
  CREATE INDEX "_footer_v_version_social_parent_id_idx" ON "_footer_v_version_social" USING btree ("_parent_id");
  CREATE INDEX "_footer_v_version_legal_links_order_idx" ON "_footer_v_version_legal_links" USING btree ("_order");
  CREATE INDEX "_footer_v_version_legal_links_parent_id_idx" ON "_footer_v_version_legal_links" USING btree ("_parent_id");
  CREATE INDEX "_footer_v_version_legal_links_link_link_service_idx" ON "_footer_v_version_legal_links" USING btree ("link_service_id");
  CREATE UNIQUE INDEX "_footer_v_version_legal_links_locales_locale_parent_id_uniqu" ON "_footer_v_version_legal_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_footer_v_version_legal_links_locales_parent_id_idx" ON "_footer_v_version_legal_links_locales" USING btree ("_parent_id");
  CREATE INDEX "_footer_v_version_version_logo_idx" ON "_footer_v" USING btree ("version_logo_id");
  CREATE INDEX "_footer_v_version_version__status_idx" ON "_footer_v" USING btree ("version__status");
  CREATE INDEX "_footer_v_created_at_idx" ON "_footer_v" USING btree ("created_at");
  CREATE INDEX "_footer_v_updated_at_idx" ON "_footer_v" USING btree ("updated_at");
  CREATE INDEX "_footer_v_snapshot_idx" ON "_footer_v" USING btree ("snapshot");
  CREATE INDEX "_footer_v_published_locale_idx" ON "_footer_v" USING btree ("published_locale");
  CREATE INDEX "_footer_v_latest_idx" ON "_footer_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_footer_v_locales_locale_parent_id_unique" ON "_footer_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_footer_v_locales_parent_id_idx" ON "_footer_v_locales" USING btree ("_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_services_id_idx" ON "payload_locked_documents_rels" USING btree ("services_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "services_key_points" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_version_key_points" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_actions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_actions_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_home_v_version_actions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_home_v_version_actions_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_home_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_home_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_overview_actions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_overview_actions_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_overview" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_overview_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_overview_v_version_actions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_overview_v_version_actions_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_overview_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_overview_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pricing_actions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pricing_actions_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pricing" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pricing_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pricing_v_version_actions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pricing_v_version_actions_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pricing_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pricing_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "about_actions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "about_actions_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "about" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "about_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_about_v_version_actions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_about_v_version_actions_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_about_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_about_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "how_it_works_actions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "how_it_works_actions_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "how_it_works" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "how_it_works_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_how_it_works_v_version_actions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_how_it_works_v_version_actions_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_how_it_works_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_how_it_works_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "faq_actions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "faq_actions_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "faq_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_faq_v_version_actions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_faq_v_version_actions_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_faq_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_faq_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "contact_actions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "contact_actions_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "contact" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "contact_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_contact_v_version_actions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_contact_v_version_actions_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_contact_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_contact_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "impressum_actions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "impressum_actions_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "impressum" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "impressum_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_impressum_v_version_actions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_impressum_v_version_actions_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_impressum_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_impressum_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "privacy_actions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "privacy_actions_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "privacy" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "privacy_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_privacy_v_version_actions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_privacy_v_version_actions_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_privacy_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_privacy_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "terms_actions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "terms_actions_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "terms" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "terms_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_terms_v_version_actions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_terms_v_version_actions_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_terms_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_terms_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "navbar_items_children" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "navbar_items_children_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "navbar_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "navbar_items_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "navbar" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_navbar_v_version_items_children" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_navbar_v_version_items_children_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_navbar_v_version_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_navbar_v_version_items_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_navbar_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer_columns_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer_columns_links_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer_columns_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer_social" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer_legal_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer_legal_links_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_footer_v_version_columns_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_footer_v_version_columns_links_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_footer_v_version_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_footer_v_version_columns_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_footer_v_version_social" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_footer_v_version_legal_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_footer_v_version_legal_links_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_footer_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_footer_v_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "services_key_points" CASCADE;
  DROP TABLE "services" CASCADE;
  DROP TABLE "services_locales" CASCADE;
  DROP TABLE "_services_v_version_key_points" CASCADE;
  DROP TABLE "_services_v" CASCADE;
  DROP TABLE "_services_v_locales" CASCADE;
  DROP TABLE "home_actions" CASCADE;
  DROP TABLE "home_actions_locales" CASCADE;
  DROP TABLE "home" CASCADE;
  DROP TABLE "home_locales" CASCADE;
  DROP TABLE "_home_v_version_actions" CASCADE;
  DROP TABLE "_home_v_version_actions_locales" CASCADE;
  DROP TABLE "_home_v" CASCADE;
  DROP TABLE "_home_v_locales" CASCADE;
  DROP TABLE "services_overview_actions" CASCADE;
  DROP TABLE "services_overview_actions_locales" CASCADE;
  DROP TABLE "services_overview" CASCADE;
  DROP TABLE "services_overview_locales" CASCADE;
  DROP TABLE "_services_overview_v_version_actions" CASCADE;
  DROP TABLE "_services_overview_v_version_actions_locales" CASCADE;
  DROP TABLE "_services_overview_v" CASCADE;
  DROP TABLE "_services_overview_v_locales" CASCADE;
  DROP TABLE "pricing_actions" CASCADE;
  DROP TABLE "pricing_actions_locales" CASCADE;
  DROP TABLE "pricing" CASCADE;
  DROP TABLE "pricing_locales" CASCADE;
  DROP TABLE "_pricing_v_version_actions" CASCADE;
  DROP TABLE "_pricing_v_version_actions_locales" CASCADE;
  DROP TABLE "_pricing_v" CASCADE;
  DROP TABLE "_pricing_v_locales" CASCADE;
  DROP TABLE "about_actions" CASCADE;
  DROP TABLE "about_actions_locales" CASCADE;
  DROP TABLE "about" CASCADE;
  DROP TABLE "about_locales" CASCADE;
  DROP TABLE "_about_v_version_actions" CASCADE;
  DROP TABLE "_about_v_version_actions_locales" CASCADE;
  DROP TABLE "_about_v" CASCADE;
  DROP TABLE "_about_v_locales" CASCADE;
  DROP TABLE "how_it_works_actions" CASCADE;
  DROP TABLE "how_it_works_actions_locales" CASCADE;
  DROP TABLE "how_it_works" CASCADE;
  DROP TABLE "how_it_works_locales" CASCADE;
  DROP TABLE "_how_it_works_v_version_actions" CASCADE;
  DROP TABLE "_how_it_works_v_version_actions_locales" CASCADE;
  DROP TABLE "_how_it_works_v" CASCADE;
  DROP TABLE "_how_it_works_v_locales" CASCADE;
  DROP TABLE "faq_actions" CASCADE;
  DROP TABLE "faq_actions_locales" CASCADE;
  DROP TABLE "faq" CASCADE;
  DROP TABLE "faq_locales" CASCADE;
  DROP TABLE "_faq_v_version_actions" CASCADE;
  DROP TABLE "_faq_v_version_actions_locales" CASCADE;
  DROP TABLE "_faq_v" CASCADE;
  DROP TABLE "_faq_v_locales" CASCADE;
  DROP TABLE "contact_actions" CASCADE;
  DROP TABLE "contact_actions_locales" CASCADE;
  DROP TABLE "contact" CASCADE;
  DROP TABLE "contact_locales" CASCADE;
  DROP TABLE "_contact_v_version_actions" CASCADE;
  DROP TABLE "_contact_v_version_actions_locales" CASCADE;
  DROP TABLE "_contact_v" CASCADE;
  DROP TABLE "_contact_v_locales" CASCADE;
  DROP TABLE "impressum_actions" CASCADE;
  DROP TABLE "impressum_actions_locales" CASCADE;
  DROP TABLE "impressum" CASCADE;
  DROP TABLE "impressum_locales" CASCADE;
  DROP TABLE "_impressum_v_version_actions" CASCADE;
  DROP TABLE "_impressum_v_version_actions_locales" CASCADE;
  DROP TABLE "_impressum_v" CASCADE;
  DROP TABLE "_impressum_v_locales" CASCADE;
  DROP TABLE "privacy_actions" CASCADE;
  DROP TABLE "privacy_actions_locales" CASCADE;
  DROP TABLE "privacy" CASCADE;
  DROP TABLE "privacy_locales" CASCADE;
  DROP TABLE "_privacy_v_version_actions" CASCADE;
  DROP TABLE "_privacy_v_version_actions_locales" CASCADE;
  DROP TABLE "_privacy_v" CASCADE;
  DROP TABLE "_privacy_v_locales" CASCADE;
  DROP TABLE "terms_actions" CASCADE;
  DROP TABLE "terms_actions_locales" CASCADE;
  DROP TABLE "terms" CASCADE;
  DROP TABLE "terms_locales" CASCADE;
  DROP TABLE "_terms_v_version_actions" CASCADE;
  DROP TABLE "_terms_v_version_actions_locales" CASCADE;
  DROP TABLE "_terms_v" CASCADE;
  DROP TABLE "_terms_v_locales" CASCADE;
  DROP TABLE "navbar_items_children" CASCADE;
  DROP TABLE "navbar_items_children_locales" CASCADE;
  DROP TABLE "navbar_items" CASCADE;
  DROP TABLE "navbar_items_locales" CASCADE;
  DROP TABLE "navbar" CASCADE;
  DROP TABLE "_navbar_v_version_items_children" CASCADE;
  DROP TABLE "_navbar_v_version_items_children_locales" CASCADE;
  DROP TABLE "_navbar_v_version_items" CASCADE;
  DROP TABLE "_navbar_v_version_items_locales" CASCADE;
  DROP TABLE "_navbar_v" CASCADE;
  DROP TABLE "footer_columns_links" CASCADE;
  DROP TABLE "footer_columns_links_locales" CASCADE;
  DROP TABLE "footer_columns" CASCADE;
  DROP TABLE "footer_columns_locales" CASCADE;
  DROP TABLE "footer_social" CASCADE;
  DROP TABLE "footer_legal_links" CASCADE;
  DROP TABLE "footer_legal_links_locales" CASCADE;
  DROP TABLE "footer" CASCADE;
  DROP TABLE "footer_locales" CASCADE;
  DROP TABLE "_footer_v_version_columns_links" CASCADE;
  DROP TABLE "_footer_v_version_columns_links_locales" CASCADE;
  DROP TABLE "_footer_v_version_columns" CASCADE;
  DROP TABLE "_footer_v_version_columns_locales" CASCADE;
  DROP TABLE "_footer_v_version_social" CASCADE;
  DROP TABLE "_footer_v_version_legal_links" CASCADE;
  DROP TABLE "_footer_v_version_legal_links_locales" CASCADE;
  DROP TABLE "_footer_v" CASCADE;
  DROP TABLE "_footer_v_locales" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_services_fk";
  
  DROP INDEX "payload_locked_documents_rels_services_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "services_id";
  DROP TYPE "public"."enum_services_status";
  DROP TYPE "public"."enum__services_v_version_status";
  DROP TYPE "public"."enum__services_v_published_locale";
  DROP TYPE "public"."enum_home_actions_appearance";
  DROP TYPE "public"."enum_home_actions_link_type";
  DROP TYPE "public"."enum_home_actions_link_page";
  DROP TYPE "public"."enum_home_status";
  DROP TYPE "public"."enum__home_v_version_actions_appearance";
  DROP TYPE "public"."enum__home_v_version_actions_link_type";
  DROP TYPE "public"."enum__home_v_version_actions_link_page";
  DROP TYPE "public"."enum__home_v_version_status";
  DROP TYPE "public"."enum__home_v_published_locale";
  DROP TYPE "public"."enum_services_overview_actions_appearance";
  DROP TYPE "public"."enum_services_overview_actions_link_type";
  DROP TYPE "public"."enum_services_overview_actions_link_page";
  DROP TYPE "public"."enum_services_overview_status";
  DROP TYPE "public"."enum__services_overview_v_version_actions_appearance";
  DROP TYPE "public"."enum__services_overview_v_version_actions_link_type";
  DROP TYPE "public"."enum__services_overview_v_version_actions_link_page";
  DROP TYPE "public"."enum__services_overview_v_version_status";
  DROP TYPE "public"."enum__services_overview_v_published_locale";
  DROP TYPE "public"."enum_pricing_actions_appearance";
  DROP TYPE "public"."enum_pricing_actions_link_type";
  DROP TYPE "public"."enum_pricing_actions_link_page";
  DROP TYPE "public"."enum_pricing_status";
  DROP TYPE "public"."enum__pricing_v_version_actions_appearance";
  DROP TYPE "public"."enum__pricing_v_version_actions_link_type";
  DROP TYPE "public"."enum__pricing_v_version_actions_link_page";
  DROP TYPE "public"."enum__pricing_v_version_status";
  DROP TYPE "public"."enum__pricing_v_published_locale";
  DROP TYPE "public"."enum_about_actions_appearance";
  DROP TYPE "public"."enum_about_actions_link_type";
  DROP TYPE "public"."enum_about_actions_link_page";
  DROP TYPE "public"."enum_about_status";
  DROP TYPE "public"."enum__about_v_version_actions_appearance";
  DROP TYPE "public"."enum__about_v_version_actions_link_type";
  DROP TYPE "public"."enum__about_v_version_actions_link_page";
  DROP TYPE "public"."enum__about_v_version_status";
  DROP TYPE "public"."enum__about_v_published_locale";
  DROP TYPE "public"."enum_how_it_works_actions_appearance";
  DROP TYPE "public"."enum_how_it_works_actions_link_type";
  DROP TYPE "public"."enum_how_it_works_actions_link_page";
  DROP TYPE "public"."enum_how_it_works_status";
  DROP TYPE "public"."enum__how_it_works_v_version_actions_appearance";
  DROP TYPE "public"."enum__how_it_works_v_version_actions_link_type";
  DROP TYPE "public"."enum__how_it_works_v_version_actions_link_page";
  DROP TYPE "public"."enum__how_it_works_v_version_status";
  DROP TYPE "public"."enum__how_it_works_v_published_locale";
  DROP TYPE "public"."enum_faq_actions_appearance";
  DROP TYPE "public"."enum_faq_actions_link_type";
  DROP TYPE "public"."enum_faq_actions_link_page";
  DROP TYPE "public"."enum_faq_status";
  DROP TYPE "public"."enum__faq_v_version_actions_appearance";
  DROP TYPE "public"."enum__faq_v_version_actions_link_type";
  DROP TYPE "public"."enum__faq_v_version_actions_link_page";
  DROP TYPE "public"."enum__faq_v_version_status";
  DROP TYPE "public"."enum__faq_v_published_locale";
  DROP TYPE "public"."enum_contact_actions_appearance";
  DROP TYPE "public"."enum_contact_actions_link_type";
  DROP TYPE "public"."enum_contact_actions_link_page";
  DROP TYPE "public"."enum_contact_status";
  DROP TYPE "public"."enum__contact_v_version_actions_appearance";
  DROP TYPE "public"."enum__contact_v_version_actions_link_type";
  DROP TYPE "public"."enum__contact_v_version_actions_link_page";
  DROP TYPE "public"."enum__contact_v_version_status";
  DROP TYPE "public"."enum__contact_v_published_locale";
  DROP TYPE "public"."enum_impressum_actions_appearance";
  DROP TYPE "public"."enum_impressum_actions_link_type";
  DROP TYPE "public"."enum_impressum_actions_link_page";
  DROP TYPE "public"."enum_impressum_status";
  DROP TYPE "public"."enum__impressum_v_version_actions_appearance";
  DROP TYPE "public"."enum__impressum_v_version_actions_link_type";
  DROP TYPE "public"."enum__impressum_v_version_actions_link_page";
  DROP TYPE "public"."enum__impressum_v_version_status";
  DROP TYPE "public"."enum__impressum_v_published_locale";
  DROP TYPE "public"."enum_privacy_actions_appearance";
  DROP TYPE "public"."enum_privacy_actions_link_type";
  DROP TYPE "public"."enum_privacy_actions_link_page";
  DROP TYPE "public"."enum_privacy_status";
  DROP TYPE "public"."enum__privacy_v_version_actions_appearance";
  DROP TYPE "public"."enum__privacy_v_version_actions_link_type";
  DROP TYPE "public"."enum__privacy_v_version_actions_link_page";
  DROP TYPE "public"."enum__privacy_v_version_status";
  DROP TYPE "public"."enum__privacy_v_published_locale";
  DROP TYPE "public"."enum_terms_actions_appearance";
  DROP TYPE "public"."enum_terms_actions_link_type";
  DROP TYPE "public"."enum_terms_actions_link_page";
  DROP TYPE "public"."enum_terms_status";
  DROP TYPE "public"."enum__terms_v_version_actions_appearance";
  DROP TYPE "public"."enum__terms_v_version_actions_link_type";
  DROP TYPE "public"."enum__terms_v_version_actions_link_page";
  DROP TYPE "public"."enum__terms_v_version_status";
  DROP TYPE "public"."enum__terms_v_published_locale";
  DROP TYPE "public"."enum_navbar_items_children_link_type";
  DROP TYPE "public"."enum_navbar_items_children_link_page";
  DROP TYPE "public"."enum_navbar_items_type";
  DROP TYPE "public"."enum_navbar_items_appearance";
  DROP TYPE "public"."enum_navbar_items_link_type";
  DROP TYPE "public"."enum_navbar_items_link_page";
  DROP TYPE "public"."enum_navbar_status";
  DROP TYPE "public"."enum__navbar_v_version_items_children_link_type";
  DROP TYPE "public"."enum__navbar_v_version_items_children_link_page";
  DROP TYPE "public"."enum__navbar_v_version_items_type";
  DROP TYPE "public"."enum__navbar_v_version_items_appearance";
  DROP TYPE "public"."enum__navbar_v_version_items_link_type";
  DROP TYPE "public"."enum__navbar_v_version_items_link_page";
  DROP TYPE "public"."enum__navbar_v_version_status";
  DROP TYPE "public"."enum__navbar_v_published_locale";
  DROP TYPE "public"."enum_footer_columns_links_link_type";
  DROP TYPE "public"."enum_footer_columns_links_link_page";
  DROP TYPE "public"."enum_footer_social_platform";
  DROP TYPE "public"."enum_footer_legal_links_link_type";
  DROP TYPE "public"."enum_footer_legal_links_link_page";
  DROP TYPE "public"."enum_footer_status";
  DROP TYPE "public"."enum__footer_v_version_columns_links_link_type";
  DROP TYPE "public"."enum__footer_v_version_columns_links_link_page";
  DROP TYPE "public"."enum__footer_v_version_social_platform";
  DROP TYPE "public"."enum__footer_v_version_legal_links_link_type";
  DROP TYPE "public"."enum__footer_v_version_legal_links_link_page";
  DROP TYPE "public"."enum__footer_v_version_status";
  DROP TYPE "public"."enum__footer_v_published_locale";`)
}
