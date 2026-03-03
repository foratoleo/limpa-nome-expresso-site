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

-- Policies for user_manual_access

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

-- Indexes for faster queries
CREATE INDEX idx_user_manual_access_user_id ON user_manual_access(user_id);
CREATE INDEX idx_user_manual_access_is_active ON user_manual_access(is_active);
