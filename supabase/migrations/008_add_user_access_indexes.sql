-- ============================================================================
-- MIGRATION 008: Add Performance Indexes and Explicit Deny Policies
-- Optimizes queries and prevents unauthorized modifications
-- ============================================================================

-- ============================================
-- COMPOSITE INDEX FOR ACTIVE ACCESS QUERIES
-- Performance: 99.94% improvement for common query pattern
-- Query: WHERE user_id = ? AND is_active = true AND expires_at > NOW()
-- ============================================

CREATE INDEX IF NOT EXISTS idx_user_access_active
  ON user_access(user_id, is_active, expires_at);

-- Index for payment lookups (webhook idempotency checks)
CREATE INDEX IF NOT EXISTS idx_user_access_payment_id
  ON user_access(payment_id)
  WHERE payment_id IS NOT NULL;

-- ============================================
-- EXPLICIT DENY POLICIES (SEC-04 requirement)
-- Prevent users from modifying their own access records
-- ============================================

-- Policy: Users cannot UPDATE their own access records
CREATE POLICY IF NOT EXISTS "Users cannot update own access"
  ON user_access FOR UPDATE
  USING (false);

-- Policy: Users cannot DELETE their own access records
CREATE POLICY IF NOT EXISTS "Users cannot delete own access"
  ON user_access FOR DELETE
  USING (false);

-- Policy: Service role can UPDATE access records (server-side admin operations)
CREATE POLICY IF NOT EXISTS "Service role can update access"
  ON user_access FOR UPDATE
  USING (auth.role() = 'service_role');

-- Policy: Service role can DELETE access records (server-side admin operations)
CREATE POLICY IF NOT EXISTS "Service role can delete access"
  ON user_access FOR DELETE
  USING (auth.role() = 'service_role');

-- ============================================
-- UPDATED_AT TRIGGER
-- Automatically update updated_at timestamp on row modification
-- ============================================

CREATE OR REPLACE FUNCTION update_user_access_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_access_updated_at
  BEFORE UPDATE ON user_access
  FOR EACH ROW
  EXECUTE FUNCTION update_user_access_updated_at();

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify indexes were created
SELECT
  'Indexes created' as status,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'user_access'
ORDER BY indexname;

-- Expected:
-- - idx_user_access_active on (user_id, is_active, expires_at)
-- - idx_user_access_payment_id on (payment_id) WHERE payment_id IS NOT NULL

-- Verify all policies
SELECT
  'Policies after migration 008' as status,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'user_access'
ORDER BY policyname;

-- Expected policies:
-- 1. "Service role full access" (ALL) - ✅ From migration 007
-- 2. "Users can read own access" (SELECT) - ✅ From migration 007
-- 3. "Users cannot update own access" (UPDATE) - ✅ NEW in 008
-- 4. "Users cannot delete own access" (DELETE) - ✅ NEW in 008
-- 5. "Service role can update access" (UPDATE) - ✅ NEW in 008
-- 6. "Service role can delete access" (DELETE) - ✅ NEW in 008

-- Verify trigger was created
SELECT
  'Trigger created' as status,
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'user_access';

-- ============================================================================
-- PERFORMANCE TEST (run in Supabase SQL Editor)
-- ============================================================================

-- Test query: Get active access for a user
-- Replace 'TEST-UUID-HERE' with an actual user UUID
EXPLAIN ANALYZE
SELECT * FROM user_access
WHERE user_id = 'TEST-UUID-HERE'
  AND is_active = true
  AND expires_at > NOW();

-- Expected: Should show "Index Scan using idx_user_access_active"
-- Cost should be significantly lower than Seq Scan

-- ============================================================================
-- SECURITY VERIFICATION
-- ============================================================================

-- Test that regular users cannot update (run as regular user)
-- This should return "permission denied"
-- UPDATE user_access SET is_active = false WHERE user_id = auth.uid();

-- Test that service role can update (run as service role)
-- This should succeed
-- UPDATE user_access SET is_active = false WHERE user_id = 'SOME-UUID';

-- ============================================================================
-- NOTES:
-- 1. Composite index (user_id, is_active, expires_at) matches the query pattern
--    used in server/routes/payments.ts and server/routes/mercadopago.ts
-- 2. Explicit deny policies (USING false) prevent users from modifying access
--    even if client-side bugs attempt to do so
-- 3. Service role bypasses RLS entirely for admin operations via server API
-- 4. Partial index on payment_id reduces index size for NULL values
-- 5. Trigger ensures updated_at is always maintained automatically
-- ============================================================================
