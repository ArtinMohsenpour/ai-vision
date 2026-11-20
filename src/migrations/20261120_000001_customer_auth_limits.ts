import { sql, type MigrateDownArgs, type MigrateUpArgs } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs) {
  // Keep this table outside the schema managed by Payload's collection generator.
  await db.execute(sql`
    CREATE SCHEMA rheino_auth;
    CREATE TABLE rheino_auth.rate_limits (
      bucket text PRIMARY KEY,
      attempts integer NOT NULL,
      expires_at timestamptz NOT NULL
    );
    CREATE INDEX rate_limits_expiry ON rheino_auth.rate_limits (expires_at);
  `)
}

export async function down({ db }: MigrateDownArgs) {
  await db.execute(sql`
    DROP TABLE rheino_auth.rate_limits;
    DROP SCHEMA rheino_auth;
  `)
}
