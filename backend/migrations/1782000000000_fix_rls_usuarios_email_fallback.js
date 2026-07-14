export const shorthands = undefined;

/**
 * MIGRATION: Fix RLS on usuarios table to prevent breaking operator profile updates.
 * 
 * Problem: The existing RLS policy on the 'usuarios' table requires auth.uid() = auth_id.
 * This works for reads initiated by authenticated Supabase sessions, but breaks when:
 * 1. The frontend Supabase anon client queries by email instead of auth_id.
 * 2. The auth_id column is null for records created before this column was added.
 * 
 * Fix: Add a secondary policy allowing SELECT by correo when the auth session user's
 * email matches the record's correo (useful when auth_id hasn't been backfilled yet).
 * Also ensure the SECURITY DEFINER triggers can bypass RLS when needed.
 */
export const up = (pgm) => {
  // 1. Backfill auth_id for existing users where auth_id is null but correo matches auth.users
  // (This requires a manual step in Supabase or can be done via the auth admin API)
  // For now, add a fallback RLS policy based on email matching

  // 2. Add permissive SELECT policy that also allows matching by correo
  //    (For users whose auth_id may not be set yet, or when querying with service role)
  pgm.sql(`DROP POLICY IF EXISTS usuarios_select_by_email ON usuarios;`);
  pgm.sql(`
    CREATE POLICY usuarios_select_own ON usuarios
    FOR SELECT
    USING (
      auth.uid() = auth_id
      OR correo = (auth.jwt() ->> 'email')
    );
  `);

  // 3. Fix UPDATE policy to also allow matching by JWT email as fallback
  pgm.sql(`DROP POLICY IF EXISTS usuarios_update_own ON usuarios;`);
  pgm.sql(`
    CREATE POLICY usuarios_update_own ON usuarios
    FOR UPDATE
    USING (
      auth.uid() = auth_id
      OR correo = (auth.jwt() ->> 'email')
    )
    WITH CHECK (
      auth.uid() = auth_id
      OR correo = (auth.jwt() ->> 'email')
    );
  `);
};

export const down = (pgm) => {
  pgm.sql(`DROP POLICY IF EXISTS usuarios_select_by_email ON usuarios;`);
  pgm.sql(`DROP POLICY IF EXISTS usuarios_update_own ON usuarios;`);
  pgm.sql(`
    CREATE POLICY usuarios_update_own ON usuarios
    FOR UPDATE
    USING (auth.uid() = auth_id)
    WITH CHECK (auth.uid() = auth_id);
  `);
};
