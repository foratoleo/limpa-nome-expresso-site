# Instructions: Apply RLS Security Fix

## Step 1: Open Supabase SQL Editor

Navigate to:
```
https://supabase.com/dashboard/project/dvkfvhqfwffxgmmjbgjd/sql/new
```

## Step 2: Copy and Execute This SQL

```sql
-- ============================================================================
-- MIGRATION 005: Fix RLS Policies for Security
-- ============================================================================

-- Drop vulnerable admin policies
DROP POLICY IF EXISTS "Admins can insert manual access" ON user_manual_access;
DROP POLICY IF EXISTS "Admins can update manual access" ON user_manual_access;
DROP POLICY IF EXISTS "Admins can delete manual access" ON user_manual_access;

-- Create secure service role policy
CREATE POLICY "Service role manages manual access"
  ON user_manual_access FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================================
-- Verification: Run this to confirm it worked
-- ============================================================================

SELECT
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'user_manual_access'
ORDER BY policyname;
```

## Step 3: Confirm Success

You should see:
- ✅ "Service role manages manual access" policy
- ✅ No policies with JWT claim checks
- ✅ Service role has ALL privileges (INSERT, SELECT, UPDATE, DELETE)

---

## What This Fixes

**Before**: RLS policies used `auth.jwt()->>'role' = 'admin'` which doesn't work with Supabase JWT structure, allowing any authenticated user to potentially bypass restrictions.

**After**: RLS policies use `auth.role() = 'service_role'` which is secure because:
- Service role key never leaves the server
- All admin operations go through server API endpoints
- Server endpoints verify admin role in user_metadata

---

## Next Steps After Applying

1. **Test Manual Access**
   - Login as forato@gmail.com
   - Navigate to /guia, /documentos, etc.
   - Should NOT be redirected to /checkout

2. **Verify Server Logs**
   - Check console for `[PaymentContext] Access check result`
   - Check server logs for `[Payments API] Manual access check`

3. **Confirm Production Ready**
   - ✅ All code changes complete
   - ✅ Security fixes applied
   - ✅ Build successful
   - ⚠️ This SQL migration (manual step)
