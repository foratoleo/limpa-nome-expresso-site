# Testing Checklist - Payment Integration (MercadoPago)

**Project:** CPF Blindado
**Integration:** MercadoPago Payment System
**Documentation Version:** 1.0
**Last Updated:** 2026-03-02

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Task 7.1: Test Database Schema](#task-71-test-database-schema)
3. [Task 7.2: Test Payment API Endpoint](#task-72-test-payment-api-endpoint)
4. [Task 7.3: Test Checkout Flow End-to-End](#task-73-test-checkout-flow-end-to-end)
5. [Task 7.4: Test Route Protection](#task-74-test-route-protection)
6. [Task 7.5: Test Payment Status Refresh](#task-75-test-payment-status-refresh)
7. [Task 7.6: Test Webhook Processing](#task-76-test-webhook-processing)
8. [Environment Configuration](#environment-configuration)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Tools

- **tmux** (for session management during testing)
- **curl** (for API testing)
- **psql** or Supabase SQL Editor (for database queries)
- **Node.js** v18+ and **pnpm** (for running the application)
- **MercadoPago Test Account** (https://www.mercadopago.com.br/developers/panel)

### Environment Setup

Verify all environment variables are configured:

```bash
# Check if .env file exists and contains required variables
cat /path/to/project/.env | grep -E "(MERCADOPAGO|SUPABASE|PUBLIC_URL|PORT)"
```

Required variables:
- `MERCADOPAGO_ACCESS_TOKEN` - Test access token from MercadoPago
- `MERCADOPAGO_PUBLIC_KEY` - Test public key from MercadoPago
- `VITE_SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `PUBLIC_URL` - Application public URL (e.g., http://localhost:3000)
- `PORT` - Server port (default: 3001)

### Port Availability Check

```bash
# Verify port 3001 is available
lsof -i :3001
# Should return nothing if port is free
```

---

## Task 7.1: Test Database Schema

### Objective
Verify all database tables, columns, indexes, and RLS policies are correctly created.

### Test Cases

#### TC1.1: Verify payments table schema

**Test Description:** Ensure payments table has MercadoPago-specific columns

**Verification Query:**
```sql
-- Run in Supabase SQL Editor or via psql
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM
  information_schema.columns
WHERE
  table_schema = 'public'
  AND table_name = 'payments'
ORDER BY
  ordinal_position;
```

**Expected Result:**
- Column `payment_provider` exists (type: text, default: 'stripe')
- Column `mercadopago_payment_id` exists (type: text)
- Column `mercadopago_preference_id` exists (type: text)
- Column `access_expires_at` exists (type: timestamp with time zone)

**Status:** PASS / FAIL

---

#### TC1.2: Verify user_access table schema

**Test Description:** Ensure user_access table is properly created

**Verification Query:**
```sql
SELECT
  column_name,
  data_type,
  is_nullable
FROM
  information_schema.columns
WHERE
  table_schema = 'public'
  AND table_name = 'user_access'
ORDER BY
  ordinal_position;
```

**Expected Result:**
- Table exists with columns: `id`, `user_id`, `access_type`, `payment_id`, `expires_at`, `is_active`, `created_at`, `updated_at`
- `access_type` has CHECK constraint for values ('subscription', 'one_time')
- Unique constraint exists on (`user_id`, `access_type`)

**Status:** PASS / FAIL

---

#### TC1.3: Verify indexes are created

**Test Description:** Ensure performance indexes exist

**Verification Query:**
```sql
SELECT
  indexname,
  indexdef
FROM
  pg_indexes
WHERE
  schemaname = 'public'
  AND tablename IN ('payments', 'user_access')
ORDER BY
  tablename, indexname;
```

**Expected Result:**
- Index `idx_payments_user_status` on payments (user_id, status)
- Index `idx_payments_provider` on payments (payment_provider)
- Index `idx_user_access_active` on user_access (user_id, is_active, expires_at)

**Status:** PASS / FAIL

---

#### TC1.4: Verify RLS policies

**Test Description:** Ensure Row Level Security policies are configured

**Verification Query:**
```sql
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM
  pg_policies
WHERE
  schemaname = 'public'
  AND tablename IN ('payments', 'user_access')
ORDER BY
  tablename, policyname;
```

**Expected Result:**
- `user_access` table has RLS enabled
- Policy "Users can read own access" exists
- Policy "Service role full access" exists

**Status:** PASS / FAIL

---

#### TC1.5: Test foreign key constraints

**Test Description:** Verify referential integrity

**Verification Query:**
```sql
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM
  information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE
  tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN ('payments', 'user_access');
```

**Expected Result:**
- `user_access.user_id` references `auth.users(id)`
- `user_access.payment_id` references `payments(id)`
- Both have `ON DELETE CASCADE`

**Status:** PASS / FAIL

---

## Task 7.2: Test Payment API Endpoint

### Objective
Verify MercadoPago API endpoints respond correctly to various requests.

### Prerequisites
- Server running on port 3001
- Valid MercadoPago test credentials

### Start Server for Testing

```bash
# Create tmux session for server
tmux new-session -d -s qa-payment-api "cd /Users/forato-dr/Desktop/projects/limpa-nome-expresso-site/server && pnpm run dev"

# Wait for server to start (check for "Server running" message)
sleep 5

# Verify server is running
curl -s http://localhost:3001/api/health | jq .
```

**Expected Output:** `{"status":"ok","timestamp":"..."}`

---

### Test Cases

#### TC2.1: Create payment preference - Success

**Test Description:** Successfully create a MercadoPago preference

**Command:**
```bash
curl -X POST http://localhost:3001/api/mercadopago/create-preference \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "id": "test_product_001",
        "title": "Test Product",
        "quantity": 1,
        "unit_price": 149.90
      }
    ],
    "metadata": {
      "user_id": "test_user_123",
      "order_id": "test_order_456"
    }
  }' | jq .
```

**Expected Result:**
```json
{
  "success": true,
  "preferenceId": "string (preference ID)",
  "initPoint": "string (production URL)",
  "sandboxInitPoint": "string (sandbox URL)",
  "checkoutUrl": "string (sandbox URL)"
}
```

**Status:** PASS / FAIL

---

#### TC2.2: Create payment preference - Missing items

**Test Description:** Handle missing items array

**Command:**
```bash
curl -X POST http://localhost:3001/api/mercadopago/create-preference \
  -H "Content-Type: application/json" \
  -d '{}' | jq .
```

**Expected Result:**
```json
{
  "error": "Items are required",
  "details": "Items must be a non-empty array"
}
```

**Status:** PASS / FAIL

---

#### TC2.3: Create payment preference - Invalid item values

**Test Description:** Handle invalid quantity and price

**Command:**
```bash
curl -X POST http://localhost:3001/api/mercadopago/create-preference \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "id": "test_product",
        "title": "Test",
        "quantity": 0,
        "unit_price": -10
      }
    ]
  }' | jq .
```

**Expected Result:**
```json
{
  "error": "Invalid item values",
  "details": "Quantity and unit_price must be greater than 0"
}
```

**Status:** PASS / FAIL

---

#### TC2.4: Get payment details

**Test Description:** Retrieve payment information by ID

**Command:**
```bash
# First, create a preference and get the payment ID from MercadoPago dashboard
# Then use that ID to test this endpoint

curl -X GET http://localhost:3001/api/mercadopago/payment/PAYMENT_ID_HERE \
  -H "Content-Type: application/json" | jq .
```

**Expected Result:**
```json
{
  "success": true,
  "payment": {
    "id": "string",
    "status": "approved|pending|rejected",
    "status_detail": "string",
    "payment_method_id": "string",
    "payment_type_id": "string",
    "transaction_amount": number,
    "currency_id": "BRL",
    "date_approved": "ISO date",
    "date_created": "ISO date",
    "metadata": {},
    "external_reference": "string"
  }
}
```

**Status:** PASS / FAIL

---

#### TC2.5: Get MercadoPago configuration

**Test Description:** Retrieve public key for frontend

**Command:**
```bash
curl -X GET http://localhost:3001/api/mercadopago/config | jq .
```

**Expected Result:**
```json
{
  "publicKey": "APP_USR-xxxxx",
  "sandbox": true
}
```

**Status:** PASS / FAIL

---

### Cleanup

```bash
# Kill server tmux session
tmux kill-session -t qa-payment-api
```

---

## Task 7.3: Test Checkout Flow End-to-End

### Objective
Verify complete checkout flow from product selection to payment confirmation.

### Prerequisites
- Frontend running on port 3000
- Backend running on port 3001
- Test user account created in Supabase
- MercadoPago test credentials configured

### Test Cases

#### TC3.1: Unauthorized user redirect

**Test Description:** Verify unauthenticated users are redirected to home

**Steps:**
1. Open browser in incognito/private mode
2. Navigate directly to `http://localhost:3000/area-do-cliente`
3. Observe redirect behavior

**Expected Result:**
- User is redirected to `/` (home page)
- No access to protected area

**Status:** PASS / FAIL

---

#### TC3.2: Authenticated user without payment - Redirect to checkout

**Test Description:** Verify authenticated users without active access are redirected to checkout

**Steps:**
1. Create test user via registration or Supabase dashboard
2. Login with test user credentials
3. Navigate directly to `http://localhost:3000/area-do-cliente`
4. Observe redirect behavior

**Expected Result:**
- User is redirected to `/checkout`
- Checkout page displays payment options
- Price shows R$ 149,90

**Status:** PASS / FAIL

---

#### TC3.3: Initiate checkout flow

**Test Description:** Complete checkout initiation

**Steps:**
1. Login with test user
2. Navigate to `/checkout`
3. Click "Pagar com MercadoPago" button
4. Observe redirect to MercadoPago

**Expected Result:**
- Loading state displays during preference creation
- User is redirected to MercadoPago checkout page (sandbox)
- Checkout page shows correct product details:
  - Title: "CPF Blindado - Acesso Premium 12 Meses"
  - Price: R$ 149,90
  - Currency: BRL

**Status:** PASS / FAIL

---

#### TC3.4: Complete payment - Success scenario

**Test Description:** Complete payment flow with successful payment

**Steps:**
1. From MercadoPago checkout, select test payment method:
   - Payment method: "Pix" (instant approval)
   - OR use credit card test cards:
     - Card number: `50314314321` (approved)
     - Card number: `50314314322` (pending)
     - Card number: `50314314323` (rejected)
2. Complete payment process
3. Wait for redirect back to application

**Expected Result:**
- Payment is processed successfully
- User is redirected to `/checkout/sucesso`
- Success message displays
- User can now access `/area-do-cliente`

**Database Verification:**
```sql
-- Verify payment record created
SELECT
  id,
  user_id,
  payment_provider,
  mercadopago_payment_id,
  amount,
  status,
  access_expires_at
FROM payments
WHERE user_id = 'TEST_USER_ID'
ORDER BY created_at DESC
LIMIT 1;

-- Verify user_access record created
SELECT
  id,
  user_id,
  access_type,
  expires_at,
  is_active
FROM user_access
WHERE user_id = 'TEST_USER_ID'
ORDER BY created_at DESC
LIMIT 1;
```

**Expected Database State:**
- Payment record with `status = 'succeeded'`
- Payment record with `payment_provider = 'mercadopago'`
- `access_expires_at` is ~12 months from now
- User access record with `is_active = true`
- User access record with `access_type = 'one_time'`

**Status:** PASS / FAIL

---

#### TC3.5: Complete payment - Failure scenario

**Test Description:** Handle payment failure gracefully

**Steps:**
1. Initiate new checkout
2. Use rejected test card: `50314314323`
3. Complete payment process

**Expected Result:**
- Payment is rejected
- User is redirected to `/checkout/falha`
- Error message displays
- No payment record created in database
- No user_access record created
- User can retry payment

**Status:** PASS / FAIL

---

#### TC3.6: Complete payment - Pending scenario

**Test Description:** Handle pending payment state

**Steps:**
1. Initiate new checkout
2. Use pending test card: `50314314322`
3. Complete payment process

**Expected Result:**
- Payment is in pending state
- User is redirected to `/checkout/pendente`
- Information message displays
- User can check back later or retry

**Status:** PASS / FAIL

---

### Manual Testing Notes

- For each test, clear browser cookies/storage between runs
- Test with different browsers (Chrome, Firefox, Safari)
- Test on mobile viewport (responsive design)
- Verify all loading states and error messages display correctly

---

## Task 7.4: Test Route Protection

### Objective
Verify protected routes properly enforce authentication and payment requirements.

### Test Cases

#### TC4.1: Protected route - No authentication

**Test Description:** Unauthenticated user cannot access protected routes

**Command:** Manual browser test
1. Logout (clear all cookies and storage)
2. Navigate to `http://localhost:3000/area-do-cliente`

**Expected Result:**
- Redirected to `/` (home page)
- No access to protected content

**Status:** PASS / FAIL

---

#### TC4.2: Protected route - Authenticated but no payment

**Test Description:** Authenticated user without payment is redirected to checkout

**Command:** Manual browser test
1. Login with test user (no active payment)
2. Navigate to `http://localhost:3000/area-do-cliente`

**Expected Result:**
- Redirected to `/checkout`
- Can see checkout page
- Cannot access protected content

**Status:** PASS / FAIL

---

#### TC4.3: Protected route - Authenticated with active payment

**Test Description:** Authenticated user with active payment can access protected routes

**Command:** Manual browser test
1. Login with test user (with active payment)
2. Navigate to `http://localhost:3000/area-do-cliente`

**Expected Result:**
- Page loads successfully
- Can see protected content
- No redirect occurs

**Status:** PASS / FAIL

---

#### TC4.4: Protected route with requirePayment=false

**Test Description:** Routes that only require authentication

**Note:** This test applies if you have routes with `requirePayment={false}` in ProtectedRoute component

**Command:** Manual browser test
1. Login with test user (no payment)
2. Navigate to route with `requirePayment={false}`

**Expected Result:**
- Page loads successfully
- No redirect to checkout

**Status:** PASS / FAIL

---

#### TC4.5: Session expiration handling

**Test Description:** Verify behavior when session expires

**Command:** Manual browser test
1. Login with test user
2. Manually clear Supabase session from storage:
   - Open browser DevTools
   - Application > Local Storage > Remove `supabase.auth.token`
3. Navigate to protected route
4. Refresh page

**Expected Result:**
- User is redirected to `/`
- AuthContext detects missing session
- Loading state resolves properly

**Status:** PASS / FAIL

---

## Task 7.5: Test Payment Status Refresh

### Objective
Verify payment status checks work correctly and access is granted properly.

### Test Cases

#### TC5.1: Check payment status endpoint - No access

**Test Description:** API correctly reports no access for new user

**Command:**
```bash
# First, get auth token after login
# Use browser DevTools > Application > Local Storage > supabase.auth.token
# Extract access_token

curl -X GET http://localhost:3001/api/payments/status \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -H "Content-Type: application/json" | jq .
```

**Expected Result:**
```json
{
  "hasActiveAccess": false,
  "accessType": null,
  "expiresAt": null
}
```

**Status:** PASS / FAIL

---

#### TC5.2: Check payment status endpoint - With active access

**Test Description:** API correctly reports active access after payment

**Command:**
```bash
# Complete a payment first, then use auth token

curl -X GET http://localhost:3001/api/payments/status \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -H "Content-Type: application/json" | jq .
```

**Expected Result:**
```json
{
  "hasActiveAccess": true,
  "accessType": "one_time",
  "expiresAt": "2027-03-02T12:00:00.000Z"
}
```

**Status:** PASS / FAIL

---

#### TC5.3: Payment status refresh in frontend

**Test Description:** PaymentContext properly refreshes status

**Command:** Manual browser test
1. Login with test user (no payment)
2. Navigate to `/checkout`
3. Observe `hasActiveAccess` state
4. Complete payment in separate tab
5. Return to original tab and refresh
6. Observe `hasActiveAccess` state

**Expected Result:**
- Initial state: `hasActiveAccess = false`
- After payment + refresh: `hasActiveAccess = true`
- UI updates to reflect access status
- Protected routes become accessible

**Status:** PASS / FAIL

---

#### TC5.4: Expired access handling

**Test Description:** Verify expired access is not considered active

**Database Setup:**
```sql
-- Create expired access record for testing
INSERT INTO user_access (user_id, access_type, expires_at, is_active)
VALUES (
  'TEST_USER_ID',
  'one_time',
  NOW() - INTERVAL '1 day',
  false
);
```

**Command:**
```bash
curl -X GET http://localhost:3001/api/payments/status \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -H "Content-Type: application/json" | jq .
```

**Expected Result:**
```json
{
  "hasActiveAccess": false,
  "accessType": null,
  "expiresAt": null
}
```

**Cleanup:**
```sql
DELETE FROM user_access WHERE user_id = 'TEST_USER_ID';
```

**Status:** PASS / FAIL

---

#### TC5.5: Concurrent access checks

**Test Description:** Multiple tabs/pages checking status simultaneously

**Command:** Manual browser test
1. Login with test user (with active access)
2. Open 3-5 tabs to protected routes simultaneously
3. Observe loading states and final states

**Expected Result:**
- All tabs resolve to correct state
- No race conditions or infinite loading
- All tabs grant access appropriately

**Status:** PASS / FAIL

---

## Task 7.6: Test Webhook Processing

### Objective
Verify MercadoPago webhooks are received and processed correctly.

### Prerequisites
- **Public URL required** (webhooks cannot be tested with localhost)
- Use ngrok or similar for local testing:
  ```bash
  ngrok http 3001
  ```

### Setup ngrok for Testing

```bash
# Install ngrok if not present
brew install ngrok

# Start ngrok tunnel
ngrok http 3001

# Note the public URL (e.g., https://abc123.ngrok.io)
```

### Configure Webhook in MercadoPago

1. Go to MercadoPago Developers Dashboard
2. Navigate to "Webhooks" section
3. Add new webhook URL:
   - Production: `https://your-domain.com/api/mercadopago/webhook`
   - Testing: `https://abc123.ngrok.io/api/mercadopago/webhook`
4. Select events: `payment`
5. Save configuration

### Test Cases

#### TC6.1: Webhook endpoint accessibility

**Test Description:** Verify webhook endpoint is reachable

**Command:**
```bash
curl -X POST https://your-domain.com/api/mercadopago/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "type": "payment",
    "data": {
      "id": "123456789"
    }
  }'
```

**Expected Result:**
- HTTP 200 status
- Response: `{"received": true}`
- No errors in server logs

**Status:** PASS / FAIL

---

#### TC6.2: Webhook processing - Successful payment

**Test Description:** Verify webhook creates payment and access records

**Steps:**
1. Create a test payment via MercadoPago checkout
2. Use test card `50314314321` (approved)
3. Wait for webhook notification
4. Check server logs for success message

**Expected Server Log:**
```
✅ Payment approved: PAYMENT_ID, access granted to user: USER_ID until EXPIRES_AT
```

**Database Verification:**
```sql
-- Verify records created
SELECT
  p.id,
  p.user_id,
  p.payment_provider,
  p.mercadopago_payment_id,
  p.status,
  p.access_expires_at,
  ua.id as access_id,
  ua.access_type,
  ua.is_active
FROM payments p
LEFT JOIN user_access ua ON ua.user_id = p.user_id
WHERE p.mercadopago_payment_id = 'PAYMENT_ID'
ORDER BY p.created_at DESC
LIMIT 1;
```

**Expected Result:**
- Payment record created with `status = 'succeeded'`
- User access record created with `is_active = true`
- `access_expires_at` is 12 months from payment date

**Status:** PASS / FAIL

---

#### TC6.3: Webhook idempotency

**Test Description:** Verify duplicate webhooks don't create duplicate records

**Steps:**
1. Complete a test payment
2. Manually resend webhook via MercadoPago dashboard (or use curl to replay)
3. Verify database for duplicates

**Command:**
```sql
-- Check for duplicate payment records
SELECT
  mercadopago_payment_id,
  COUNT(*) as count
FROM payments
WHERE mercadopago_payment_id = 'PAYMENT_ID'
GROUP BY mercadopago_payment_id
HAVING COUNT(*) > 1;
```

**Expected Result:**
- Query returns empty (no duplicates)
- Server log shows: `Payment PAYMENT_ID already processed, skipping`

**Status:** PASS / FAIL

---

#### TC6.4: Webhook error handling

**Test Description:** Verify webhook handles errors gracefully

**Command:**
```bash
curl -X POST https://your-domain.com/api/mercadopago/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "type": "payment",
    "data": {
      "id": "invalid_payment_id"
    }
  }'
```

**Expected Result:**
- HTTP 200 status (always returns 200 to avoid retries)
- Response contains error details
- Server logs error but doesn't crash
- No database records created

**Status:** PASS / FAIL

---

#### TC6.5: Webhook with non-approved payment

**Test Description:** Verify webhook only processes approved payments

**Steps:**
1. Create test payment with rejected card: `50314314323`
2. Wait for webhook notification
3. Check database

**Database Verification:**
```sql
-- Check if payment record was created
SELECT COUNT(*) FROM payments WHERE mercadopago_payment_id = 'PAYMENT_ID';
```

**Expected Result:**
- Query returns 0 (no record created for non-approved payment)
- Server logs show payment status check

**Status:** PASS / FAIL

---

### Manual Webhook Testing via MercadoPago Dashboard

**Steps:**
1. Go to MercadoPago Developers Dashboard
2. Navigate to "Webhooks" section
3. Find your configured webhook
4. Click "Test webhook" or send test notification
5. Monitor server logs for incoming webhook
6. Verify database records created correctly

---

## Environment Configuration

### Local Development (.env)

```bash
# Application
PORT=3001
PUBLIC_URL=http://localhost:3000
NODE_ENV=development

# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# MercadoPago (Test/Sandbox)
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxx-xxxxx-xxxxx-xxxxx
MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxxx-xxxxx-xxxxx-xxxxx
```

### Production (.env.production)

```bash
# Application
PORT=3001
PUBLIC_URL=https://your-domain.com
NODE_ENV=production

# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key

# MercadoPago (Production)
MERCADOPAGO_ACCESS_TOKEN=PROD_ACCESS_TOKEN
MERCADOPAGO_PUBLIC_KEY=PROD_PUBLIC_KEY
```

---

## Troubleshooting

### Common Issues

#### Issue 1: Webhook not receiving notifications

**Symptoms:**
- No webhook logs in server
- Payment completes but no access granted

**Solutions:**
1. Verify webhook URL is correct in MercadoPago dashboard
2. Check webhook URL is accessible from internet (use ngrok for local testing)
3. Verify no firewall blocking MercadoPago IPs
4. Check MercadoPago webhook logs for delivery failures

---

#### Issue 2: CORS errors

**Symptoms:**
- Browser console shows CORS errors
- API calls fail from frontend

**Solutions:**
1. Verify CORS configuration in server/index.ts
2. Ensure frontend origin is in allowedOrigins array
3. Check for typos in origin URLs

---

#### Issue 3: Payment not creating access

**Symptoms:**
- Payment succeeds but user can't access protected routes
- Database shows payment but no user_access record

**Solutions:**
1. Check server logs for webhook processing errors
2. Verify webhook URL is correct (not localhost)
3. Manually trigger webhook from MercadoPago dashboard
4. Check user_id matches in payment and user_access tables

---

#### Issue 4: Infinite loading on protected routes

**Symptoms:**
- Protected route shows loading spinner forever
- No redirect occurs

**Solutions:**
1. Check browser console for errors
2. Verify PaymentContext is properly initialized
3. Check auth token is valid
4. Test /api/payments/status endpoint directly

---

#### Issue 5: Database constraint violations

**Symptoms:**
- Webhook processing fails with constraint error
- Server logs show duplicate key errors

**Solutions:**
1. Check for existing records before webhook processing
2. Verify idempotency check is working
3. Clean up test data between runs
4. Check unique constraints are correct

---

### Useful Queries

**Find all payments for a user:**
```sql
SELECT * FROM payments WHERE user_id = 'USER_UUID' ORDER BY created_at DESC;
```

**Check active access:**
```sql
SELECT * FROM user_access WHERE user_id = 'USER_UUID' AND is_active = true AND expires_at > NOW();
```

**Clean up test data:**
```sql
DELETE FROM payments WHERE user_id = 'TEST_USER_UUID';
DELETE FROM user_access WHERE user_id = 'TEST_USER_UUID';
```

**View recent webhook-processed payments:**
```sql
SELECT
  p.id,
  p.user_id,
  p.mercadopago_payment_id,
  p.status,
  p.created_at
FROM payments p
WHERE p.payment_provider = 'mercadopago'
ORDER BY p.created_at DESC
LIMIT 10;
```

---

## Test Execution Summary

### Test Matrix

| Task | Test Cases | Automated | Manual | Total |
|------|-----------|-----------|--------|-------|
| 7.1 | 5 | 5 | 0 | 5 |
| 7.2 | 5 | 5 | 0 | 5 |
| 7.3 | 6 | 0 | 6 | 6 |
| 7.4 | 5 | 0 | 5 | 5 |
| 7.5 | 5 | 2 | 3 | 5 |
| 7.6 | 5 | 2 | 3 | 5 |
| **Total** | **31** | **14** | **17** | **31** |

### Execution Checklist

- [ ] All prerequisites verified (tmux, curl, psql, test account)
- [ ] Environment variables configured
- [ ] Database schema verified (TC1.1 - TC1.5)
- [ ] Payment API endpoints tested (TC2.1 - TC2.5)
- [ ] Checkout flow tested end-to-end (TC3.1 - TC3.6)
- [ ] Route protection verified (TC4.1 - TC4.5)
- [ ] Payment status refresh tested (TC5.1 - TC5.5)
- [ ] Webhook processing tested (TC6.1 - TC6.5)

### Sign-off

**Tester:** _______________________
**Date:** _______________________
**Environment:** Local / Production
**MercadoPago Mode:** Sandbox / Production
**Results:** ___ Passed / ___ Failed / ___ Skipped

**Notes:**
___________________________________________________________________
___________________________________________________________________
___________________________________________________________________

---

## Appendix: Test Data

### MercadoPago Test Cards

| Card Number | Payment Method | Result |
|-------------|----------------|--------|
| 50314314321 | Any | Approved |
| 50314314322 | Any | Pending |
| 50314314323 | Any | Rejected |
| 42356431 | Mastercard | Approved |
| 42356432 | Mastercard | Call for authorization |
| 42356433 | Mastercard | Insufficient funds |

### Test User Credentials

For testing, create a user in Supabase dashboard:
- Email: `test@limpanome.com`
- Password: `Test123!@#`
- Confirm email manually in Supabase dashboard

---

## Document Change Log

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-03-02 | Initial creation | QA Tester |
