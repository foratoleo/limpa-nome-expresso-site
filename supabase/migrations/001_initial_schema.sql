-- Migration: Initial Schema for Limpa Nome Expresso
-- Run this in Supabase SQL Editor

-- ============================================
-- Table: checklist_progress
-- Stores user checklist progress synced from localStorage
-- ============================================

CREATE TABLE IF NOT EXISTS checklist_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  step_number INTEGER NOT NULL,
  item_id TEXT NOT NULL,
  checked BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_user_item UNIQUE(user_id, item_id)
);

-- Enable Row Level Security
ALTER TABLE checklist_progress ENABLE ROW LEVEL SECURITY;

-- Policies for checklist_progress
CREATE POLICY "Users can view own checklist progress"
  ON checklist_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own checklist progress"
  ON checklist_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own checklist progress"
  ON checklist_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own checklist progress"
  ON checklist_progress FOR DELETE
  USING (auth.uid() = user_id);

-- Index for faster queries by user
CREATE INDEX idx_checklist_progress_user_id ON checklist_progress(user_id);

-- ============================================
-- Table: user_processes
-- Optional: Track user legal processes
-- ============================================

CREATE TABLE IF NOT EXISTS user_processes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  process_number TEXT,
  status TEXT DEFAULT 'em_andamento',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_processes ENABLE ROW LEVEL SECURITY;

-- Policies for user_processes
CREATE POLICY "Users can view own processes"
  ON user_processes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own processes"
  ON user_processes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own processes"
  ON user_processes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own processes"
  ON user_processes FOR DELETE
  USING (auth.uid() = user_id);

-- Index for faster queries by user
CREATE INDEX idx_user_processes_user_id ON user_processes(user_id);

-- ============================================
-- Function: updated_at timestamp
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for user_processes
CREATE TRIGGER update_user_processes_updated_at
  BEFORE UPDATE ON user_processes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Auth Settings (optional)
-- ============================================

-- Enable email confirmations (recommended for production)
-- UPDATE auth.users SET email_confirmed_at = now() WHERE email_confirmed_at IS NULL;

-- ============================================
-- Sample Data (for testing - remove in production)
-- ============================================

-- Uncomment to add test data after creating a user
-- INSERT INTO checklist_progress (user_id, step_number, item_id, checked)
-- VALUES ('USER_UUID_HERE', 1, 'rg_cpf', true);
