-- ============================================================================
-- MIGRATION 006: Add Explicit RLS Policies for user_access Table
-- Security fix to prevent unauthorized modifications
-- ============================================================================

-- Issue: user_access table lacks explicit UPDATE/DELETE policies
-- Risk: Users might be able to modify their access records without proper authorization

-- ===================================================================
-- CREATE EXPLICIT POLICIES TO PREVENT USER MODIFICATIONS
-- ===================================================================

-- Policy: Users cannot UPDATE their own access records
CREATE POLICY IF NOT EXISTS "Users cannot update own access"
  ON user_access FOR UPDATE
  USING (false);

-- Policy: Users cannot DELETE their own access records
CREATE POLICY IF NOT EXISTS "Users cannot delete own access"
  ON user_access FOR DELETE
  USING (false);

-- Policy: Only service role can UPDATE access records
CREATE POLICY IF NOT EXISTS "Service role can update access"
  ON user_access FOR UPDATE
  USING (auth.role() = 'service_role');

-- Policy: Only service role can DELETE access records
CREATE POLICY IF NOT EXISTS "Service role can delete access"
  ON user_access FOR DELETE
  USING (auth.role() = 'service_role');

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify all policies on user_access
SELECT
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'user_access'
ORDER BY policyname;

-- Expected result should show:
-- 1. "Users can read own access" (SELECT) - ✅ Already exists
-- 2. "Service role full access" (ALL) - ✅ Already exists
-- 3. "Users cannot update own access" (UPDATE) - ✅ Newly created
-- 4. "Users cannot delete own access" (DELETE) - ✅ Newly created
-- 5. "Service role can update access" (UPDATE) - ✅ Newly created
-- 6. "Service role can delete access" (DELETE) - ✅ Newly created

-- ============================================================================
-- INSTRUCTIONS:
-- 1. Copy this entire SQL block
-- 2. Go to: https://supabase.com/dashboard/project/dvkfvhqfwffxgmmjbgjd/sql/new
-- 3. Paste and execute
-- 4. Verify no errors occur
-- 5. Run the verification query to confirm policies
-- ============================================================================
