-- Migration: Stripe Integration Schema
-- Creates tables for payment tracking and subscription management

-- ============================================
-- Table: stripe_customers
-- Links Supabase users to Stripe customers
-- ============================================

CREATE TABLE IF NOT EXISTS stripe_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_customer_id TEXT NOT NULL UNIQUE,
  email TEXT,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_stripe_customer UNIQUE(stripe_customer_id)
);

-- Enable Row Level Security
ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;

-- Policies for stripe_customers
CREATE POLICY "Users can view own stripe customer"
  ON stripe_customers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stripe customer"
  ON stripe_customers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stripe customer"
  ON stripe_customers FOR UPDATE
  USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX idx_stripe_customers_user_id ON stripe_customers(user_id);
CREATE INDEX idx_stripe_customers_stripe_id ON stripe_customers(stripe_customer_id);

-- ============================================
-- Table: subscriptions
-- Tracks user subscription status
-- ============================================

CREATE TYPE subscription_status AS ENUM (
  'active',
  'past_due',
  'canceled',
  'incomplete',
  'incomplete_expired',
  'trialing',
  'unpaid'
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT NOT NULL,
  stripe_price_id TEXT NOT NULL,
  status subscription_status NOT NULL DEFAULT 'incomplete',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies for subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions"
  ON subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions"
  ON subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- Indexes for faster queries
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- ============================================
-- Table: payments
-- Tracks one-time and recurring payments
-- ============================================

CREATE TYPE payment_status AS ENUM (
  'pending',
  'succeeded',
  'failed',
  'refunded'
);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_invoice_id TEXT UNIQUE,
  stripe_customer_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'brl',
  status payment_status NOT NULL DEFAULT 'pending',
  description TEXT,
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Policies for payments
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payments"
  ON payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payments"
  ON payments FOR UPDATE
  USING (auth.uid() = user_id);

-- Indexes for faster queries
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_stripe_intent_id ON payments(stripe_payment_intent_id);
CREATE INDEX idx_payments_status ON payments(status);

-- ============================================
-- Trigger for updated_at timestamp
-- ============================================

CREATE TRIGGER update_stripe_customers_updated_at
  BEFORE UPDATE ON stripe_customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Products table (for caching Stripe products)
-- ============================================

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_product_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (read-only for all users)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  USING (active = true);

CREATE POLICY "Service role can manage products"
  ON products FOR ALL
  USING (auth.role() = 'service_role');

-- Index for faster queries
CREATE INDEX idx_products_stripe_id ON products(stripe_product_id);

-- ============================================
-- Prices table (for caching Stripe prices)
-- ============================================

CREATE TABLE IF NOT EXISTS prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_price_id TEXT NOT NULL UNIQUE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  unit_amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'brl',
  interval TEXT,
  active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active prices"
  ON prices FOR SELECT
  USING (active = true);

CREATE POLICY "Service role can manage prices"
  ON prices FOR ALL
  USING (auth.role() = 'service_role');

-- Index for faster queries
CREATE INDEX idx_prices_stripe_id ON prices(stripe_price_id);
CREATE INDEX idx_prices_product_id ON prices(product_id);

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prices_updated_at
  BEFORE UPDATE ON prices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Seed initial products and prices
-- ============================================

INSERT INTO products (stripe_product_id, name, description, active) VALUES
  ('prod_U4izIZFzjuAM1F', 'Plano Básico', 'Acesso ao guia completo de limpeza de nome + Checklist interativa + Modelos de documentos básicos', true),
  ('prod_U4izA6hfiFQljL', 'Plano Premium', 'Tudo do Plano Básico + Modelos avançados + Suporte por email + Consulta por chat', true),
  ('prod_U4iz7nug4K8kEs', 'Plano VIP', 'Tudo do Premium + Consultoria individual 1-1 + Suporte prioritário + Acompanhamento personalizado', true)
ON CONFLICT (stripe_product_id) DO NOTHING;

INSERT INTO prices (stripe_price_id, product_id, unit_amount, currency, interval, active)
SELECT 'price_1T6ZXcBh5qttJQ24jI2X6QrK', id, 9700, 'brl', 'month', true FROM products WHERE stripe_product_id = 'prod_U4izIZFzjuAM1F'
UNION ALL
SELECT 'price_1T6ZXcBh5qttJQ24FJDkfQNC', id, 19700, 'brl', 'month', true FROM products WHERE stripe_product_id = 'prod_U4izA6hfiFQljL'
UNION ALL
SELECT 'price_1T6ZXdBh5qttJQ24hYSm6HII', id, 49700, 'brl', 'month', true FROM products WHERE stripe_product_id = 'prod_U4iz7nug4K8kEs'
ON CONFLICT (stripe_price_id) DO NOTHING;
