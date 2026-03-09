# Kiwify Payment Integration

This document provides comprehensive documentation for the Kiwify payment integration in the CPF Blindado application. The integration enables customers to purchase premium access through Kiwify's checkout system as an alternative to MercadoPago.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Environment Setup](#environment-setup)
4. [API Reference](#api-reference)
5. [Webhook Configuration](#webhook-configuration)
6. [Database Schema](#database-schema)
7. [Frontend Integration](#frontend-integration)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)
10. [Security Considerations](#security-considerations)

---

## Overview

### Purpose

The Kiwify integration provides:
- Alternative payment gateway for Brazilian customers
- Support for PIX, credit card, and boleto payments
- Automatic user provisioning upon successful payment
- 12-month premium access duration (matching MercadoPago)
- Webhook-based payment confirmation

### Key Features

| Feature | Description |
|---------|-------------|
| OAuth 2.0 Authentication | Secure API authentication with 96-hour token validity |
| Webhook Event Handling | Real-time payment notifications |
| Idempotency Protection | Prevents duplicate access grants |
| Rate Limiting Awareness | Exponential backoff for API rate limits |
| Comprehensive Logging | Full audit trail for all payment events |

### Product Configuration

| Property | Value |
|----------|-------|
| Product ID | `limpa_nome_expresso_12_months` |
| Title | CPF Blindado - Acesso Premium 12 Meses |
| Price | R$ 149.90 |
| Currency | BRL |
| Duration | 12 months |

---

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              PAYMENT FLOW                                    │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Customer   │────>│   Kiwify     │────>│    Server    │────>│   Supabase   │
│   Browser    │     │   Checkout   │     │   Webhook    │     │   Database   │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
       │                    │                    │                    │
       │ 1. Click Buy       │                    │                    │
       │───────────────────>│                    │                    │
       │                    │                    │                    │
       │ 2. Complete        │                    │                    │
       │    Payment         │                    │                    │
       │───────────────────>│                    │                    │
       │                    │                    │                    │
       │                    │ 3. Webhook Event   │                    │
       │                    │───────────────────>│                    │
       │                    │                    │                    │
       │                    │                    │ 4. Create User     │
       │                    │                    │───────────────────>│
       │                    │                    │                    │
       │                    │                    │ 5. Grant Access    │
       │                    │                    │───────────────────>│
       │                    │                    │                    │
       │                    │                    │ 6. Send Email      │
       │                    │                    │───────────────────>│
       │                    │                    │                    │
       │ 7. Redirect to     │                    │                    │
       │    Success Page    │                    │                    │
       │<───────────────────│                    │                    │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

### File Structure

```
project/
├── server/
│   ├── lib/
│   │   ├── kiwify.ts              # API client with OAuth
│   │   ├── kiwify-config.ts       # Configuration constants
│   │   ├── kiwify-types.ts        # TypeScript interfaces
│   │   └── kiwify-logger.ts       # Logging utility
│   ├── routes/
│   │   └── kiwify.ts              # Webhook endpoints
│   ├── tests/
│   │   └── kiwify-token.test.ts   # Unit tests
│   └── database-scripts/
│       └── 003_add_kiwify_schema.sql  # Database migration
├── client/
│   └── src/
│       └── lib/
│           └── kiwify-config.ts   # Frontend configuration
├── api/
│   └── create-preference-kiwify.js # Netlify function
└── docs/
    └── integrations/
        └── kiwify.md              # This documentation
```

### Data Flow

1. **Checkout Initiation**: User clicks "Comprar via Kiwify" button
2. **Redirect to Kiwify**: Frontend redirects to Kiwify checkout page
3. **Payment Processing**: User completes payment on Kiwify's hosted checkout
4. **Webhook Delivery**: Kiwify sends webhook to `/api/webhooks/kiwify`
5. **Token Verification**: Server verifies webhook authenticity
6. **Sale Retrieval**: Server fetches complete sale details from Kiwify API
7. **User Provisioning**: Server creates/updates user in Supabase
8. **Access Grant**: Server grants 12-month premium access
9. **Email Notification**: Server sends confirmation email to customer
10. **Redirect**: User redirected to success page

---

## Environment Setup

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `KIWIFY_CLIENT_ID` | OAuth client ID (UUID format) | `21f3b7c4-2734-44d5-9923-7de0848558bb` |
| `KIWIFY_CLIENT_SECRET` | OAuth client secret | `4232bee972fe8026f3e3a9eab201dfeb...` |
| `KIWIFY_ACCOUNT_ID` | Kiwify account identifier | `QVfvaU7dhwBCh5X` |
| `KIWIFY_WEBHOOK_TOKEN` | Token for webhook verification | `your-secure-token` |
| `KIWIFY_PRODUCT_SLUG` | Product slug in Kiwify (optional) | `cpf-blindado-premium` |

### Obtaining Credentials

1. **Log in to Kiwify Dashboard**
   - Go to: https://kiwify.com.br
   - Navigate to your account dashboard

2. **Create API Credentials**
   - Go to: Apps > API > Criar API Key
   - Click "Criar nova chave"
   - Copy the following values:
     - `client_id` (UUID format)
     - `client_secret` (64-character hex string)
     - `account_id` (short alphanumeric string)

3. **Configure Webhook Token**
   - Generate a secure random token (e.g., using `openssl rand -hex 32`)
   - Save this token - you'll need it for webhook configuration

4. **Update Environment File**

```bash
# .env.local
KIWIFY_CLIENT_ID=21f3b7c4-2734-44d5-9923-7de0848558bb
KIWIFY_CLIENT_SECRET=4232bee972fe8026f3e3a9eab201dfeb2317e2b602158822a55136ff5b8e85bb
KIWIFY_ACCOUNT_ID=QVfvaU7dhwBCh5X
KIWIFY_WEBHOOK_TOKEN=your-secure-webhook-token-here
```

### Configuration Check

Verify configuration with the health endpoint:

```bash
curl https://your-domain.com/api/kiwify/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Kiwify integration is healthy"
}
```

---

## API Reference

### Kiwify Public API v1

**Base URL**: `https://public-api.kiwify.com`

#### OAuth Token Endpoint

```
POST /v1/oauth/token
```

**Request Body**:
```json
{
  "client_id": "21f3b7c4-2734-44d5-9923-7de0848558bb",
  "client_secret": "4232bee972fe8026f3e3a9eab201dfeb...",
  "grant_type": "client_credentials"
}
```

**Response**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 345600,
  "created_at": "2024-01-15T10:30:00Z"
}
```

**Notes**:
- Token validity: 96 hours (345,600 seconds)
- Tokens are cached and auto-refreshed 1 hour before expiry
- Include `Authorization: Bearer {token}` header in subsequent requests

#### Get Sale Endpoint

```
GET /v1/sales/{sale_id}
```

**Headers**:
| Header | Value | Required |
|--------|-------|----------|
| `Authorization` | `Bearer {access_token}` | Yes |
| `x-kiwify-account-id` | Your account ID | Yes |

**Response**:
```json
{
  "id": "sale_abc123",
  "order_number": "ORD-2024-001",
  "customer": {
    "id": "cust_xyz",
    "name": "Joao Silva",
    "email": "joao@example.com",
    "cpf": "***123456**",
    "mobile": "+5511999999999"
  },
  "product": {
    "id": "prod_001",
    "name": "CPF Blindado - Acesso Premium 12 Meses",
    "price": 14990,
    "currency": "BRL"
  },
  "payment": {
    "method": "pix",
    "status": "paid",
    "amount": 14990,
    "paid_at": "2024-01-15T10:35:00Z"
  },
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:35:00Z"
}
```

#### List Sales Endpoint

```
GET /v1/sales
```

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `start_date` | ISO 8601 | Start date filter (max 90 days from end_date) |
| `end_date` | ISO 8601 | End date filter |
| `customer_email` | string | Filter by customer email |
| `status` | string | Filter by payment status |
| `page` | integer | Page number (default: 1) |
| `per_page` | integer | Items per page (default: 20, max: 100) |

**Rate Limits**:
- 100 requests per minute
- Retry with exponential backoff on 429 responses

### Internal API Endpoints

#### Webhook Endpoint

```
POST /api/webhooks/kiwify
```

**Headers**:
| Header | Description |
|--------|-------------|
| `x-kiwify-token` | Webhook verification token |
| `Content-Type` | `application/json` |

**Request Body**:
```json
{
  "event": "compra_aprovada",
  "sale_id": "sale_abc123",
  "order_id": "ORD-2024-001",
  "customer_email": "joao@example.com",
  "customer_name": "Joao Silva",
  "timestamp": "2024-01-15T10:35:00Z"
}
```

**Response** (200 OK):
```json
{
  "received": true,
  "event": "compra_aprovada",
  "saleId": "sale_abc123",
  "success": true
}
```

#### Configuration Endpoint

```
GET /api/kiwify/config
```

**Response**:
```json
{
  "configured": true,
  "productId": "limpa_nome_expresso_12_months",
  "productTitle": "CPF Blindado - Acesso Premium 12 Meses",
  "price": 149.90,
  "currency": "BRL",
  "durationMonths": 12
}
```

#### Health Check Endpoint

```
GET /api/kiwify/health
```

**Response** (healthy):
```json
{
  "status": "ok",
  "message": "Kiwify integration is healthy"
}
```

**Response** (not configured):
```json
{
  "status": "not_configured",
  "message": "Kiwify integration not configured"
}
```

#### Netlify Function - Create Checkout URL

```
POST /.netlify/functions/create-preference-kiwify
```

**Request Body**:
```json
{
  "userId": "user_123",
  "email": "customer@example.com",
  "metadata": {
    "utm_source": "google",
    "utm_medium": "cpc",
    "utm_campaign": "premium"
  }
}
```

**Response**:
```json
{
  "success": true,
  "checkoutUrl": "https://pay.kiwify.com.br/cpf-blindado-premium?email=customer%40example.com&external_reference=user_123&utm_source=google",
  "product": {
    "id": "limpa_nome_expresso_12_months",
    "title": "CPF Blindado - Acesso Premium 12 Meses",
    "unit_price": 149.90,
    "currency": "BRL",
    "duration": "12 meses de acesso"
  },
  "redirectUrls": {
    "success": "https://cpfblindado.com/checkout/sucesso?source=kiwify",
    "failure": "https://cpfblindado.com/checkout/falha?source=kiwify"
  }
}
```

---

## Webhook Configuration

### Supported Webhook Events

| Event | Description | Action Taken |
|-------|-------------|--------------|
| `compra_aprovada` | Payment approved | Create user, grant access, send email |
| `compra_recusada` | Payment refused | Log event, no access granted |
| `compra_reembolsada` | Payment refunded | Revoke access, notify user |
| `chargeback` | Chargeback received | Revoke access, flag account |
| `subscription_canceled` | Subscription canceled | Log event |
| `subscription_renewed` | Subscription renewed | Extend access |

### Configuring Webhooks in Kiwify Dashboard

1. **Navigate to Webhook Settings**
   - Go to: Kiwify Dashboard > Apps > API > Webhooks
   - Click "Adicionar Webhook"

2. **Configure Webhook URL**
   ```
   https://your-domain.com/api/webhooks/kiwify
   ```

3. **Set Webhook Token**
   - Enter the same token configured in `KIWIFY_WEBHOOK_TOKEN`
   - This token will be sent in the `x-kiwify-token` header

4. **Select Trigger Events**
   Enable the following triggers:
   - Compra Aprovada
   - Compra Recusada
   - Compra Reembolsada
   - Chargeback

5. **Save Configuration**
   - Click "Salvar" to save the webhook configuration
   - Kiwify will send a test webhook to verify connectivity

---

## Kiwify Dashboard Configuration Guide

This section provides detailed, step-by-step instructions for configuring the complete Kiwify integration through the Kiwify dashboard. Follow these steps in order to set up the integration correctly.

### Prerequisites

Before starting, ensure you have:

- [ ] Active Kiwify account (https://kiwify.com.br)
- [ ] Admin access to the Kiwify dashboard
- [ ] A product created in Kiwify for "CPF Blindado - Acesso Premium"
- [ ] Your server URL (production or staging)
- [ ] A secure webhook token generated (see below)

#### Generate a Secure Webhook Token

```bash
# Generate a 64-character secure token using OpenSSL
openssl rand -hex 32

# Example output: a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
```

Save this token - you will need it for both the Kiwify dashboard and your server environment variables.

---

### Step 1: Access the Kiwify Dashboard

1. Open your browser and navigate to: **https://kiwify.com.br**
2. Click **"Entrar"** in the top-right corner
3. Enter your email and password
4. If prompted, complete two-factor authentication

You should now see the main dashboard with your products and sales overview.

---

### Step 2: Navigate to API Settings

1. In the left sidebar, click on **"Apps"** (or **"Aplicativos"**)
2. Click on **"API"** in the submenu
3. If this is your first time, you will see a **"Criar API Key"** button
4. If you already have API keys, they will be listed here

**Location in Dashboard:**
```
Dashboard > Apps > API
```

---

### Step 3: Create API Credentials

If you do not have API credentials yet:

1. Click **"Criar nova chave"** or **"Criar API Key"**
2. Enter a descriptive name for the key (e.g., "CPF Blindado Integration")
3. Click **"Criar"** to generate the credentials

**Important: Copy Your Credentials Immediately!**

After creation, you will see three values:

| Credential | Example Format | Where to Store |
|------------|----------------|----------------|
| `client_id` | `21f3b7c4-2734-44d5-9923-7de0848558bb` | `KIWIFY_CLIENT_ID` env var |
| `client_secret` | `4232bee972fe8026f3e3a9eab201dfeb...` | `KIWIFY_CLIENT_SECRET` env var |
| `account_id` | `QVfvaU7dhwBCh5X` | `KIWIFY_ACCOUNT_ID` env var |

**Security Note:** The `client_secret` is only shown once. If you lose it, you will need to generate new credentials.

**Add to Your Environment File:**

```bash
# .env.local
KIWIFY_CLIENT_ID=21f3b7c4-2734-44d5-9923-7de0848558bb
KIWIFY_CLIENT_SECRET=4232bee972fe8026f3e3a9eab201dfeb2317e2b602158822a55136ff5b8e85bb
KIWIFY_ACCOUNT_ID=QVfvaU7dhwBCh5X
```

---

### Step 4: Configure Webhooks

#### 4.1 Navigate to Webhook Settings

1. From **Apps > API**, look for the **"Webhooks"** section
2. Click **"Adicionar Webhook"** or **"Configurar Webhooks"**

**Location in Dashboard:**
```
Dashboard > Apps > API > Webhooks
```

#### 4.2 Add New Webhook

Fill in the webhook configuration form:

| Field | Value | Notes |
|-------|-------|-------|
| **Nome do Webhook** | `CPF Blindado - Pagamentos` | Descriptive name for identification |
| **URL do Webhook** | `https://your-domain.com/api/webhooks/kiwify` | Replace `your-domain.com` with your actual domain |
| **Token de Seguranca** | `your-generated-token` | The token you generated earlier |
| **Ativo** | Checked | Enable the webhook |

**URL Examples:**

| Environment | Webhook URL |
|-------------|-------------|
| Production | `https://cpfblindado.com/api/webhooks/kiwify` |
| Staging | `https://staging.cpfblindado.com/api/webhooks/kiwify` |
| Local (with tunnel) | `https://your-tunnel.ngrok.io/api/webhooks/kiwify` |

#### 4.3 Select Trigger Events

Check the following trigger events to enable them:

| Event | Portugeuse Name | Required | Purpose |
|-------|-----------------|----------|---------|
| `compra_aprovada` | Compra Aprovada | Yes | Grants user access |
| `compra_recusada` | Compra Recusada | Recommended | Logs refused payments |
| `compra_reembolsada` | Compra Reembolsada | Yes | Revokes user access |
| `chargeback` | Chargeback | Yes | Revokes access immediately |
| `subscription_canceled` | Assinatura Cancelada | Optional | For future subscriptions |
| `subscription_renewed` | Assinatura Renovada | Optional | For future subscriptions |

**Minimum Required Events:** `compra_aprovada`, `compra_reembolsada`, `chargeback`

#### 4.4 Save Webhook Configuration

1. Review all settings
2. Click **"Salvar"** to save the webhook
3. Kiwify will attempt to send a test webhook to verify connectivity

**Expected Test Response:**
- If your server is running and configured: HTTP 200 OK
- If the server returns 200, you will see a success message
- If there is an error, check the troubleshooting section below

---

### Step 5: Configure Your Product

#### 5.1 Navigate to Products

1. In the left sidebar, click **"Produtos"**
2. Find your "CPF Blindado - Acesso Premium" product
3. Click to edit the product

**Location in Dashboard:**
```
Dashboard > Produtos > [Your Product]
```

#### 5.2 Configure Product Settings

Ensure the following settings match your integration:

| Setting | Value | Notes |
|---------|-------|-------|
| **Nome do Produto** | `CPF Blindado - Acesso Premium 12 Meses` | Must match your `KIWIFY_PRODUCT.title` |
| **Preco** | `R$ 149,90` | Must match `KIWIFY_PRODUCT.unit_price` |
| **Tipo de Produto** | Digital / Acesso | Digital product type |
| **Slug do Produto** | `cpf-blindado-premium` | Used in checkout URL |

#### 5.3 Configure Redirect URLs

In the product settings, find the **"URLs de Redirecionamento"** section:

| Setting | Value |
|---------|-------|
| **URL de Sucesso** | `https://your-domain.com/checkout/sucesso?source=kiwify` |
| **URL de Falha** | `https://your-domain.com/checkout/falha?source=kiwify` |

These URLs are where customers are redirected after completing or failing payment.

#### 5.4 Save Product Changes

Click **"Salvar"** to save all product configuration changes.

---

### Step 6: Test the Integration

#### 6.1 Verify Server Configuration

Before testing, verify your server is correctly configured:

```bash
# Check health endpoint
curl https://your-domain.com/api/kiwify/health

# Expected response:
# {"status": "ok", "message": "Kiwify integration is healthy"}
```

```bash
# Check configuration endpoint
curl https://your-domain.com/api/kiwify/config

# Expected response:
# {
#   "configured": true,
#   "productId": "limpa_nome_expresso_12_months",
#   "productTitle": "CPF Blindado - Acesso Premium 12 Meses",
#   "price": 149.90,
#   "currency": "BRL",
#   "durationMonths": 12
# }
```

#### 6.2 Test Webhook Endpoint

Send a test webhook to verify your server processes it correctly:

```bash
curl -X POST https://your-domain.com/api/webhooks/kiwify \
  -H "Content-Type: application/json" \
  -H "x-kiwify-token: your-webhook-token" \
  -d '{
    "event": "compra_aprovada",
    "sale_id": "test_sale_'$(date +%s)'",
    "order_id": "TEST-'$(date +%s)'",
    "customer_email": "test@example.com",
    "customer_name": "Test User",
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
  }'

# Expected response:
# {"received": true, "event": "compra_aprovada", "saleId": "test_sale_xxx", "success": true}
```

**Note:** This test will create a test user in your database. Clean up afterward if needed.

#### 6.3 Perform a Test Purchase

1. Navigate to your checkout page
2. Click the "Comprar via Kiwify" button
3. Complete the checkout process on Kiwify (use test payment if available)
4. Verify you are redirected to the success page
5. Check your database for the new user and payment record:

```sql
-- Verify payment was recorded
SELECT * FROM payments
WHERE payment_provider = 'kiwify'
ORDER BY created_at DESC LIMIT 5;

-- Verify access was granted
SELECT * FROM user_access
WHERE user_id IN (
  SELECT id FROM profiles WHERE email = 'test@example.com'
);
```

---

### Step 7: Monitor and Maintain

#### 7.1 Check Webhook Logs

Regularly monitor webhook processing in your database:

```sql
-- View recent webhook activity
SELECT
  action,
  status,
  sale_id,
  customer_email,
  timestamp
FROM kiwify_webhook_logs
ORDER BY timestamp DESC
LIMIT 20;

-- Check for failed webhooks
SELECT *
FROM kiwify_webhook_logs
WHERE status = 'failed'
ORDER BY timestamp DESC;
```

#### 7.2 Verify API Connectivity

Periodically test API connectivity:

```bash
# Health check
curl -s https://your-domain.com/api/kiwify/health | jq .

# Configuration check
curl -s https://your-domain.com/api/kiwify/config | jq .
```

#### 7.3 Kiwify Dashboard Monitoring

In the Kiwify dashboard:

1. Navigate to **"Vendas"** to see all transactions
2. Check **"Apps > API > Webhooks"** for webhook delivery status
3. Review failed webhook attempts and retry if necessary

---

### Configuration Checklist

Complete this checklist to verify your integration is fully configured:

**Environment Variables:**
- [ ] `KIWIFY_CLIENT_ID` set in `.env.local`
- [ ] `KIWIFY_CLIENT_SECRET` set in `.env.local`
- [ ] `KIWIFY_ACCOUNT_ID` set in `.env.local`
- [ ] `KIWIFY_WEBHOOK_TOKEN` set in `.env.local`
- [ ] `KIWIFY_PRODUCT_SLUG` set (optional)

**Kiwify Dashboard:**
- [ ] API credentials created in Apps > API
- [ ] Webhook URL configured (with correct domain)
- [ ] Webhook token matches server configuration
- [ ] Trigger events enabled (minimum: compra_aprovada, compra_reembolsada, chargeback)
- [ ] Product configured with correct price (R$ 149.90)
- [ ] Redirect URLs configured for success and failure pages

**Server Verification:**
- [ ] Health endpoint returns `{"status": "ok"}`
- [ ] Config endpoint returns correct product information
- [ ] Test webhook processed successfully
- [ ] Test purchase completed end-to-end

**Database:**
- [ ] Migration `003_add_kiwify_schema.sql` applied
- [ ] `payments` table has `kiwify_sale_id` column
- [ ] Unique constraint on `kiwify_sale_id` exists
- [ ] `kiwify_webhook_logs` table created

---

### Common Dashboard Configuration Issues

#### Issue: Webhook Test Fails with 401

**Dashboard Error:** "Falha ao testar webhook - Codigo 401"

**Solution:**
1. Verify `KIWIFY_WEBHOOK_TOKEN` in your `.env.local` matches the token in Kiwify dashboard
2. Ensure the server has been restarted after adding the environment variable
3. Check server logs for token verification errors

#### Issue: Webhook Test Fails with 404

**Dashboard Error:** "Falha ao testar webhook - Codigo 404"

**Solution:**
1. Verify the webhook URL is correct: `https://your-domain.com/api/webhooks/kiwify`
2. Ensure your server is running and accessible from the internet
3. Check that the route is registered in `server/index.ts`

#### Issue: API Credentials Not Working

**Dashboard Error:** "Credenciais invalidas" or OAuth token fails

**Solution:**
1. Verify credentials are copied correctly (no extra spaces)
2. Check that `client_id` is in UUID format (with hyphens)
3. Ensure credentials have not been revoked in Kiwify dashboard
4. Try generating new credentials if problem persists

#### Issue: Product Price Mismatch

**Symptom:** Checkout shows different price than expected

**Solution:**
1. Go to Kiwify Dashboard > Produtos > [Your Product]
2. Verify the price is set to R$ 149,90
3. Ensure there are no active discounts or promotions
4. Update `KIWIFY_PRODUCT.unit_price` in code if price changed

---

### Production Deployment Checklist

Before going live with Kiwify integration:

- [ ] Use production API credentials (not test credentials)
- [ ] Webhook URL uses HTTPS with valid SSL certificate
- [ ] Environment variables set in production hosting (Vercel, Netlify, etc.)
- [ ] Database migrations applied to production database
- [ ] Test purchase completed with real payment method
- [ ] Webhook delivery confirmed in Kiwify dashboard
- [ ] Confirmation email received by test customer
- [ ] Access correctly granted in database

---

### Dashboard Screenshots Reference

For visual reference, the Kiwify dashboard sections are organized as follows:

```
+----------------------------------------------------------+
|  Kiwify Dashboard                                         |
+----------------------------------------------------------+
|  [Logo]  Produtos | Vendas | Apps | Configuracoes         |
+----------------------------------------------------------+
|                    |                                       |
|  Sidebar           |  Main Content Area                   |
|  --------          |  ------------------                  |
|  - Visao Geral     |                                       |
|  - Produtos        |  [Current Section Content]           |
|  - Vendas          |                                       |
|  - Clientes        |                                       |
|  - Apps            |                                       |
|    - API           |                                       |
|    - Webhooks      |                                       |
|    - Integracoes   |                                       |
|  - Configuracoes   |                                       |
|                    |                                       |
+----------------------------------------------------------+
```

**Key Navigation Paths:**

| Destination | Path |
|-------------|------|
| API Credentials | Apps > API |
| Webhooks | Apps > API > Webhooks |
| Product Settings | Produtos > [Select Product] |
| Sales History | Vendas |
| Account Settings | Configuracoes |

### Webhook Processing Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    WEBHOOK PROCESSING                        │
└─────────────────────────────────────────────────────────────┘

1. Receive webhook request
   │
   ▼
2. Verify webhook token (x-kiwify-token header)
   │
   ├── Invalid ──> Return 401 Unauthorized
   │
   ▼
3. Validate required fields (event, sale_id)
   │
   ├── Missing ──> Return 400 Bad Request
   │
   ▼
4. Check idempotency (has sale_id been processed?)
   │
   ├── Already processed ──> Return 200 OK (skip processing)
   │
   ▼
5. Fetch complete sale details from Kiwify API
   │
   ├── API Error ──> Log error, return 200 OK (manual review)
   │
   ▼
6. Process event based on type
   │
   ├── compra_aprovada ──> Create user, grant access, send email
   ├── compra_recusada ──> Log only
   ├── compra_reembolsada ──> Revoke access
   ├── chargeback ──> Revoke access, flag account
   │
   ▼
7. Return 200 OK (always acknowledge receipt)
```

### Idempotency

The integration implements idempotency to prevent duplicate processing:

1. **Database Check**: Before processing, check if `kiwify_sale_id` exists in `payments` table
2. **Unique Constraint**: Database enforces uniqueness on `kiwify_sale_id` column
3. **Safe Retries**: Kiwify may retry webhooks; duplicate requests return success without side effects

---

## Database Schema

### Migration: 003_add_kiwify_schema.sql

```sql
-- Add Kiwify-specific columns
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS kiwify_sale_id TEXT,
  ADD COLUMN IF NOT EXISTS kiwify_order_id TEXT;

-- Create index for Kiwify sale ID lookups (critical for idempotency checks)
CREATE INDEX IF NOT EXISTS idx_payments_kiwify_sale ON payments(kiwify_sale_id);

-- Create unique constraint to enforce idempotency at database level
ALTER TABLE payments
  ADD CONSTRAINT payments_kiwify_sale_id_unique UNIQUE (kiwify_sale_id);

-- Update payment_provider check constraint to include kiwify
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_payment_provider_check;
ALTER TABLE payments
  ADD CONSTRAINT payments_payment_provider_check
  CHECK (payment_provider IN ('stripe', 'mercadopago', 'kiwify'));
```

### Webhook Logs Table

The `kiwify_webhook_logs` table stores comprehensive logging for all webhook events:

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `action` | text | Action type (e.g., 'payment_approved') |
| `status` | text | Processing status |
| `sale_id` | text | Kiwify sale ID |
| `order_id` | text | Kiwify order ID |
| `customer_email` | text | Customer email |
| `event_type` | text | Webhook trigger type |
| `message` | text | Log message |
| `metadata` | jsonb | Additional metadata |
| `error_details` | jsonb | Error information if failed |
| `timestamp` | timestamptz | Event timestamp |
| `processing_duration_ms` | integer | Processing time in milliseconds |

### Applying Migrations

```bash
# Using Supabase CLI
supabase db push

# Or manually via SQL editor
# Copy the migration SQL and run in Supabase SQL Editor
```

---

## Frontend Integration

### Checkout Button Implementation

```typescript
import { buildKiwifyCheckoutUrl, KIWIFY_API_ENDPOINTS } from '@/lib/kiwify-config';

async function handleKiwifyCheckout(email: string, userId: string) {
  try {
    // Call Netlify function to get checkout URL
    const response = await fetch(KIWIFY_API_ENDPOINTS.createPreference, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        email,
        metadata: {
          utm_source: 'website',
          utm_medium: 'checkout',
        },
      }),
    });

    const data = await response.json();

    if (data.success && data.checkoutUrl) {
      // Redirect to Kiwify checkout
      window.location.href = data.checkoutUrl;
    }
  } catch (error) {
    console.error('Kiwify checkout error:', error);
  }
}
```

### Success Page Handling

```typescript
// PaymentSuccess.tsx
import { useSearchParams } from 'react-router-dom';

function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const source = searchParams.get('source'); // 'kiwify' or 'mercadopago'

  return (
    <div>
      <h1>Pagamento Confirmado!</h1>
      {source === 'kiwify' && (
        <p>Seu pagamento via Kiwify foi processado com sucesso.</p>
      )}
    </div>
  );
}
```

### Status Display Configuration

```typescript
import { getKiwifyStatusDisplay, KiwifyPaymentStatus } from '@/lib/kiwify-config';

const status: KiwifyPaymentStatus = 'approved';
const display = getKiwifyStatusDisplay(status);

// display = {
//   label: 'Aprovado',
//   labelColor: '#22c55e',
//   description: 'Pagamento confirmado. Seu acesso premium foi liberado.'
// }
```

---

## Testing

### Running Unit Tests

```bash
# Run all Kiwify tests
npm test -- kiwify

# Run with verbose output
npm test -- kiwify-token.test.ts --verbose

# Run with coverage
npm test -- kiwify --coverage
```

### Test Categories

#### OAuth Token Management Tests

| Test | Description |
|------|-------------|
| Token Generation | Verifies token is generated when no cache exists |
| Token Caching | Verifies token is cached after first generation |
| Token Expiry | Verifies expired tokens are refreshed |
| Refresh Buffer | Verifies tokens refresh 1 hour before expiry |
| Concurrent Access | Verifies single API call for concurrent requests |

#### Error Handling Tests

| Test | Description |
|------|-------------|
| 400 Response | Throws KiwifyApiError for bad requests |
| 401 Response | Throws KiwifyAuthError for auth failures |
| 429 Response | Throws KiwifyRateLimitError with retry-after |
| 500 Response | Throws KiwifyApiError for server errors |
| Network Error | Throws KiwifyNetworkError for connection failures |

### Manual Testing

#### Test Webhook Endpoint

```bash
# Test compra_aprovada webhook
curl -X POST https://your-domain.com/api/webhooks/kiwify \
  -H "Content-Type: application/json" \
  -H "x-kiwify-token: your-webhook-token" \
  -d '{
    "event": "compra_aprovada",
    "sale_id": "test_sale_123",
    "order_id": "ORD-TEST-001",
    "customer_email": "test@example.com",
    "customer_name": "Test User",
    "timestamp": "2024-01-15T10:30:00Z"
  }'
```

#### Test Health Check

```bash
curl https://your-domain.com/api/kiwify/health
```

#### Test Configuration

```bash
curl https://your-domain.com/api/kiwify/config
```

### Test Mode

For testing without affecting production data:

1. Use test credentials from Kiwify (if available)
2. Set `NODE_ENV=test` to use test database
3. Monitor webhook logs at: `kiwify_webhook_logs` table

---

## Troubleshooting

### Common Issues

#### Webhook Returns 401 Unauthorized

**Symptoms**: Webhook requests fail with 401 status

**Causes**:
- Missing `KIWIFY_WEBHOOK_TOKEN` environment variable
- Token mismatch between Kiwify dashboard and server configuration

**Solution**:
```bash
# Verify token is set
echo $KIWIFY_WEBHOOK_TOKEN

# Compare with Kiwify dashboard configuration
# Kiwify Dashboard > Apps > API > Webhooks
```

#### OAuth Token Generation Fails

**Symptoms**: Error obtaining OAuth token, 401 responses

**Causes**:
- Invalid `KIWIFY_CLIENT_ID` or `KIWIFY_CLIENT_SECRET`
- Credentials not yet activated in Kiwify dashboard

**Solution**:
1. Verify credentials in Kiwify Dashboard > Apps > API
2. Ensure `client_id` is in UUID format
3. Ensure `client_secret` has no trailing whitespace
4. Check credentials are active (not expired or revoked)

#### User Not Created After Payment

**Symptoms**: Payment approved but no user access granted

**Causes**:
- Webhook not delivered
- Processing error during user creation
- Supabase connection issues

**Solution**:
```sql
-- Check webhook logs
SELECT * FROM kiwify_webhook_logs
WHERE sale_id = 'your_sale_id'
ORDER BY timestamp DESC;

-- Check for processing errors
SELECT * FROM kiwify_webhook_logs
WHERE status = 'failed'
ORDER BY timestamp DESC
LIMIT 20;
```

#### Duplicate Access Grants

**Symptoms**: User receives multiple access periods

**Causes**:
- Idempotency check not working
- Database constraint not applied

**Solution**:
```sql
-- Verify unique constraint exists
SELECT conname FROM pg_constraint
WHERE conname = 'payments_kiwify_sale_id_unique';

-- If missing, apply migration
-- Run: 003_add_kiwify_schema.sql
```

### Debugging Commands

```bash
# View recent webhook logs
psql -c "SELECT * FROM kiwify_webhook_logs ORDER BY timestamp DESC LIMIT 10;"

# Check specific sale processing
psql -c "SELECT * FROM kiwify_webhook_logs WHERE sale_id = 'sale_xxx';"

# View failed events
psql -c "SELECT * FROM kiwify_webhook_logs WHERE status = 'failed';"

# Check payments with Kiwify
psql -c "SELECT * FROM payments WHERE payment_provider = 'kiwify';"
```

### Log Analysis

The `kiwify-logger.ts` module provides structured logging. Key log actions:

| Action | Meaning |
|--------|---------|
| `webhook_received` | Webhook received from Kiwify |
| `webhook_verified` | Token verification successful |
| `webhook_verification_failed` | Invalid token |
| `webhook_duplicate` | Duplicate webhook (idempotency) |
| `payment_approved` | Payment processed successfully |
| `payment_refused` | Payment was refused |
| `access_granted` | User access provisioned |
| `access_revoked` | User access removed |
| `processing_error` | Error during processing |

---

## Security Considerations

### Credential Management

1. **Never expose secrets in client code**
   - `KIWIFY_CLIENT_SECRET` must only exist on the server
   - `KIWIFY_WEBHOOK_TOKEN` must only exist on the server
   - Use environment variables, never hardcode

2. **Rotate credentials periodically**
   - Generate new API keys every 90 days
   - Update webhook tokens after any security incident
   - Monitor for unauthorized API access

3. **Separate environments**
   - Use different credentials for dev/staging/production
   - Never share production credentials

### Webhook Security

1. **Token Verification**
   - Every webhook must include valid token
   - Token verified before any processing
   - Invalid tokens return 401 immediately

2. **HTTPS Required**
   - Kiwify only sends webhooks over HTTPS
   - Ensure SSL certificate is valid
   - No HTTP fallback available

3. **Idempotency**
   - Prevents replay attacks
   - Duplicate webhooks return success without side effects
   - Database constraint enforces uniqueness

### API Security

1. **OAuth Token Caching**
   - Tokens cached in memory (not persisted to disk)
   - Auto-refresh prevents token expiry
   - Clear cache on server restart

2. **Rate Limiting**
   - Kiwify enforces 100 requests/minute
   - Client implements exponential backoff
   - Automatic retry on 429 responses

3. **Account Isolation**
   - `x-kiwify-account-id` header required
   - Prevents cross-account access
   - Each account has isolated data

### Data Privacy

1. **CPF Masking**
   - Customer CPF is masked in logs (`***123456**`)
   - Full CPF only stored in database
   - Never log complete document numbers

2. **Email Handling**
   - Customer emails logged for debugging
   - Consider masking in production logs
   - Follow LGPD compliance requirements

### Monitoring and Alerts

Set up monitoring for:
- Failed webhook verifications
- Payment processing errors
- API rate limit warnings
- Unusual access patterns

---

## Support and Resources

### Kiwify Resources

- **Kiwify Dashboard**: https://kiwify.com.br
- **API Documentation**: Available in Kiwify Dashboard > Apps > API
- **Support**: Via Kiwify dashboard support channels

### Internal Resources

- **Server Implementation**: `server/lib/kiwify.ts`
- **Webhook Handler**: `server/routes/kiwify.ts`
- **Type Definitions**: `server/lib/kiwify-types.ts`
- **Frontend Config**: `client/src/lib/kiwify-config.ts`
- **Unit Tests**: `server/tests/kiwify-token.test.ts`

### Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-09 | Initial Kiwify integration |
