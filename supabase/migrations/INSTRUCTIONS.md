# Instruções para Aplicar Migrations Manualmente

## Passo 1: Acessar o SQL Editor do Supabase

1. Acesse: https://supabase.com/dashboard/project/dvkfvhqfwffxgmmjbgjd/sql/new
2. Certifique-se de estar logado

## Passo 2: Executar Migration 003

Copie e execute o seguinte SQL no SQL Editor:

```sql
-- Migration: User Manual Access Schema
-- Manually granted access to users (by admins)

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

-- Service role can do everything
CREATE POLICY "Service role can manage all manual access"
  ON user_manual_access FOR ALL
  USING (auth.role() = 'service_role');

-- Users can view their own manual access
CREATE POLICY "Users can view own manual access"
  ON user_manual_access FOR SELECT
  USING (auth.uid() = user_id);

-- Only admins can insert manual access
CREATE POLICY "Admins can insert manual access"
  ON user_manual_access FOR INSERT
  WITH CHECK (auth.jwt()->>'role' = 'admin');

-- Only admins can update manual access
CREATE POLICY "Admins can update manual access"
  ON user_manual_access FOR UPDATE
  USING (auth.jwt()->>'role' = 'admin');

-- Only admins can delete manual access
CREATE POLICY "Admins can delete manual access"
  ON user_manual_access FOR DELETE
  USING (auth.jwt()->>'role' = 'admin');
```

## Passo 3: Verificar Criação

Após executar, você deve ver uma mensagem de sucesso. Para verificar:

```sql
SELECT * FROM user_manual_access;
```

## Passo 4: Atualizar Políticas RLS (Migration 004)

Esta migration atualiza as políticas RLS das tabelas existentes para considerar acesso manual. Execute o seguinte SQL:

```sql
-- DROP existing policies for checklist_progress
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

-- DROP existing policies for user_processes
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

-- DROP existing policies for user_documents
DROP POLICY IF EXISTS "Users can view own documents" ON user_documents;
DROP POLICY IF EXISTS "Users can insert own documents" ON user_documents;
DROP POLICY IF EXISTS "Users can update own documents" ON user_documents;
DROP POLICY IF EXISTS "Users can delete own documents" ON user_documents;

-- CREATE new policies with manual access support
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
```

## Passo 5: Confirmar Aplicação

Após executar ambos os scripts, verifique se a tabela foi criada:

```sql
-- Verificar tabela
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'user_manual_access';

-- Verificar políticas RLS
SELECT tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'user_manual_access';
```

## Resumo da Integração

Após aplicar as migrations:

✅ **Tabela Criada**: `user_manual_access` armazena acessos manuais concedidos por admins
✅ **RLS Habilitado**: Políticas de segurança por linha ativadas
✅ **Índices Criados**: Para consultas rápidas por user_id e is_active
✅ **Políticas Atualizadas**: Todas as tabelas principais agora consideram acesso manual

## Como Usar

1. Acesse `/admin/access` no sistema (requer role=admin)
2. Conceda acesso manual a usuários por email
3. Usuários com acesso manual podem acessar todas as funcionalidades mesmo sem assinatura
