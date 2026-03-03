-- ============================================================================
-- MIGRATION 003: User Manual Access Schema
-- Copie e cole este SQL no painel do Supabase:
-- https://supabase.com/dashboard/project/dvkfvhqfwffxgmmjbgjd/sql/new
-- ============================================================================

-- ============================================
-- Table: user_manual_access
-- Stores manually granted user access with optional expiration
-- ============================================

CREATE TABLE IF NOT EXISTS user_manual_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  granted_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  reason TEXT,
  is_active BOOLEAN DEFAULT true
);

-- Enable Row Level Security
ALTER TABLE user_manual_access ENABLE ROW LEVEL SECURITY;

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_user_manual_access_user_id ON user_manual_access(user_id);
CREATE INDEX IF NOT EXISTS idx_user_manual_access_is_active ON user_manual_access(is_active);

-- ============================================
-- RLS Policies for user_manual_access
-- ============================================

-- Service role can do everything
DROP POLICY IF EXISTS "Service role can manage all manual access" ON user_manual_access;
CREATE POLICY "Service role can manage all manual access"
  ON user_manual_access FOR ALL
  USING (auth.role() = 'service_role');

-- Users can view their own manual access
DROP POLICY IF EXISTS "Users can view own manual access" ON user_manual_access;
CREATE POLICY "Users can view own manual access"
  ON user_manual_access FOR SELECT
  USING (auth.uid() = user_id);

-- Only admins can insert manual access
DROP POLICY IF EXISTS "Admins can insert manual access" ON user_manual_access;
CREATE POLICY "Admins can insert manual access"
  ON user_manual_access FOR INSERT
  WITH CHECK (auth.jwt()->>'role' = 'admin');

-- Only admins can update manual access
DROP POLICY IF EXISTS "Admins can update manual access" ON user_manual_access;
CREATE POLICY "Admins can update manual access"
  ON user_manual_access FOR UPDATE
  USING (auth.jwt()->>'role' = 'admin');

-- Only admins can delete manual access
DROP POLICY IF EXISTS "Admins can delete manual access" ON user_manual_access;
CREATE POLICY "Admins can delete manual access"
  ON user_manual_access FOR DELETE
  USING (auth.jwt()->>'role' = 'admin');

-- ============================================================================
-- FIM DA MIGRATION 003
-- Execute este primeiro, depois execute a Migration 004 abaixo
-- ============================================================================


-- ============================================================================
-- MIGRATION 004: Update RLS Policies for Manual Access
-- Copie e cole este SQL DEPOIS de executar a Migration 003 acima
-- ============================================================================

-- ============================================
-- Table: checklist_progress
-- ============================================

DROP POLICY IF EXISTS "Users can view own checklist progress" ON checklist_progress;
DROP POLICY IF EXISTS "Users can insert own checklist progress" ON checklist_progress;
DROP POLICY IF EXISTS "Users can update own checklist progress" ON checklist_progress;
DROP POLICY IF EXISTS "Users can delete own checklist progress" ON checklist_progress;

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

DROP POLICY IF EXISTS "Users can view own processes" ON user_processes;
DROP POLICY IF EXISTS "Users can insert own processes" ON user_processes;
DROP POLICY IF EXISTS "Users can update own processes" ON user_processes;
DROP POLICY IF EXISTS "Users can delete own processes" ON user_processes;

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
-- Table: user_documents
-- ============================================

DROP POLICY IF EXISTS "Users can view own documents" ON user_documents;
DROP POLICY IF EXISTS "Users can insert own documents" ON user_documents;
DROP POLICY IF EXISTS "Users can update own documents" ON user_documents;
DROP POLICY IF EXISTS "Users can delete own documents" ON user_documents;

CREATE POLICY "Users can view own documents or has manual access"
  ON user_documents FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM user_manual_access
      WHERE user_manual_access.user_id = auth.uid()
      AND user_manual_access.is_active = true
      AND (user_manual_access.expires_at IS NULL OR user_manual_access.expires_at > now())
    )
  );

CREATE POLICY "Users can insert own documents or has manual access"
  ON user_documents FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM user_manual_access
      WHERE user_manual_access.user_id = auth.uid()
      AND user_manual_access.is_active = true
      AND (user_manual_access.expires_at IS NULL OR user_manual_access.expires_at > now())
    )
  );

CREATE POLICY "Users can update own documents or has manual access"
  ON user_documents FOR UPDATE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM user_manual_access
      WHERE user_manual_access.user_id = auth.uid()
      AND user_manual_access.is_active = true
      AND (user_manual_access.expires_at IS NULL OR user_manual_access.expires_at > now())
    )
  );

CREATE POLICY "Users can delete own documents or has manual access"
  ON user_documents FOR DELETE
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
-- Table: user_notes
-- ============================================

DROP POLICY IF EXISTS "Users can view own notes" ON user_notes;
DROP POLICY IF EXISTS "Users can insert own notes" ON user_notes;
DROP POLICY IF EXISTS "Users can update own notes" ON user_notes;
DROP POLICY IF EXISTS "Users can delete own notes" ON user_notes;

CREATE POLICY "Users can view own notes or has manual access"
  ON user_notes FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM user_manual_access
      WHERE user_manual_access.user_id = auth.uid()
      AND user_manual_access.is_active = true
      AND (user_manual_access.expires_at IS NULL OR user_manual_access.expires_at > now())
    )
  );

CREATE POLICY "Users can insert own notes or has manual access"
  ON user_notes FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM user_manual_access
      WHERE user_manual_access.user_id = auth.uid()
      AND user_manual_access.is_active = true
      AND (user_manual_access.expires_at IS NULL OR user_manual_access.expires_at > now())
    )
  );

CREATE POLICY "Users can update own notes or has manual access"
  ON user_notes FOR UPDATE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM user_manual_access
      WHERE user_manual_access.user_id = auth.uid()
      AND user_manual_access.is_active = true
      AND (user_manual_access.expires_at IS NULL OR user_manual_access.expires_at > now())
    )
  );

CREATE POLICY "Users can delete own notes or has manual access"
  ON user_notes FOR DELETE
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
-- Table: user_todos
-- ============================================

DROP POLICY IF EXISTS "Users can view own todos" ON user_todos;
DROP POLICY IF EXISTS "Users can insert own todos" ON user_todos;
DROP POLICY IF EXISTS "Users can update own todos" ON user_todos;
DROP POLICY IF EXISTS "Users can delete own todos" ON user_todos;

CREATE POLICY "Users can view own todos or has manual access"
  ON user_todos FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM user_manual_access
      WHERE user_manual_access.user_id = auth.uid()
      AND user_manual_access.is_active = true
      AND (user_manual_access.expires_at IS NULL OR user_manual_access.expires_at > now())
    )
  );

CREATE POLICY "Users can insert own todos or has manual access"
  ON user_todos FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM user_manual_access
      WHERE user_manual_access.user_id = auth.uid()
      AND user_manual_access.is_active = true
      AND (user_manual_access.expires_at IS NULL OR user_manual_access.expires_at > now())
    )
  );

CREATE POLICY "Users can update own todos or has manual access"
  ON user_todos FOR UPDATE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM user_manual_access
      WHERE user_manual_access.user_id = auth.uid()
      AND user_manual_access.is_active = true
      AND (user_manual_access.expires_at IS NULL OR user_manual_access.expires_at > now())
    )
  );

CREATE POLICY "Users can delete own todos or has manual access"
  ON user_todos FOR DELETE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM user_manual_access
      WHERE user_manual_access.user_id = auth.uid()
      AND user_manual_access.is_active = true
      AND (user_manual_access.expires_at IS NULL OR user_manual_access.expires_at > now())
    )
  );

-- ============================================================================
-- FIM DA MIGRATION 004
-- ============================================================================
-- ============================================================================
-- VERIFICAÇÃO - Execute para confirmar que tudo funcionou
-- ============================================================================

-- Verificar se a tabela foi criada
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'user_manual_access'
ORDER BY ordinal_position;

-- Verificar políticas criadas
SELECT tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'user_manual_access'
ORDER BY policyname;

-- Contar registros (deve ser 0 no início)
SELECT COUNT(*) as total_acessos_manuais
FROM user_manual_access;

-- ============================================================================
-- INSTRUÇÕES:
-- 1. Copie TUDO desde o início até "FIM DA MIGRATION 003"
-- 2. Cole no SQL Editor do Supabase e execute
-- 3. Depois copie desde "MIGRATION 004" até "FIM DA MIGRATION 004"
-- 4. Cole no SQL Editor e execute novamente
-- 5. Por fim, execute a seção VERIFICAÇÃO para confirmar
-- ============================================================================
