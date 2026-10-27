import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_customer_identities_provider" AS ENUM('google', 'yandex', 'telegram', 'vk');
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    DO $$ BEGIN
      CREATE TYPE "public"."enum__customer_identities_v_version_provider" AS ENUM('google', 'yandex', 'telegram', 'vk');
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "email_verified_at" timestamp(3) with time zone;
    ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "social_only" boolean DEFAULT false;
    ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "registration_completed_at" timestamp(3) with time zone;

    ALTER TABLE "_customers_v" ADD COLUMN IF NOT EXISTS "version_email_verified_at" timestamp(3) with time zone;
    ALTER TABLE "_customers_v" ADD COLUMN IF NOT EXISTS "version_social_only" boolean DEFAULT false;
    ALTER TABLE "_customers_v" ADD COLUMN IF NOT EXISTS "version_registration_completed_at" timestamp(3) with time zone;

    CREATE TABLE IF NOT EXISTS "customer_identities" (
      "id" serial PRIMARY KEY NOT NULL,
      "customer_id" integer NOT NULL,
      "provider" "enum_customer_identities_provider" NOT NULL,
      "provider_id" varchar NOT NULL,
      "email" varchar,
      "email_verified" boolean DEFAULT false,
      "linked_at" timestamp(3) with time zone,
      "last_login_at" timestamp(3) with time zone,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "customer_identities_rels" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer,
      "parent_id" integer NOT NULL,
      "path" varchar NOT NULL,
      "admins_id" integer,
      "customers_id" integer
    );

    CREATE TABLE IF NOT EXISTS "_customer_identities_v" (
      "id" serial PRIMARY KEY NOT NULL,
      "parent_id" integer,
      "version_customer_id" integer NOT NULL,
      "version_provider" "enum__customer_identities_v_version_provider" NOT NULL,
      "version_provider_id" varchar NOT NULL,
      "version_email" varchar,
      "version_email_verified" boolean DEFAULT false,
      "version_linked_at" timestamp(3) with time zone,
      "version_last_login_at" timestamp(3) with time zone,
      "version_updated_at" timestamp(3) with time zone,
      "version_created_at" timestamp(3) with time zone,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "_customer_identities_v_rels" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer,
      "parent_id" integer NOT NULL,
      "path" varchar NOT NULL,
      "admins_id" integer,
      "customers_id" integer
    );

    CREATE TABLE IF NOT EXISTS "customer_identity_conflicts" (
      "id" serial PRIMARY KEY NOT NULL,
      "provider" varchar NOT NULL,
      "provider_id" varchar NOT NULL,
      "customer_id" integer,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "customer_identities_id" integer;

    DO $$ BEGIN
      ALTER TABLE "customer_identities" ADD CONSTRAINT "customer_identities_customer_id_customers_id_fk"
        FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    DO $$ BEGIN
      ALTER TABLE "customer_identities_rels" ADD CONSTRAINT "customer_identities_rels_parent_fk"
        FOREIGN KEY ("parent_id") REFERENCES "public"."customer_identities"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    DO $$ BEGIN
      ALTER TABLE "customer_identities_rels" ADD CONSTRAINT "customer_identities_rels_admins_fk"
        FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    DO $$ BEGIN
      ALTER TABLE "customer_identities_rels" ADD CONSTRAINT "customer_identities_rels_customers_fk"
        FOREIGN KEY ("customers_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    DO $$ BEGIN
      ALTER TABLE "_customer_identities_v" ADD CONSTRAINT "_customer_identities_v_parent_id_customer_identities_id_fk"
        FOREIGN KEY ("parent_id") REFERENCES "public"."customer_identities"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    DO $$ BEGIN
      ALTER TABLE "_customer_identities_v" ADD CONSTRAINT "_customer_identities_v_version_customer_id_customers_id_fk"
        FOREIGN KEY ("version_customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    DO $$ BEGIN
      ALTER TABLE "_customer_identities_v_rels" ADD CONSTRAINT "_customer_identities_v_rels_parent_fk"
        FOREIGN KEY ("parent_id") REFERENCES "public"."_customer_identities_v"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    DO $$ BEGIN
      ALTER TABLE "_customer_identities_v_rels" ADD CONSTRAINT "_customer_identities_v_rels_admins_fk"
        FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    DO $$ BEGIN
      ALTER TABLE "_customer_identities_v_rels" ADD CONSTRAINT "_customer_identities_v_rels_customers_fk"
        FOREIGN KEY ("customers_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_customer_identities_fk"
        FOREIGN KEY ("customer_identities_id") REFERENCES "public"."customer_identities"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    CREATE INDEX IF NOT EXISTS "customer_identities_customer_idx" ON "customer_identities" USING btree ("customer_id");
    CREATE INDEX IF NOT EXISTS "customer_identities_provider_idx" ON "customer_identities" USING btree ("provider");
    CREATE INDEX IF NOT EXISTS "customer_identities_provider_id_idx" ON "customer_identities" USING btree ("provider_id");
    CREATE INDEX IF NOT EXISTS "customer_identities_updated_at_idx" ON "customer_identities" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "customer_identities_created_at_idx" ON "customer_identities" USING btree ("created_at");
    CREATE UNIQUE INDEX IF NOT EXISTS "provider_providerId_idx" ON "customer_identities" USING btree ("provider", "provider_id");

    CREATE INDEX IF NOT EXISTS "customer_identities_rels_order_idx" ON "customer_identities_rels" USING btree ("order");
    CREATE INDEX IF NOT EXISTS "customer_identities_rels_parent_idx" ON "customer_identities_rels" USING btree ("parent_id");
    CREATE INDEX IF NOT EXISTS "customer_identities_rels_path_idx" ON "customer_identities_rels" USING btree ("path");
    CREATE INDEX IF NOT EXISTS "customer_identities_rels_admins_id_idx" ON "customer_identities_rels" USING btree ("admins_id");
    CREATE INDEX IF NOT EXISTS "customer_identities_rels_customers_id_idx" ON "customer_identities_rels" USING btree ("customers_id");

    CREATE INDEX IF NOT EXISTS "_customer_identities_v_parent_idx" ON "_customer_identities_v" USING btree ("parent_id");
    CREATE INDEX IF NOT EXISTS "_customer_identities_v_version_version_provider_idx" ON "_customer_identities_v" USING btree ("version_provider");
    CREATE INDEX IF NOT EXISTS "_customer_identities_v_version_version_provider_id_idx" ON "_customer_identities_v" USING btree ("version_provider_id");
    CREATE INDEX IF NOT EXISTS "_customer_identities_v_version_version_customer_idx" ON "_customer_identities_v" USING btree ("version_customer_id");
    CREATE INDEX IF NOT EXISTS "_customer_identities_v_version_version_created_at_idx" ON "_customer_identities_v" USING btree ("version_created_at");
    CREATE INDEX IF NOT EXISTS "_customer_identities_v_version_version_updated_at_idx" ON "_customer_identities_v" USING btree ("version_updated_at");
    CREATE INDEX IF NOT EXISTS "_customer_identities_v_created_at_idx" ON "_customer_identities_v" USING btree ("created_at");
    CREATE INDEX IF NOT EXISTS "_customer_identities_v_updated_at_idx" ON "_customer_identities_v" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "version_provider_version_providerId_idx" ON "_customer_identities_v" USING btree ("version_provider", "version_provider_id");

    CREATE INDEX IF NOT EXISTS "_customer_identities_v_rels_order_idx" ON "_customer_identities_v_rels" USING btree ("order");
    CREATE INDEX IF NOT EXISTS "_customer_identities_v_rels_parent_idx" ON "_customer_identities_v_rels" USING btree ("parent_id");
    CREATE INDEX IF NOT EXISTS "_customer_identities_v_rels_path_idx" ON "_customer_identities_v_rels" USING btree ("path");
    CREATE INDEX IF NOT EXISTS "_customer_identities_v_rels_admins_id_idx" ON "_customer_identities_v_rels" USING btree ("admins_id");
    CREATE INDEX IF NOT EXISTS "_customer_identities_v_rels_customers_id_idx" ON "_customer_identities_v_rels" USING btree ("customers_id");

    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_customer_identities_id_idx" ON "payload_locked_documents_rels" USING btree ("customer_identities_id");

    CREATE INDEX IF NOT EXISTS "customer_identity_conflicts_provider_idx" ON "customer_identity_conflicts" USING btree ("provider", "provider_id");

    INSERT INTO "customer_identities" (
      "customer_id",
      "provider",
      "provider_id",
      "email_verified",
      "linked_at",
      "last_login_at",
      "created_at",
      "updated_at"
    )
    SELECT
      ca."_parent_id",
      ca."provider"::text::"enum_customer_identities_provider",
      ca."provider_id",
      false,
      now(),
      now(),
      now(),
      now()
    FROM "customers_accounts" ca
    ON CONFLICT ("provider", "provider_id") DO NOTHING;

    INSERT INTO "customer_identity_conflicts" ("provider", "provider_id", "customer_id")
    SELECT
      ca."provider"::text,
      ca."provider_id",
      ca."_parent_id"
    FROM "customers_accounts" ca
    JOIN "customer_identities" ci
      ON ci."provider"::text = ca."provider"::text
      AND ci."provider_id" = ca."provider_id"
    WHERE ci."customer_id" <> ca."_parent_id";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "customer_identity_conflicts" CASCADE;
    DROP TABLE IF EXISTS "_customer_identities_v_rels" CASCADE;
    DROP TABLE IF EXISTS "_customer_identities_v" CASCADE;
    DROP TABLE IF EXISTS "customer_identities_rels" CASCADE;
    DROP TABLE IF EXISTS "customer_identities" CASCADE;

    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "customer_identities_id";
    ALTER TABLE "_customers_v" DROP COLUMN IF EXISTS "version_email_verified_at";
    ALTER TABLE "_customers_v" DROP COLUMN IF EXISTS "version_social_only";
    ALTER TABLE "_customers_v" DROP COLUMN IF EXISTS "version_registration_completed_at";
    ALTER TABLE "customers" DROP COLUMN IF EXISTS "email_verified_at";
    ALTER TABLE "customers" DROP COLUMN IF EXISTS "social_only";
    ALTER TABLE "customers" DROP COLUMN IF EXISTS "registration_completed_at";

    DROP TYPE IF EXISTS "public"."enum__customer_identities_v_version_provider";
    DROP TYPE IF EXISTS "public"."enum_customer_identities_provider";
  `)
}
