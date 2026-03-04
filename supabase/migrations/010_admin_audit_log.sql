-- Migration 010: Create admin_audit_log table
-- Stores comprehensive audit trail of all admin operations
-- Essential for compliance, security, and accountability

-- Create admin_audit_log table
CREATE TABLE IF NOT EXISTS admin_audit_log (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Action performed
  action TEXT NOT NULL CHECK (action IN (
    'grant_manual_access',
    'revoke_manual_access',
    'reactivate_manual_access',
    'revoke_payment_access',
    'reactivate_payment_access',
    'view_user_list',
    'export_user_data'
  )),

  -- Target user (the user being acted upon)
  target_user_id UUID,

  -- Admin user (who performed the action)
  admin_user_id UUID NOT NULL,

  -- When the action occurred
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Additional context (reason, expiration, etc.)
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Constraints
  CONSTRAINT admin_user_required CHECK (admin_user_id IS NOT NULL)
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_target_user
  ON admin_audit_log(target_user_id)
  WHERE target_user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_user
  ON admin_audit_log(admin_user_id);

CREATE INDEX IF NOT EXISTS idx_admin_audit_log_timestamp
  ON admin_audit_log(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_admin_audit_log_action
  ON admin_audit_log(action);

-- Composite index for recent activity by admin
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_timestamp
  ON admin_audit_log(admin_user_id, timestamp DESC);

-- Create RLS policies
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (bypasses RLS)
CREATE POLICY "Service role has full access to admin_audit_log"
  ON admin_audit_log
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Admins can read audit logs but not insert (inserts done via service role)
CREATE POLICY "Admins can read audit logs"
  ON admin_audit_log
  FOR SELECT
  TO authenticated
  USING (
    -- Admin users can read all audit logs
    auth.jwt()->>'role' = 'admin'
  );

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON admin_audit_log TO service_role;

GRANT SELECT ON admin_audit_log TO authenticated;

-- Add comment for documentation
COMMENT ON TABLE admin_audit_log IS 'Audit trail of all admin operations for compliance and security';
COMMENT ON COLUMN admin_audit_log.action IS 'Type of action performed (grant_manual_access, revoke_manual_access, etc.)';
COMMENT ON COLUMN admin_audit_log.target_user_id IS 'User ID of the user being acted upon (null for system-wide actions)';
COMMENT ON COLUMN admin_audit_log.admin_user_id IS 'User ID of the admin who performed the action';
COMMENT ON COLUMN admin_audit_log.timestamp IS 'When the action occurred';
COMMENT ON COLUMN admin_audit_log.metadata IS 'Additional context (reason, expiration, access_id, etc.)';
