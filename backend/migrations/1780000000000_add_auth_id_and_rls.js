export const shorthands = undefined;

export const up = (pgm) => {
  pgm.sql(`CREATE SCHEMA IF NOT EXISTS auth;`);
  pgm.sql(`
    CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
      SELECT COALESCE(
        NULLIF(current_setting('request.jwt.claims', true)::json->>'sub', '')::uuid,
        '00000000-0000-0000-0000-000000000000'::uuid
      );
    $$;
  `);
  pgm.sql(`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS auth_id UUID;`);
  pgm.sql(`CREATE INDEX IF NOT EXISTS idx_usuarios_auth_id ON usuarios (auth_id);`);
  pgm.sql(`ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;`);
  pgm.sql(`DROP POLICY IF EXISTS usuarios_select_own ON usuarios;`);
  pgm.sql(`CREATE POLICY usuarios_select_own ON usuarios FOR SELECT USING (auth.uid() = auth_id);`);
  pgm.sql(`DROP POLICY IF EXISTS usuarios_insert_own ON usuarios;`);
  pgm.sql(`CREATE POLICY usuarios_insert_own ON usuarios FOR INSERT WITH CHECK (auth.uid() = auth_id);`);
  pgm.sql(`DROP POLICY IF EXISTS usuarios_update_own ON usuarios;`);
  pgm.sql(`CREATE POLICY usuarios_update_own ON usuarios FOR UPDATE USING (auth.uid() = auth_id) WITH CHECK (auth.uid() = auth_id);`);
};

export const down = (pgm) => {
  pgm.sql(`DROP POLICY IF EXISTS usuarios_select_own ON usuarios;`);
  pgm.sql(`DROP POLICY IF EXISTS usuarios_insert_own ON usuarios;`);
  pgm.sql(`DROP POLICY IF EXISTS usuarios_update_own ON usuarios;`);
  pgm.sql(`ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;`);
  pgm.sql(`DROP INDEX IF EXISTS idx_usuarios_auth_id;`);
  pgm.sql(`ALTER TABLE usuarios DROP COLUMN IF EXISTS auth_id;`);
};
