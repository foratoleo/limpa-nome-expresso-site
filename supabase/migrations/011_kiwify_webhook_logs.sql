-- Migration 011: Create kiwify_webhook_logs table
-- Stores comprehensive audit trail of all Kiwify webhook events and payment processing
-- Essential for debugging, compliance, and monitoring payment gateway integration

-- Create kiwify_webhook_logs table
CREATE TABLE IF NOT EXISTS kiwify_webhook_logs (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Action performed
  action TEXT NOT NULL CHECK (action IN (
    'webhook_received',
    'webhook_verified',
    'webhook_verification_failed',
    'webhook_duplicate',
    'payment_approved',
    'payment_refused',
    'payment_refunded',
    'payment_chargeback',
    'subscription_canceled',
    'subscription_renewed',
    'access_granted',
    'access_revoked',
    'access_extended',
    'email_sent',
    'email_failed',
    'api_request',
    'api_error',
    'token_refresh',
    'processing_error'
  )),

  -- Processing status
  status TEXT NOT NULL CHECK (status IN (
    'pending',
    'processing',
    'completed',
    'failed',
    'skipped'
  )),

  -- Kiwify identifiers
  sale_id TEXT,
  order_id TEXT,

  -- Customer information
  customer_email TEXT,

  -- Event type from Kiwify webhook
  event_type TEXT CHECK (event_type IN (
    'compra_aprovada',
    'compra_recusada',
    'compra_reembolsada',
    'chargeback',
    'subscription_canceled',
    'subscription_renewed'
  )),

  -- Human-readable message
  message TEXT NOT NULL,

  -- Additional context (amount, currency, user_id, etc.)
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Error details (if any)
  error_details JSONB,

  -- Processing duration in milliseconds
  processing_duration_ms INTEGER,

  -- When the log entry was created
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_kiwify_webhook_logs_sale_id
  ON kiwify_webhook_logs(sale_id)
  WHERE sale_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_kiwify_webhook_logs_order_id
  ON kiwify_webhook_logs(order_id)
  WHERE order_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_kiwify_webhook_logs_customer_email
  ON kiwify_webhook_logs(customer_email)
  WHERE customer_email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_kiwify_webhook_logs_timestamp
  ON kiwify_webhook_logs(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_kiwify_webhook_logs_action
  ON kiwify_webhook_logs(action);

CREATE INDEX IF NOT EXISTS idx_kiwify_webhook_logs_status
  ON kiwify_webhook_logs(status);

CREATE INDEX IF NOT EXISTS idx_kiwify_webhook_logs_event_type
  ON kiwify_webhook_logs(event_type)
  WHERE event_type IS NOT NULL;

-- Composite index for recent activity by customer
CREATE INDEX IF NOT EXISTS idx_kiwify_webhook_logs_customer_timestamp
  ON kiwify_webhook_logs(customer_email, timestamp DESC)
  WHERE customer_email IS NOT NULL;

-- Composite index for failed events by time
CREATE INDEX IF NOT EXISTS idx_kiwify_webhook_logs_failed_timestamp
  ON kiwify_webhook_logs(timestamp DESC)
  WHERE status = 'failed';

-- Create RLS policies
ALTER TABLE kiwify_webhook_logs ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (bypasses RLS)
CREATE POLICY "Service role has full access to kiwify_webhook_logs"
  ON kiwify_webhook_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Admins can read webhook logs but not insert (inserts done via service role)
CREATE POLICY "Admins can read kiwify webhook logs"
  ON kiwify_webhook_logs
  FOR SELECT
  TO authenticated
  USING (
    -- Admin users can read all webhook logs
    auth.jwt()->>'role' = 'admin'
  );

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON kiwify_webhook_logs TO service_role;

GRANT SELECT ON kiwify_webhook_logs TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE kiwify_webhook_logs IS 'Audit trail of all Kiwify webhook events and payment processing for debugging and compliance';
COMMENT ON COLUMN kiwify_webhook_logs.action IS 'Type of action performed (webhook_received, payment_approved, etc.)';
COMMENT ON COLUMN kiwify_webhook_logs.status IS 'Processing status (pending, processing, completed, failed, skipped)';
COMMENT ON COLUMN kiwify_webhook_logs.sale_id IS 'Kiwify sale ID for tracking';
COMMENT ON COLUMN kiwify_webhook_logs.order_id IS 'Kiwify order ID for tracking';
COMMENT ON COLUMN kiwify_webhook_logs.customer_email IS 'Customer email from webhook payload';
COMMENT ON COLUMN kiwify_webhook_logs.event_type IS 'Original Kiwify webhook event type (compra_aprovada, etc.)';
COMMENT ON COLUMN kiwify_webhook_logs.message IS 'Human-readable log message';
COMMENT ON COLUMN kiwify_webhook_logs.metadata IS 'Additional context (amount, currency, user_id, etc.)';
COMMENT ON COLUMN kiwify_webhook_logs.error_details IS 'Error information if status is failed';
COMMENT ON COLUMN kiwify_webhook_logs.processing_duration_ms IS 'Processing duration in milliseconds';
COMMENT ON COLUMN kiwify_webhook_logs.timestamp IS 'When the log entry was created';
