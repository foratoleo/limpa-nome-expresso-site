# Database Scripts

This directory contains SQL scripts for database schema changes.

## How to Apply

1. Go to Supabase Dashboard → SQL Editor
2. For each script file:
   - Open the file content
   - Paste into SQL Editor
   - Click "Run" to execute
3. Verify execution was successful (check for success message)

## Scripts

### 001_add_mercadopago_schema.sql
Adds MercadoPago support to the existing `payments` table:
- New columns: `payment_provider`, `mercadopago_payment_id`, `mercadopago_preference_id`, `access_expires_at`
- Indexes for performance
- Documentation comments

### 002_create_user_access.sql
Creates the `user_access` table for managing access expiration:
- Tracks user access (subscription and one-time)
- Row Level Security (RLS) policies
- Indexes for active access queries

## Order of Execution

Run scripts in numerical order:
1. `001_add_mercadopago_schema.sql`
2. `002_create_user_access.sql`

## Verification

After running scripts, verify in Supabase Dashboard:

**Table Editor:**
- Check `payments` table has new columns
- Check `user_access` table exists with correct structure

**Database > Schema:**
- Verify indexes exist: `idx_payments_user_status`, `idx_payments_provider`, `idx_user_access_active`
- Verify RLS policies on `user_access` table
