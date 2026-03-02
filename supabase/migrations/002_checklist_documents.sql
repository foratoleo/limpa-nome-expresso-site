-- Migration: Add checklist_documents table
-- Links user documents to specific checklist items

CREATE TABLE IF NOT EXISTS checklist_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  checklist_item_id TEXT NOT NULL,
  step_number INTEGER NOT NULL,
  document_id UUID NOT NULL REFERENCES user_documents(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),

  -- Ensure one document per checklist item per user
  UNIQUE(user_id, checklist_item_id, document_id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_checklist_documents_user_id ON checklist_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_checklist_documents_item_id ON checklist_documents(checklist_item_id);
CREATE INDEX IF NOT EXISTS idx_checklist_documents_document_id ON checklist_documents(document_id);

-- Enable RLS
ALTER TABLE checklist_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own checklist documents
CREATE POLICY "Users can view own checklist documents"
  ON checklist_documents FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert own checklist documents
CREATE POLICY "Users can insert own checklist documents"
  ON checklist_documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete own checklist documents
CREATE POLICY "Users can delete own checklist documents"
  ON checklist_documents FOR DELETE
  USING (auth.uid() = user_id);
