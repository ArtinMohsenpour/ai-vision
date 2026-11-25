import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_orders_manual_payments_method" AS ENUM('bank_transfer', 'other');
  CREATE TYPE "public"."enum_orders_payments_kind" AS ENUM('full', 'deposit', 'balance');
  CREATE TYPE "public"."enum_orders_payments_status" AS ENUM('open', 'pending', 'paid', 'failed', 'expired');
  CREATE TYPE "public"."enum_orders_status" AS ENUM('awaiting_payment', 'new', 'in_progress', 'delivered', 'completed', 'cancelled');
  CREATE TYPE "public"."enum_orders_payment_status" AS ENUM('unpaid', 'deposit_paid', 'paid', 'refunded', 'partially_refunded');
  CREATE TYPE "public"."enum_orders_locale" AS ENUM('de', 'en');
  CREATE TYPE "public"."enum__orders_v_version_manual_payments_method" AS ENUM('bank_transfer', 'other');
  CREATE TYPE "public"."enum__orders_v_version_payments_kind" AS ENUM('full', 'deposit', 'balance');
  CREATE TYPE "public"."enum__orders_v_version_payments_status" AS ENUM('open', 'pending', 'paid', 'failed', 'expired');
  CREATE TYPE "public"."enum__orders_v_version_status" AS ENUM('awaiting_payment', 'new', 'in_progress', 'delivered', 'completed', 'cancelled');
  CREATE TYPE "public"."enum__orders_v_version_payment_status" AS ENUM('unpaid', 'deposit_paid', 'paid', 'refunded', 'partially_refunded');
  CREATE TYPE "public"."enum__orders_v_version_locale" AS ENUM('de', 'en');
  CREATE TABLE "orders_manual_payments" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"amount" numeric,
  	"method" "enum_orders_manual_payments_method" DEFAULT 'bank_transfer' NOT NULL,
  	"date" timestamp(3) with time zone NOT NULL,
  	"note" varchar
  );
  
  CREATE TABLE "orders_snapshot_extras" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"extra_id" varchar,
  	"title" varchar,
  	"price" numeric,
  	"days" numeric
  );
  
  CREATE TABLE "orders_payments" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kind" "enum_orders_payments_kind" NOT NULL,
  	"status" "enum_orders_payments_status" NOT NULL,
  	"amount" numeric NOT NULL,
  	"refunded" numeric DEFAULT 0,
  	"checkout_session_id" varchar,
  	"checkout_url" varchar,
  	"expires_at" timestamp(3) with time zone,
  	"payment_intent_id" varchar,
  	"paid_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "orders" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"number" varchar,
  	"status" "enum_orders_status" DEFAULT 'awaiting_payment' NOT NULL,
  	"payment_status" "enum_orders_payment_status" DEFAULT 'unpaid',
  	"customer_id" integer NOT NULL,
  	"locale" "enum_orders_locale" DEFAULT 'de',
  	"amount_paid" numeric DEFAULT 0,
  	"balance_due" numeric DEFAULT 0,
  	"amount_refunded" numeric DEFAULT 0,
  	"balance_requested" boolean DEFAULT false,
  	"balance_requested_at" timestamp(3) with time zone,
  	"snapshot_service_id" numeric,
  	"snapshot_service_slug" varchar,
  	"snapshot_service_title" varchar,
  	"snapshot_base_name" varchar,
  	"snapshot_base_price" numeric,
  	"snapshot_base_days" numeric,
  	"snapshot_subtotal" numeric,
  	"snapshot_vat_rate" numeric,
  	"snapshot_vat" numeric,
  	"snapshot_total" numeric NOT NULL,
  	"snapshot_deposit_percent" numeric,
  	"snapshot_deposit_net" numeric,
  	"snapshot_delivery_days" numeric,
  	"billing_name" varchar,
  	"billing_company" varchar,
  	"billing_line1" varchar,
  	"billing_line2" varchar,
  	"billing_postal_code" varchar,
  	"billing_city" varchar,
  	"billing_country" varchar,
  	"billing_vat_id" varchar,
  	"terms_accepted_at" timestamp(3) with time zone,
  	"admin_notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_orders_v_version_manual_payments" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"amount" numeric,
  	"method" "enum__orders_v_version_manual_payments_method" DEFAULT 'bank_transfer' NOT NULL,
  	"date" timestamp(3) with time zone NOT NULL,
  	"note" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_orders_v_version_snapshot_extras" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"extra_id" varchar,
  	"title" varchar,
  	"price" numeric,
  	"days" numeric,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_orders_v_version_payments" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"kind" "enum__orders_v_version_payments_kind" NOT NULL,
  	"status" "enum__orders_v_version_payments_status" NOT NULL,
  	"amount" numeric NOT NULL,
  	"refunded" numeric DEFAULT 0,
  	"checkout_session_id" varchar,
  	"checkout_url" varchar,
  	"expires_at" timestamp(3) with time zone,
  	"payment_intent_id" varchar,
  	"paid_at" timestamp(3) with time zone,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_orders_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_number" varchar,
  	"version_status" "enum__orders_v_version_status" DEFAULT 'awaiting_payment' NOT NULL,
  	"version_payment_status" "enum__orders_v_version_payment_status" DEFAULT 'unpaid',
  	"version_customer_id" integer NOT NULL,
  	"version_locale" "enum__orders_v_version_locale" DEFAULT 'de',
  	"version_amount_paid" numeric DEFAULT 0,
  	"version_balance_due" numeric DEFAULT 0,
  	"version_amount_refunded" numeric DEFAULT 0,
  	"version_balance_requested" boolean DEFAULT false,
  	"version_balance_requested_at" timestamp(3) with time zone,
  	"version_snapshot_service_id" numeric,
  	"version_snapshot_service_slug" varchar,
  	"version_snapshot_service_title" varchar,
  	"version_snapshot_base_name" varchar,
  	"version_snapshot_base_price" numeric,
  	"version_snapshot_base_days" numeric,
  	"version_snapshot_subtotal" numeric,
  	"version_snapshot_vat_rate" numeric,
  	"version_snapshot_vat" numeric,
  	"version_snapshot_total" numeric NOT NULL,
  	"version_snapshot_deposit_percent" numeric,
  	"version_snapshot_deposit_net" numeric,
  	"version_snapshot_delivery_days" numeric,
  	"version_billing_name" varchar,
  	"version_billing_company" varchar,
  	"version_billing_line1" varchar,
  	"version_billing_line2" varchar,
  	"version_billing_postal_code" varchar,
  	"version_billing_city" varchar,
  	"version_billing_country" varchar,
  	"version_billing_vat_id" varchar,
  	"version_terms_accepted_at" timestamp(3) with time zone,
  	"version_admin_notes" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "stripe_events" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"event_id" varchar NOT NULL,
  	"type" varchar NOT NULL,
  	"processed_at" timestamp(3) with time zone NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "orders_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "stripe_events_id" integer;
  ALTER TABLE "orders_manual_payments" ADD CONSTRAINT "orders_manual_payments_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "orders_snapshot_extras" ADD CONSTRAINT "orders_snapshot_extras_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "orders_payments" ADD CONSTRAINT "orders_payments_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_orders_v_version_manual_payments" ADD CONSTRAINT "_orders_v_version_manual_payments_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_orders_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_orders_v_version_snapshot_extras" ADD CONSTRAINT "_orders_v_version_snapshot_extras_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_orders_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_orders_v_version_payments" ADD CONSTRAINT "_orders_v_version_payments_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_orders_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_orders_v" ADD CONSTRAINT "_orders_v_parent_id_orders_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_orders_v" ADD CONSTRAINT "_orders_v_version_customer_id_customers_id_fk" FOREIGN KEY ("version_customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "orders_manual_payments_order_idx" ON "orders_manual_payments" USING btree ("_order");
  CREATE INDEX "orders_manual_payments_parent_id_idx" ON "orders_manual_payments" USING btree ("_parent_id");
  CREATE INDEX "orders_snapshot_extras_order_idx" ON "orders_snapshot_extras" USING btree ("_order");
  CREATE INDEX "orders_snapshot_extras_parent_id_idx" ON "orders_snapshot_extras" USING btree ("_parent_id");
  CREATE INDEX "orders_payments_order_idx" ON "orders_payments" USING btree ("_order");
  CREATE INDEX "orders_payments_parent_id_idx" ON "orders_payments" USING btree ("_parent_id");
  CREATE INDEX "orders_payments_checkout_session_id_idx" ON "orders_payments" USING btree ("checkout_session_id");
  CREATE INDEX "orders_payments_payment_intent_id_idx" ON "orders_payments" USING btree ("payment_intent_id");
  CREATE UNIQUE INDEX "orders_number_idx" ON "orders" USING btree ("number");
  CREATE INDEX "orders_customer_idx" ON "orders" USING btree ("customer_id");
  CREATE INDEX "orders_updated_at_idx" ON "orders" USING btree ("updated_at");
  CREATE INDEX "orders_created_at_idx" ON "orders" USING btree ("created_at");
  CREATE INDEX "_orders_v_version_manual_payments_order_idx" ON "_orders_v_version_manual_payments" USING btree ("_order");
  CREATE INDEX "_orders_v_version_manual_payments_parent_id_idx" ON "_orders_v_version_manual_payments" USING btree ("_parent_id");
  CREATE INDEX "_orders_v_version_snapshot_extras_order_idx" ON "_orders_v_version_snapshot_extras" USING btree ("_order");
  CREATE INDEX "_orders_v_version_snapshot_extras_parent_id_idx" ON "_orders_v_version_snapshot_extras" USING btree ("_parent_id");
  CREATE INDEX "_orders_v_version_payments_order_idx" ON "_orders_v_version_payments" USING btree ("_order");
  CREATE INDEX "_orders_v_version_payments_parent_id_idx" ON "_orders_v_version_payments" USING btree ("_parent_id");
  CREATE INDEX "_orders_v_version_payments_checkout_session_id_idx" ON "_orders_v_version_payments" USING btree ("checkout_session_id");
  CREATE INDEX "_orders_v_version_payments_payment_intent_id_idx" ON "_orders_v_version_payments" USING btree ("payment_intent_id");
  CREATE INDEX "_orders_v_parent_idx" ON "_orders_v" USING btree ("parent_id");
  CREATE INDEX "_orders_v_version_version_number_idx" ON "_orders_v" USING btree ("version_number");
  CREATE INDEX "_orders_v_version_version_customer_idx" ON "_orders_v" USING btree ("version_customer_id");
  CREATE INDEX "_orders_v_version_version_updated_at_idx" ON "_orders_v" USING btree ("version_updated_at");
  CREATE INDEX "_orders_v_version_version_created_at_idx" ON "_orders_v" USING btree ("version_created_at");
  CREATE INDEX "_orders_v_created_at_idx" ON "_orders_v" USING btree ("created_at");
  CREATE INDEX "_orders_v_updated_at_idx" ON "_orders_v" USING btree ("updated_at");
  CREATE UNIQUE INDEX "stripe_events_event_id_idx" ON "stripe_events" USING btree ("event_id");
  CREATE INDEX "stripe_events_updated_at_idx" ON "stripe_events" USING btree ("updated_at");
  CREATE INDEX "stripe_events_created_at_idx" ON "stripe_events" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_orders_fk" FOREIGN KEY ("orders_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_stripe_events_fk" FOREIGN KEY ("stripe_events_id") REFERENCES "public"."stripe_events"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_orders_id_idx" ON "payload_locked_documents_rels" USING btree ("orders_id");
  CREATE INDEX "payload_locked_documents_rels_stripe_events_id_idx" ON "payload_locked_documents_rels" USING btree ("stripe_events_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "orders_manual_payments" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "orders_snapshot_extras" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "orders_payments" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "orders" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_orders_v_version_manual_payments" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_orders_v_version_snapshot_extras" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_orders_v_version_payments" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_orders_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "stripe_events" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "orders_manual_payments" CASCADE;
  DROP TABLE "orders_snapshot_extras" CASCADE;
  DROP TABLE "orders_payments" CASCADE;
  DROP TABLE "orders" CASCADE;
  DROP TABLE "_orders_v_version_manual_payments" CASCADE;
  DROP TABLE "_orders_v_version_snapshot_extras" CASCADE;
  DROP TABLE "_orders_v_version_payments" CASCADE;
  DROP TABLE "_orders_v" CASCADE;
  DROP TABLE "stripe_events" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_orders_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_stripe_events_fk";
  
  DROP INDEX "payload_locked_documents_rels_orders_id_idx";
  DROP INDEX "payload_locked_documents_rels_stripe_events_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "orders_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "stripe_events_id";
  DROP TYPE "public"."enum_orders_manual_payments_method";
  DROP TYPE "public"."enum_orders_payments_kind";
  DROP TYPE "public"."enum_orders_payments_status";
  DROP TYPE "public"."enum_orders_status";
  DROP TYPE "public"."enum_orders_payment_status";
  DROP TYPE "public"."enum_orders_locale";
  DROP TYPE "public"."enum__orders_v_version_manual_payments_method";
  DROP TYPE "public"."enum__orders_v_version_payments_kind";
  DROP TYPE "public"."enum__orders_v_version_payments_status";
  DROP TYPE "public"."enum__orders_v_version_status";
  DROP TYPE "public"."enum__orders_v_version_payment_status";
  DROP TYPE "public"."enum__orders_v_version_locale";`)
}
