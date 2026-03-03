-- Add MercadoPago support to existing payments table
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS payment_provider TEXT DEFAULT 'stripe',
  ADD COLUMN IF NOT EXISTS mercadopago_payment_id TEXT,
  ADD COLUMN IF NOT EXISTS mercadopago_preference_id TEXT,
  ADD COLUMN IF NOT EXISTS access_expires_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_payments_user_status ON payments(user_id, status);
CREATE INDEX IF NOT EXISTS idx_payments_provider ON payments(payment_provider);

-- Add comment for documentation
COMMENT ON COLUMN payments.payment_provider IS 'Payment processor: stripe or mercadopago';
COMMENT ON COLUMN payments.access_expires_at IS 'Access expiration date for one-time payments (12 months from purchase)';
