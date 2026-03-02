-- ============================================
-- LIMPA NOME EXPRESSO - SETUP SUPABASE
-- Execute este script no SQL Editor do Supabase
-- Dashboard > SQL Editor > New Query > Cole e Execute
-- ============================================

-- TABELA 1: checklist_progress
-- Armazena o progresso do checklist de cada usuario

CREATE TABLE IF NOT EXISTS checklist_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  step_number INTEGER NOT NULL,
  item_id TEXT NOT NULL,
  checked BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_user_item UNIQUE(user_id, item_id)
);

-- RLS para checklist_progress
ALTER TABLE checklist_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own progress" ON checklist_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own progress" ON checklist_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own progress" ON checklist_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own progress" ON checklist_progress FOR DELETE USING (auth.uid() = user_id);

-- Indice para performance
CREATE INDEX IF NOT EXISTS idx_checklist_user ON checklist_progress(user_id);

-- ============================================

-- TABELA 2: user_processes (opcional)
-- Rastreia processos juridicos dos usuarios

CREATE TABLE IF NOT EXISTS user_processes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  process_number TEXT,
  status TEXT DEFAULT 'em_andamento',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS para user_processes
ALTER TABLE user_processes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own processes" ON user_processes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own processes" ON user_processes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own processes" ON user_processes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own processes" ON user_processes FOR DELETE USING (auth.uid() = user_id);

-- Indice para performance
CREATE INDEX IF NOT EXISTS idx_processes_user ON user_processes(user_id);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_processes_updated
  BEFORE UPDATE ON user_processes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- PRONTO! Tabelas criadas com seguranca RLS
-- ============================================
