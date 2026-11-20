import { sql, type MigrateDownArgs, type MigrateUpArgs } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs) {
  // Keep authenticator material outside collections served by Payload.
  await db.execute(sql`
    CREATE TABLE rheino_auth.customer_mfa (
      customer_id integer PRIMARY KEY REFERENCES customers(id) ON DELETE CASCADE,
      secret text,
      last_step bigint,
      recovery_hashes text[] NOT NULL DEFAULT '{}',
      pending_secret text,
      pending_session_id varchar,
      pending_expires_at timestamptz
    );
  `)
}

export async function down({ db }: MigrateDownArgs) {
  await db.execute(sql`DROP TABLE rheino_auth.customer_mfa`)
}
