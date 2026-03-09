Task Name: kiwify-integration
Date: 09/03/2026 18:05:49
Git Branch: feat/kiwify-integration

## Task Objectives

Implement complete integration with Kiwify payment platform to enable CPF Blindado customers to purchase premium access through Kiwify's checkout system. This integration will provide an alternative payment gateway alongside the existing MercadoPago integration, expanding payment options for Brazilian customers who prefer Kiwify's checkout experience. The integration includes OAuth authentication, webhook handling for payment events, and automatic user access provisioning upon successful payment confirmation.


## Implementation Summary

### Architecture Overview

This integration follows the existing payment gateway pattern established by MercadoPago, creating a parallel implementation structure for Kiwify. The architecture consists of three main layers: authentication (OAuth token management), webhook handlers for payment events, and database integration for user access provisioning.

### Technologies and Frameworks

- **Kiwify Public API v1** - RESTful API with OAuth 2.0 authentication
- **Express.js** routes for webhook endpoints
- **Supabase** for database operations (user access provisioning)
- **TypeScript** for type safety and maintainability
- **Axios** (already in dependencies) for HTTP requests to Kiwify API

### Integration Points

1. **OAuth Authentication Flow**
   - Base URL: `https://public-api.kiwify.com`
   - Token endpoint: `POST /v1/oauth/token`
   - Token validity: 96 hours with caching strategy
   - Required credentials: client_id, client_secret, account_id (already provided)

2. **Webhook Event Handling**
   - Endpoint: `POST /api/webhooks/kiwify`
   - Supported events: `compra_aprovada`, `compra_recusada`, `compra_reembolsada`, `chargeback`, `subscription_canceled`, `subscription_renewed`
   - Token-based webhook verification for security

3. **Payment Verification**
   - Sales endpoint: `GET /v1/sales` for payment status verification
   - Rate limit: 100 requests per minute (design accordingly)
   - Maximum query period: 90 days between start_date and end_date

### Data Flow

1. Customer completes payment on Kiwify checkout page
2. Kiwify sends webhook to `/api/webhooks/kiwify` with event data
3. Server verifies webhook authenticity using token
4. Server retrieves full sale details from Kiwify API
5. System creates or updates user access in database (12-month premium access)
6. Confirmation email sent to customer

### Security Considerations

- Client secret must be stored in environment variables (never in code)
- OAuth tokens cached with expiration validation (96-hour TTL)
- Webhook token verification on every incoming request
- HTTPS enforced by Kiwify API (no HTTP support)
- Rate limiting awareness (100 req/min) with retry strategy
- Account ID passed as `x-kiwify-account-id` header for multi-tenant isolation

### Environment Variables Required

```
KIWIFY_CLIENT_ID=21f3b7c4-2734-44d5-9923-7de0848558bb
KIWIFY_CLIENT_SECRET=4232bee972fe8026f3e3a9eab201dfeb2317e2b602158822a55136ff5b8e85bb
KIWIFY_ACCOUNT_ID=QVfvaU7dhwBCh5X
```


## UX/UI Details

### User Flow

1. **Purchase Flow**
   - User clicks "Comprar via Kiwify" button on pricing page
   - Redirects to Kiwify checkout page (hosted externally)
   - User completes payment using available methods (PIX, credit card, boleto)
   - After payment, redirected to success page on CPF Blindado

2. **Access Provisioning**
   - Automatic account creation/access provisioning upon webhook receipt
   - User receives confirmation email with login credentials or access instructions
   - Dashboard shows premium access status (12 months duration)

3. **Payment Status States**
   - `paid` / `approved` - Access granted immediately
   - `waiting_payment` - Shows pending status with payment instructions
   - `refused` - Shows payment failed message with retry option
   - `refunded` / `chargedback` - Access revoked, user notified

### Integration Points

- **Landing Page**: Add Kiwify as payment option alongside MercadoPago
- **Dashboard**: Display payment source (Kiwify/MercadoPago) in user profile
- **Admin Panel**: View Kiwify transactions and sync status

### Responsive Behavior

All UI elements follow existing responsive design patterns. External Kiwify checkout handles its own responsiveness.

### Accessibility

Follow existing WCAG 2.1 AA standards. No additional accessibility requirements as checkout is handled by Kiwify.


## Tasks

### 1. Core Infrastructure Setup

#### Files to create/change

- **CREATE** `server/lib/kiwify-config.ts` - Configuration constants and product definitions
- **CREATE** `server/lib/kiwify.ts` - Kiwify API client with OAuth authentication
- **UPDATE** `.env.example` - Add Kiwify environment variables template

#### Implementation

Create the foundational infrastructure for Kiwify integration following the existing pattern established by MercadoPago. The `kiwify-config.ts` file will define product constants matching the existing `MERCADOPAGO_PRODUCT` structure, including product ID, title, price (R$ 149.90 for 12 months), currency (BRL), and duration. This ensures consistency between payment gateways.

The `kiwify.ts` file will implement the core API client class with the following responsibilities:

1. **OAuth Token Management**: Implement `getAccessToken()` method that generates and caches OAuth tokens. The method should call `POST https://public-api.kiwify.com/v1/oauth/token` with client_id and client_secret in the request body. Store the token with its expiration timestamp (96 hours from generation) and implement automatic refresh when approaching expiration (refresh 1 hour before expiry to ensure continuous availability).

2. **Request Wrapper**: Create a generic `request()` method that automatically injects the required headers (`Authorization: Bearer {token}` and `x-kiwify-account-id: {accountId}`) and handles rate limiting awareness. Include retry logic with exponential backoff for 429 (rate limit) responses.

3. **Error Handling**: Implement comprehensive error handling for all Kiwify API error codes (400, 429, 500). Log errors appropriately and throw typed exceptions that can be caught by route handlers.

4. **TypeScript Interfaces**: Define TypeScript interfaces for all Kiwify API responses including OAuthTokenResponse, Sale, Customer, Product, WebhookEvent, and PaginationMetadata. This ensures type safety throughout the integration.

The configuration should reference the provided credentials: client_id `21f3b7c4-2734-44d5-9923-7de0848558bb`, client_secret `4232bee972fe8026f3e3a9eab201dfeb2317e2b602158822a55136ff5b8e85bb`, and account_id `QVfvaU7dhwBCh5X`. These will be stored in environment variables for security.

#### Subtasks

1.1. Create `kiwify-config.ts` with product constants matching MercadoPago pattern
1.2. Create `kiwify.ts` API client class with OAuth token management and caching
1.3. Define TypeScript interfaces for all Kiwify API data structures
1.4. Update `.env.example` with KIWIFY_CLIENT_ID, KIWIFY_CLIENT_SECRET, KIWIFY_ACCOUNT_ID
1.5. Add unit tests for token caching and refresh logic

### 2. Webhook Handler Implementation

#### Files to create/change

- **CREATE** `server/routes/kiwify.ts` - Webhook endpoint and payment event handlers
- **UPDATE** `server/index.ts` - Register Kiwify webhook routes

#### Implementation

Implement the webhook handler that receives and processes payment events from Kiwify. The route file will be created at `server/routes/kiwify.ts` following the pattern of the existing `mercadopago.ts` and `stripe.ts` routes.

The webhook endpoint at `POST /api/webhooks/kiwify` must handle the following:

1. **Webhook Verification**: Every incoming webhook must be verified using the webhook token provided in the Kiwify webhook configuration. Extract the token from the request headers or query parameters and compare it against the expected value stored in environment variables. Reject unverified requests with 401 Unauthorized.

2. **Event Processing**: Implement handlers for each webhook trigger type:
   - `compra_aprovada`: Extract sale data, create or update user in database with 12-month premium access
   - `compra_recusada`: Log the refused payment, optionally notify user
   - `compra_reembolsada`: Revoke user access, update database status
   - `chargeback`: Immediately revoke access, flag account for review
   - `subscription_canceled`: Handle subscription cancellation (if applicable)
   - `subscription_renewed`: Extend user access by subscription period

3. **Sale Data Retrieval**: After receiving a webhook, use the Kiwify API client to fetch complete sale details using `GET /v1/sales/{sale_id}` to ensure data integrity. Extract customer information (name, email, CPF, mobile) and product details.

4. **Database Integration**: Use the existing Supabase client to create or update user records. Map Kiwify customer data to the existing user schema. Set access expiration to current time + 12 months (matching MERCADOPAGO_PRODUCT duration). Store payment reference (Kiwify sale ID) for future lookups.

5. **Email Notification**: Integrate with the existing email service (`server/services/email.service.ts`) to send payment confirmation emails to customers upon successful payment.

6. **Logging and Monitoring**: Implement comprehensive logging for all webhook events using the existing audit logger. Include event type, sale ID, customer email, processing status, and any errors encountered.

The webhook handler must be idempotent - processing the same webhook multiple times should not result in duplicate access grants or other side effects. Use the Kiwify sale ID as a unique identifier to check if the payment has already been processed.

#### Subtasks

2.1. Create POST `/api/webhooks/kiwify` endpoint with token verification
2.2. Implement `compra_aprovada` handler with user provisioning
2.3. Implement refund and chargeback handlers with access revocation
2.4. Add idempotency check using Kiwify sale ID
2.5. Integrate email notification for successful payments
2.6. Add comprehensive logging with audit logger

### 3. Frontend Integration and Configuration

#### Files to create/change

- **CREATE** `api/create-preference-kiwify.js` - Netlify function for Kiwify checkout preference creation (alternative to MercadoPago)
- **UPDATE** `client/src/pages/Landing.tsx` - Add Kiwify checkout button option
- **UPDATE** `client/src/pages/PaymentSuccess.tsx` - Handle Kiwify redirect success
- **CREATE** `client/src/lib/kiwify-config.ts` - Frontend Kiwify configuration

#### Implementation

Implement the frontend components and checkout flow integration for Kiwify. This task creates the user-facing elements that allow customers to choose Kiwify as their payment method.

1. **Netlify Function for Checkout**: Create a serverless function at `api/create-preference-kiwify.js` that generates Kiwify checkout preferences. Unlike MercadoPago which requires preference creation via API, Kiwify checkout URLs can be constructed directly with product information. The function should return the checkout URL that the frontend will redirect to. Include the product ID, price, title, and customer email (if logged in) in the checkout parameters.

2. **Landing Page Integration**: Update `client/src/pages/Landing.tsx` to add a "Comprar via Kiwify" button alongside the existing MercadoPago option. This gives customers a choice of payment gateway. Style the button consistently with the existing design system. The button click handler should call the Netlify function and redirect to the returned Kiwify checkout URL.

3. **Success Page Handling**: Update `client/src/pages/PaymentSuccess.tsx` to handle redirects from Kiwify checkout. Kiwify will redirect back to the success page with sale reference in query parameters. Extract the sale reference and display appropriate success messaging. Show the user's email and access duration (12 months).

4. **Frontend Configuration**: Create `client/src/lib/kiwify-config.ts` with frontend-safe configuration values. This includes the checkout base URL, success/failure redirect URLs, and any client-side tracking parameters. Never expose the client_secret or other sensitive credentials on the frontend.

5. **Analytics Integration**: Add tracking events for Kiwify checkout initiation and completion. This allows comparison of conversion rates between payment gateways. Use the existing analytics infrastructure (if present) or implement basic event logging.

The implementation should maintain visual consistency with the existing payment flow. Users should not notice significant UI differences between choosing MercadoPago or Kiwify, aside from the button label and checkout page appearance.

#### Subtasks

3.1. Create Netlify function for Kiwify checkout URL generation
3.2. Add Kiwify checkout button to Landing page
3.3. Update PaymentSuccess page to handle Kiwify redirects
3.4. Create frontend configuration file
3.5. Add analytics tracking for Kiwify checkout events

### 4. Testing and Documentation

#### Files to create/change

- **CREATE** `server/tests/kiwify.test.ts` - Unit and integration tests for Kiwify integration
- **CREATE** `docs/integrations/kiwify.md` - Integration documentation
- **UPDATE** `README.md` - Add Kiwify integration to features list

#### Implementation

Create comprehensive test coverage and documentation for the Kiwify integration to ensure reliability and maintainability.

1. **Unit Tests**: Create `server/tests/kiwify.test.ts` with the following test suites:
   - **OAuth Token Management**: Test token generation, caching, and automatic refresh. Mock the Kiwify API responses and verify correct behavior when tokens expire.
   - **API Client Methods**: Test all API client methods (getSale, listSales, verifyWebhook) with mocked HTTP responses. Verify correct header injection and error handling.
   - **Webhook Handler**: Test the webhook endpoint with various event payloads. Verify idempotency, token verification, and correct database updates for each event type.
   - **Error Scenarios**: Test rate limiting (429 responses), server errors (500), and invalid requests (400). Verify retry logic and error propagation.

2. **Integration Tests**: Create end-to-end tests that:
   - Simulate a complete purchase flow from checkout to access provisioning
   - Test webhook processing with real database interactions (use test database)
   - Verify email notifications are sent correctly
   - Test concurrent webhook handling for idempotency

3. **Documentation**: Create comprehensive documentation at `docs/integrations/kiwify.md` that includes:
   - Overview of Kiwify integration and its purpose
   - Architecture diagram showing data flow
   - Environment variable setup instructions
   - API endpoints reference (internal and external)
   - Webhook configuration guide (how to set up webhooks in Kiwify dashboard)
   - Troubleshooting common issues
   - Testing instructions for developers

4. **README Update**: Update the main README.md to add Kiwify to the list of supported payment gateways. Include a brief description of the integration and link to the detailed documentation.

5. **Kiwify Dashboard Configuration Guide**: Document the steps required to configure webhooks in the Kiwify dashboard (Apps > API > Criar API Key). Include screenshots if possible, and specify the exact webhook URL format and required triggers to enable.

All tests should follow the existing testing patterns using Vitest and Supertest. Ensure tests can run in isolation without requiring live Kiwify API access by using comprehensive mocking.

#### Subtasks

4.1. Create unit tests for OAuth token management
4.2. Create unit tests for webhook handler with all event types
4.3. Create integration tests for complete purchase flow
4.4. Write comprehensive documentation in `docs/integrations/kiwify.md`
4.5. Update README.md with Kiwify integration information
4.6. Create Kiwify dashboard configuration guide

