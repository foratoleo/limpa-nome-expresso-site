# Quick Start Testing Guide

**File:** /Users/forato-dr/Desktop/projects/limpa-nome-expresso-site/server/database-scripts/TESTING_CHECKLIST.md
**Created:** 2026-03-02

## Overview

Comprehensive testing documentation has been created for the MercadoPago payment integration. The testing checklist contains **31 test cases** across **6 testing tasks**.

## Test Summary

### Test Matrix

| Task | Description | Test Cases | Type |
|------|-------------|------------|------|
| **7.1** | Database Schema | 5 | Automated (SQL queries) |
| **7.2** | Payment API Endpoint | 5 | Automated (curl) |
| **7.3** | Checkout Flow End-to-End | 6 | Manual (browser) |
| **7.4** | Route Protection | 5 | Manual (browser) |
| **7.5** | Payment Status Refresh | 5 | Mixed (curl + browser) |
| **7.6** | Webhook Processing | 5 | Mixed (curl + dashboard) |
| **Total** | | **31** | **14 automated / 17 manual** |

## Quick Reference Commands

### Database Verification (TC1.x)

```sql
-- Check payments table schema
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'payments';

-- Check user_access records
SELECT * FROM user_access WHERE user_id = 'USER_UUID';

-- Check recent payments
SELECT * FROM payments ORDER BY created_at DESC LIMIT 10;
```

### API Testing (TC2.x)

```bash
# Health check
curl http://localhost:3001/api/health

# Create payment preference
curl -X POST http://localhost:3001/api/mercadopago/create-preference \
  -H "Content-Type: application/json" \
  -d '{"items":[{"id":"test","title":"Test","quantity":1,"unit_price":149.90}]}'

# Get payment status
curl http://localhost:3001/api/payments/status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Server Testing with tmux

```bash
# Start server in tmux
tmux new-session -d -s qa-test "pnpm run dev"

# Wait and verify
sleep 5 && curl http://localhost:3001/api/health

# Cleanup
tmux kill-session -t qa-test
```

### Webhook Testing (TC6.x)

```bash
# Setup ngrok for local webhook testing
ngrok http 3001

# Test webhook endpoint
curl -X POST https://your-domain.com/api/mercadopago/webhook \
  -H "Content-Type: application/json" \
  -d '{"type":"payment","data":{"id":"123456789"}}'
```

## Key Test Cases

### Critical Path Tests

1. **TC3.4:** Complete payment - Success scenario (end-to-end)
2. **TC4.3:** Protected route - Authenticated with active payment
3. **TC5.2:** Check payment status endpoint - With active access
4. **TC6.2:** Webhook processing - Successful payment

### Security Tests

1. **TC4.1:** Protected route - No authentication
2. **TC4.2:** Protected route - Authenticated but no payment
3. **TC6.3:** Webhook idempotency (duplicate prevention)

### Edge Cases

1. **TC3.5:** Complete payment - Failure scenario
2. **TC3.6:** Complete payment - Pending scenario
3. **TC5.4:** Expired access handling
4. **TC6.5:** Webhook with non-approved payment

## MercadoPago Test Cards

| Card Number | Result |
|-------------|--------|
| 50314314321 | Approved |
| 50314314322 | Pending |
| 50314314323 | Rejected |

## Prerequisites Checklist

- [ ] tmux installed
- [ ] curl installed
- [ ] psql or Supabase SQL Editor access
- [ ] Node.js v18+ and pnpm
- [ ] MercadoPago test account
- [ ] Environment variables configured (.env)
- [ ] Port 3001 available
- [ ] Supabase migrations applied

## Environment Variables Required

```bash
# Server
PORT=3001
PUBLIC_URL=http://localhost:3000

# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# MercadoPago (Test)
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxx
MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxxx
```

## Database Migrations

Ensure migrations are applied in order:

```sql
-- 1. Initial schema
-- supabase/migrations/001_initial_schema.sql

-- 2. MercadoPago schema
-- server/database-scripts/001_add_mercadopago_schema.sql

-- 3. User access table
-- server/database-scripts/002_create_user_access.sql
```

## Full Documentation

See complete testing guide:
```
server/database-scripts/TESTING_CHECKLIST.md
```

## Test Execution Workflow

1. **Setup Phase**
   - Verify prerequisites
   - Check environment variables
   - Start server with tmux

2. **Database Tests**
   - Run all TC1.x queries
   - Verify schema, indexes, RLS policies

3. **API Tests**
   - Run all TC2.x curl commands
   - Verify endpoints respond correctly

4. **Manual Tests**
   - Execute TC3.x (checkout flow)
   - Execute TC4.x (route protection)
   - Execute TC5.x (status refresh)

5. **Webhook Tests**
   - Setup ngrok tunnel
   - Execute TC6.x tests
   - Verify webhook processing

6. **Cleanup**
   - Kill tmux sessions
   - Clean up test data
   - Document results

## Sign-off Template

```
Tester: _______________________
Date: _______________________
Environment: Local / Production
Results: ___ Passed / ___ Failed / ___ Skipped

Notes:
```

## Next Steps

1. Review full testing checklist
2. Set up test environment
3. Execute automated tests (TC1.x, TC2.x)
4. Perform manual tests (TC3.x - TC6.x)
5. Document results
6. Address any failures
7. Re-test until all pass
