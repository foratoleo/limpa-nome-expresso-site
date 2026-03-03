-- Create payments table with both Stripe and MercadoPago support
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Stripe fields
  stripe_payment_id TEXT,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,

  -- MercadoPago fields
  payment_provider TEXT DEFAULT 'stripe',
  mercadopago_payment_id TEXT,
  mercadopago_preference_id TEXT,

  -- Common fields
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT DEFAULT 'BRL',
  status TEXT NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'cancelled')),
  description TEXT,

  -- Access expiration for one-time payments
  access_expires_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_status ON payments(user_id, status);
CREATE INDEX IF NOT EXISTS idx_payments_provider ON payments(payment_provider);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_payment ON payments(stripe_payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_mercadopago_payment ON payments(mercadopago_payment_id);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own payments
CREATE POLICY IF NOT EXISTS "Users can read own payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Service role can do everything
CREATE POLICY IF NOT EXISTS "Service role full access to payments"
  ON payments FOR ALL
  USING (auth.role() = 'service_role');
