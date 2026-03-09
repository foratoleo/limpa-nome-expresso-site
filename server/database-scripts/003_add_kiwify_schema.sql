-- Add Kiwify support to existing payments table
-- Migration: 003_add_kiwify_schema.sql
-- Description: Adds columns for Kiwify payment integration with idempotency support

-- Add Kiwify-specific columns
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS kiwify_sale_id TEXT,
  ADD COLUMN IF NOT EXISTS kiwify_order_id TEXT;

-- Create index for Kiwify sale ID lookups (critical for idempotency checks)
CREATE INDEX IF NOT EXISTS idx_payments_kiwify_sale ON payments(kiwify_sale_id);

-- Create unique constraint to enforce idempotency at database level
-- This prevents duplicate entries for the same Kiwify sale
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'payments_kiwify_sale_id_unique'
  ) THEN
    ALTER TABLE payments ADD CONSTRAINT payments_kiwify_sale_id_unique UNIQUE (kiwify_sale_id);
  END IF;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN payments.kiwify_sale_id IS 'Kiwify sale ID - used for idempotency checks and payment verification';
COMMENT ON COLUMN payments.kiwify_order_id IS 'Kiwify order ID - additional reference for the order';

-- Update payment_provider check constraint to include kiwify
-- First drop the existing constraint if it exists with old values
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_payment_provider_check;

-- Add new constraint with kiwify included
ALTER TABLE payments
  ADD CONSTRAINT payments_payment_provider_check
  CHECK (payment_provider IN ('stripe', 'mercadopago', 'kiwify'));
