CREATE TABLE IF NOT EXISTS user_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_type TEXT NOT NULL CHECK (access_type IN ('subscription', 'one_time')),
  payment_id TEXT REFERENCES payments(id),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, access_type)
);

CREATE INDEX IF NOT EXISTS idx_user_access_active ON user_access(user_id, is_active, expires_at);

ALTER TABLE user_access ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own access" ON user_access;
CREATE POLICY "Users can read own access"
  ON user_access FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access" ON user_access;
CREATE POLICY "Service role full access"
  ON user_access FOR ALL
  USING (auth.role() = 'service_role');
