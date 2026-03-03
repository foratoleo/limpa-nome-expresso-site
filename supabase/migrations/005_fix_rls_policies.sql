-- ============================================================================
-- MIGRATION 005: Fix RLS Policies for Security
-- Fixes critical vulnerability where JWT claim checks don't work with Supabase
-- ============================================================================

-- PROBLEM: Current policies use auth.jwt()->>'role' which doesn't work
-- SOLUTION: Use service_role enforcement at server level

-- ============================================
-- Drop vulnerable admin policies
-- ============================================

DROP POLICY IF EXISTS "Admins can insert manual access" ON user_manual_access;
DROP POLICY IF EXISTS "Admins can update manual access" ON user_manual_access;
DROP POLICY IF EXISTS "Admins can delete manual access" ON user_manual_access;

-- ============================================
-- Create secure service role policy
-- ============================================

-- Service role (from server) can do all admin operations
-- This is secure because service_role key never leaves the server
CREATE POLICY "Service role manages manual access"
  ON user_manual_access FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- Verification
-- ============================================

-- Verify policies are correct
SELECT
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'user_manual_access'
ORDER BY policyname;

-- Expected output should show:
-- - "Service role can manage all manual access" (INSERT/SELECT/UPDATE/DELETE)
-- - "Users can view own manual access" (SELECT)
-- - No policies with JWT claim checks

-- ============================================================================
-- INSTRUCTIONS:
-- 1. Copy this entire SQL block
-- 2. Go to: https://supabase.com/dashboard/project/dvkfvhqfwffxgmmjbgjd/sql/new
-- 3. Paste and execute
-- 4. Verify no errors occur
-- 5. Run the verification query to confirm policies
-- ============================================================================
