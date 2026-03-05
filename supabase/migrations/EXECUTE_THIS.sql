-- ============================================================================
-- COMBINED MIGRATIONS: 007, 008, 010 (CORRECTED)
-- Execute este bloco inteiro no Supabase SQL Editor
-- URL: https://supabase.com/dashboard/project/dtbrzojuopcyfgmaybzt/sql/new
-- ============================================================================

-- ============================================================================
-- MIGRATION 007: Create user_access Table Schema
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  access_type TEXT NOT NULL CHECK (access_type IN ('subscription', 'one_time')),
  payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT user_access_unique_active UNIQUE (user_id, access_type)
);

ALTER TABLE user_access ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access" ON user_access;
CREATE POLICY "Service role full access"
  ON user_access FOR ALL
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Users can read own access" ON user_access;
CREATE POLICY "Users can read own access"
  ON user_access FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================================
-- MIGRATION 008: Add Performance Indexes and Explicit Deny Policies
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_user_access_active
  ON user_access(user_id, is_active, expires_at);

CREATE INDEX IF NOT EXISTS idx_user_access_payment_id
  ON user_access(payment_id)
  WHERE payment_id IS NOT NULL;

DROP POLICY IF EXISTS "Users cannot update own access" ON user_access;
CREATE POLICY "Users cannot update own access"
  ON user_access FOR UPDATE
  USING (false);

DROP POLICY IF EXISTS "Users cannot delete own access" ON user_access;
CREATE POLICY "Users cannot delete own access"
  ON user_access FOR DELETE
  USING (false);

DROP POLICY IF EXISTS "Service role can update access" ON user_access;
CREATE POLICY "Service role can update access"
  ON user_access FOR UPDATE
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can delete access" ON user_access;
CREATE POLICY "Service role can delete access"
  ON user_access FOR DELETE
  USING (auth.role() = 'service_role');

DROP FUNCTION IF EXISTS update_user_access_updated_at() CASCADE;
CREATE FUNCTION update_user_access_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS user_access_updated_at ON user_access;
CREATE TRIGGER user_access_updated_at
  BEFORE UPDATE ON user_access
  FOR EACH ROW
  EXECUTE FUNCTION update_user_access_updated_at();

-- ============================================================================
-- MIGRATION 010: Create admin_audit_log table
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL CHECK (action IN (
    'grant_manual_access',
    'revoke_manual_access',
    'reactivate_manual_access',
    'revoke_payment_access',
    'reactivate_payment_access',
    'view_user_list',
    'export_user_data'
  )),
  target_user_id UUID,
  admin_user_id UUID NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  CONSTRAINT admin_user_required CHECK (admin_user_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_log_target_user
  ON admin_audit_log(target_user_id)
  WHERE target_user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_user
  ON admin_audit_log(admin_user_id);

CREATE INDEX IF NOT EXISTS idx_admin_audit_log_timestamp
  ON admin_audit_log(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_admin_audit_log_action
  ON admin_audit_log(action);

CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_timestamp
  ON admin_audit_log(admin_user_id, timestamp DESC);

ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role has full access to admin_audit_log" ON admin_audit_log;
CREATE POLICY "Service role has full access to admin_audit_log"
  ON admin_audit_log
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can read audit logs" ON admin_audit_log;
CREATE POLICY "Admins can read audit logs"
  ON admin_audit_log
  FOR SELECT
  TO authenticated
  USING (auth.jwt()->>'role' = 'admin');

GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON admin_audit_log TO service_role;
GRANT SELECT ON admin_audit_log TO authenticated;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify tables
SELECT 'user_access' as table_name, COUNT(*) as columns
FROM information_schema.columns
WHERE table_name = 'user_access';

SELECT 'admin_audit_log' as table_name, COUNT(*) as columns
FROM information_schema.columns
WHERE table_name = 'admin_audit_log';

-- Verify indexes
SELECT tablename, indexname
FROM pg_indexes
WHERE tablename IN ('user_access', 'admin_audit_log')
ORDER BY tablename, indexname;

-- Verify policies
SELECT tablename, policyname
FROM pg_policies
WHERE tablename IN ('user_access', 'admin_audit_log')
ORDER BY tablename, policyname;
