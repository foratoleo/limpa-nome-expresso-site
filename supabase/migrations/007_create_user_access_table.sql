-- ============================================================================
-- MIGRATION 007: Create user_access Table Schema
-- Stores payment-based access granted through MercadoPago
-- ============================================================================

-- ============================================
-- Table: user_access
-- Stores user access from payments (subscriptions, one-time purchases)
-- Complements user_manual_access for admin-granted access
-- ============================================

CREATE TABLE IF NOT EXISTS user_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  access_type TEXT NOT NULL CHECK (access_type IN ('subscription', 'one_time')),
  payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Prevent duplicate active access of the same type
  CONSTRAINT user_access_unique_active UNIQUE (user_id, access_type)
);

-- Enable Row Level Security
ALTER TABLE user_access ENABLE ROW LEVEL SECURITY;

-- ============================================
-- INITIAL RLS POLICIES
-- ============================================

-- Service role can do everything (bypasses RLS for server-side operations)
CREATE POLICY "Service role full access"
  ON user_access FOR ALL
  USING (auth.role() = 'service_role');

-- Users can read their own access records
CREATE POLICY "Users can read own access"
  ON user_access FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify table was created
SELECT
  'user_access table created' as status,
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'user_access'
ORDER BY ordinal_position;

-- Verify RLS is enabled
SELECT
  'RLS enabled' as status,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'user_access';

-- Verify initial policies
SELECT
  'Initial policies created' as status,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'user_access'
ORDER BY policyname;

-- ============================================================================
-- NOTES:
-- 1. Indexes will be added in migration 008
-- 2. Explicit deny policies (UPDATE/DELETE) will be added in migration 008
-- 3. payment_id is nullable to support future flexibility (manual grants, etc.)
-- 4. UNIQUE constraint prevents duplicate active access of same type per user
-- 5. Soft delete pattern via is_active flag (never DELETE, just set is_active=false)
-- ============================================================================
