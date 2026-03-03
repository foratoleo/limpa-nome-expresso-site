-- Migration: Update RLS Policies for Manual Access
-- Updates existing RLS policies to consider manual user access

-- Helper: Common manual access check expression
-- This condition is reused across all policies
-- MANUAL_ACCESS_CHECK:
--   EXISTS (
--     SELECT 1 FROM user_manual_access
--     WHERE user_manual_access.user_id = auth.uid()
--     AND user_manual_access.is_active = true
--     AND (user_manual_access.expires_at IS NULL OR user_manual_access.expires_at > now())
--   )

-- ============================================
-- Table: checklist_progress
-- ============================================

-- DROP existing policies
DROP POLICY IF EXISTS "Users can view own checklist progress" ON checklist_progress;
DROP POLICY IF EXISTS "Users can insert own checklist progress" ON checklist_progress;
DROP POLICY IF EXISTS "Users can update own checklist progress" ON checklist_progress;
DROP POLICY IF EXISTS "Users can delete own checklist progress" ON checklist_progress;

-- CREATE new policies with manual access support
CREATE POLICY "Users can view own checklist progress or has manual access"
  ON checklist_progress FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM user_manual_access
      WHERE user_manual_access.user_id = auth.uid()
      AND user_manual_access.is_active = true
      AND (user_manual_access.expires_at IS NULL OR user_manual_access.expires_at > now())
    )
  );

CREATE POLICY "Users can insert own checklist progress or has manual access"
  ON checklist_progress FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM user_manual_access
      WHERE user_manual_access.user_id = auth.uid()
      AND user_manual_access.is_active = true
      AND (user_manual_access.expires_at IS NULL OR user_manual_access.expires_at > now())
    )
  );

CREATE POLICY "Users can update own checklist progress or has manual access"
  ON checklist_progress FOR UPDATE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM user_manual_access
      WHERE user_manual_access.user_id = auth.uid()
      AND user_manual_access.is_active = true
      AND (user_manual_access.expires_at IS NULL OR user_manual_access.expires_at > now())
    )
  );

CREATE POLICY "Users can delete own checklist progress or has manual access"
  ON checklist_progress FOR DELETE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM user_manual_access
      WHERE user_manual_access.user_id = auth.uid()
      AND user_manual_access.is_active = true
      AND (user_manual_access.expires_at IS NULL OR user_manual_access.expires_at > now())
    )
  );

-- ============================================
-- Table: user_processes
-- ============================================

-- DROP existing policies
DROP POLICY IF EXISTS "Users can view own processes" ON user_processes;
DROP POLICY IF EXISTS "Users can insert own processes" ON user_processes;
DROP POLICY IF EXISTS "Users can update own processes" ON user_processes;
DROP POLICY IF EXISTS "Users can delete own processes" ON user_processes;

-- CREATE new policies with manual access support
CREATE POLICY "Users can view own processes or has manual access"
  ON user_processes FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM user_manual_access
      WHERE user_manual_access.user_id = auth.uid()
      AND user_manual_access.is_active = true
      AND (user_manual_access.expires_at IS NULL OR user_manual_access.expires_at > now())
    )
  );

CREATE POLICY "Users can insert own processes or has manual access"
  ON user_processes FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM user_manual_access
      WHERE user_manual_access.user_id = auth.uid()
      AND user_manual_access.is_active = true
      AND (user_manual_access.expires_at IS NULL OR user_manual_access.expires_at > now())
    )
  );

CREATE POLICY "Users can update own processes or has manual access"
  ON user_processes FOR UPDATE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM user_manual_access
      WHERE user_manual_access.user_id = auth.uid()
      AND user_manual_access.is_active = true
      AND (user_manual_access.expires_at IS NULL OR user_manual_access.expires_at > now())
    )
  );

CREATE POLICY "Users can delete own processes or has manual access"
  ON user_processes FOR DELETE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM user_manual_access
      WHERE user_manual_access.user_id = auth.uid()
      AND user_manual_access.is_active = true
      AND (user_manual_access.expires_at IS NULL OR user_manual_access.expires_at > now())
    )
  );

-- ============================================
-- Table: checklist_documents
-- ============================================

-- DROP existing policies
DROP POLICY IF EXISTS "Users can view own checklist documents" ON checklist_documents;
DROP POLICY IF EXISTS "Users can insert own checklist documents" ON checklist_documents;
DROP POLICY IF EXISTS "Users can delete own checklist documents" ON checklist_documents;

-- CREATE new policies with manual access support
CREATE POLICY "Users can view own checklist documents or has manual access"
  ON checklist_documents FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM user_manual_access
      WHERE user_manual_access.user_id = auth.uid()
      AND user_manual_access.is_active = true
      AND (user_manual_access.expires_at IS NULL OR user_manual_access.expires_at > now())
    )
  );

CREATE POLICY "Users can insert own checklist documents or has manual access"
  ON checklist_documents FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM user_manual_access
      WHERE user_manual_access.user_id = auth.uid()
      AND user_manual_access.is_active = true
      AND (user_manual_access.expires_at IS NULL OR user_manual_access.expires_at > now())
    )
  );

CREATE POLICY "Users can delete own checklist documents or has manual access"
  ON checklist_documents FOR DELETE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM user_manual_access
      WHERE user_manual_access.user_id = auth.uid()
      AND user_manual_access.is_active = true
      AND (user_manual_access.expires_at IS NULL OR user_manual_access.expires_at > now())
    )
  );

-- ============================================
-- Stripe tables (optional - for payment access)
-- ============================================

-- DROP existing policies for stripe_customers
DROP POLICY IF EXISTS "Users can view own stripe customer" ON stripe_customers;
DROP POLICY IF EXISTS "Users can insert own stripe customer" ON stripe_customers;
DROP POLICY IF EXISTS "Users can update own stripe customer" ON stripe_customers;

-- CREATE new policies with manual access support
CREATE POLICY "Users can view own stripe customer or has manual access"
  ON stripe_customers FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM user_manual_access
      WHERE user_manual_access.user_id = auth.uid()
      AND user_manual_access.is_active = true
      AND (user_manual_access.expires_at IS NULL OR user_manual_access.expires_at > now())
    )
  );

CREATE POLICY "Users can insert own stripe customer or has manual access"
  ON stripe_customers FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM user_manual_access
      WHERE user_manual_access.user_id = auth.uid()
      AND user_manual_access.is_active = true
      AND (user_manual_access.expires_at IS NULL OR user_manual_access.expires_at > now())
    )
  );

CREATE POLICY "Users can update own stripe customer or has manual access"
  ON stripe_customers FOR UPDATE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM user_manual_access
      WHERE user_manual_access.user_id = auth.uid()
      AND user_manual_access.is_active = true
      AND (user_manual_access.expires_at IS NULL OR user_manual_access.expires_at > now())
    )
  );

-- DROP existing policies for subscriptions
DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can update own subscriptions" ON subscriptions;

-- CREATE new policies with manual access support
CREATE POLICY "Users can view own subscriptions or has manual access"
  ON subscriptions FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM user_manual_access
      WHERE user_manual_access.user_id = auth.uid()
      AND user_manual_access.is_active = true
      AND (user_manual_access.expires_at IS NULL OR user_manual_access.expires_at > now())
    )
  );

CREATE POLICY "Users can insert own subscriptions or has manual access"
  ON subscriptions FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM user_manual_access
      WHERE user_manual_access.user_id = auth.uid()
      AND user_manual_access.is_active = true
      AND (user_manual_access.expires_at IS NULL OR user_manual_access.expires_at > now())
    )
  );

CREATE POLICY "Users can update own subscriptions or has manual access"
  ON subscriptions FOR UPDATE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM user_manual_access
      WHERE user_manual_access.user_id = auth.uid()
      AND user_manual_access.is_active = true
      AND (user_manual_access.expires_at IS NULL OR user_manual_access.expires_at > now())
    )
  );

-- DROP existing policies for payments
DROP POLICY IF EXISTS "Users can view own payments" ON payments;
DROP POLICY IF EXISTS "Users can insert own payments" ON payments;
DROP POLICY IF EXISTS "Users can update own payments" ON payments;

-- CREATE new policies with manual access support
CREATE POLICY "Users can view own payments or has manual access"
  ON payments FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM user_manual_access
      WHERE user_manual_access.user_id = auth.uid()
      AND user_manual_access.is_active = true
      AND (user_manual_access.expires_at IS NULL OR user_manual_access.expires_at > now())
    )
  );

CREATE POLICY "Users can insert own payments or has manual access"
  ON payments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM user_manual_access
      WHERE user_manual_access.user_id = auth.uid()
      AND user_manual_access.is_active = true
      AND (user_manual_access.expires_at IS NULL OR user_manual_access.expires_at > now())
    )
  );

CREATE POLICY "Users can update own payments or has manual access"
  ON payments FOR UPDATE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM user_manual_access
      WHERE user_manual_access.user_id = auth.uid()
      AND user_manual_access.is_active = true
      AND (user_manual_access.expires_at IS NULL OR user_manual_access.expires_at > now())
    )
  );
