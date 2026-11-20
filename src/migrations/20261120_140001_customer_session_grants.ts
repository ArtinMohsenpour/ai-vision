import { sql, type MigrateDownArgs, type MigrateUpArgs } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs) {
  await db.execute(sql`
    ALTER TABLE rheino_auth.customer_mfa ADD COLUMN credential_epoch uuid;

    CREATE TABLE rheino_auth.customer_session_grants (
      id varchar PRIMARY KEY,
      customer_id integer NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
      expires_at timestamptz NOT NULL
    );
    CREATE INDEX customer_session_grants_customer ON rheino_auth.customer_session_grants (customer_id);

    INSERT INTO rheino_auth.customer_session_grants (id, customer_id, expires_at)
    SELECT sessions.id, sessions._parent_id, sessions.expires_at
    FROM customers_sessions sessions JOIN customers ON customers.id = sessions._parent_id
    WHERE sessions.expires_at > clock_timestamp()
      AND customers._verified IS TRUE AND customers.suspended IS NOT TRUE;
  `)
}

export async function down({ db }: MigrateDownArgs) {
  await db.execute(sql`
    DROP TABLE rheino_auth.customer_session_grants;
    ALTER TABLE rheino_auth.customer_mfa DROP COLUMN credential_epoch;
  `)
}
