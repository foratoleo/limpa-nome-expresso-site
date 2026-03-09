# Integrations

## Overview

- The main external platform is Supabase for auth, database, and file storage.
- Payments are split across two providers in source:
  - Mercado Pago is the active checkout path for the current landing/checkout flow.
  - Stripe subscription infrastructure still exists and is still used by billing/admin access code paths.
- Email sending uses EmailIt on the Express/Netlify paths, with a logging-only fallback in the Vercel contact handler.
- No SMS provider, analytics SDK, or error-monitoring SDK is wired in current source.

## Database, Auth, And Storage

### Supabase

- Frontend client: `client/src/lib/supabase.ts`
- Backend/admin clients:
  - `server/lib/supabase-server.ts`
  - direct `createClient(...)` usage in `server/routes/auth.ts`, `server/routes/payments.ts`, `server/routes/admin-access.ts`, `server/routes/admin-users.ts`, `server/routes/stripe.ts`, `server/routes/mercadopago.ts`, and `server/middleware/*.ts`
  - Netlify wrapper usage in `netlify/functions/api.ts`
  - Vercel serverless usage in `api/payments/status.js`, `api/mercadopago-webhook.js`, and `api/admin/access/*.js`
- Auth model:
  - Supabase Auth email/password sign-in in `client/src/contexts/AuthContext.tsx`
  - Supabase magic links in `client/src/contexts/AuthContext.tsx`
  - PKCE callback completion in `client/src/pages/AuthCallback.tsx`
  - Backend-assisted registration with admin user creation and custom confirmation links in `server/routes/auth.ts`
- Storage:
  - Supabase Storage bucket `user-documents` is used in `client/src/hooks/useDocuments.ts`
  - The app stores public URLs from Supabase Storage in the `user_documents` table
- Schema/migrations:
  - Base app data in `supabase/migrations/001_initial_schema.sql`
  - document linking in `supabase/migrations/002_checklist_documents.sql`
  - Stripe-related schema in `supabase/migrations/002_stripe_schema.sql`
  - manual access in `supabase/migrations/003_manual_access.sql`
  - payment access in `supabase/migrations/007_create_user_access_table.sql`
  - admin audit log in `supabase/migrations/010_admin_audit_log.sql`

## Payment Providers

### Mercado Pago

- SDK integration lives in `server/lib/mercadopago.ts` using the `mercadopago` package.
- Product/pricing config is hardcoded in:
  - `client/src/lib/mercadopago-config.ts`
  - `server/lib/mercadopago-config.ts`
- Active frontend usage:
  - Main checkout page `client/src/components/checkout/CheckoutPage.tsx`
  - Special advisory upsell `client/src/pages/SpecialAdvisory.tsx`
  - Client helper `client/src/lib/api/mercadopago.ts` posts to `/api/create-preference`
- Express endpoints:
  - `POST /api/mercadopago/create-preference` in `server/routes/mercadopago.ts`
  - `GET /api/mercadopago/payment/:paymentId` in `server/routes/mercadopago.ts`
  - `POST /api/mercadopago/webhook` in `server/routes/mercadopago.ts`
  - `GET /api/mercadopago/config` in `server/routes/mercadopago.ts`
- Vercel endpoints:
  - `api/create-preference.js`
  - `api/mercadopago.js`
  - `api/mercadopago-webhook.js`
- Business effect of approved payments:
  - inserts `payments` rows
  - grants `user_access`
  - uses `payment_provider = 'mercadopago'` in `server/routes/mercadopago.ts`
- Webhook notes:
  - Express path verifies headers with `verifyWebhookSignature(...)` in `server/lib/mercadopago.ts`
  - current signature helper logs that HMAC verification is not fully implemented yet

### Stripe

- Stripe server integration exists in `server/routes/stripe.ts`.
- Stripe webhook processing exists in `server/middleware/stripe-webhook.ts`.
- Frontend subscription/billing config exists in:
  - `client/src/lib/stripe-config.ts`
  - `client/src/hooks/useSubscription.ts`
  - `client/src/pages/Billing.tsx`
  - `client/src/components/pricing/*.tsx`
- Stripe-backed data model exists in `supabase/migrations/002_stripe_schema.sql`:
  - `stripe_customers`
  - `subscriptions`
  - `payments`
  - cached `products` and `prices`
- Current storefront status:
  - `client/src/pages/Landing.tsx` explicitly comments that the old Stripe pricing section was removed
  - Stripe remains available in code for subscription checkout and billing portal flows, but it is not the current landing-page purchase path

## Email Providers

### EmailIt

- Primary email client: `server/lib/emailit.ts`
- Email service wrapper: `server/services/email.service.ts`
- Used for:
  - registration/confirmation emails in `server/routes/auth.ts`
  - support/contact form delivery in `server/routes/contact.ts`
  - equivalent Netlify implementation in `netlify/functions/api.ts`
- Required env on these paths:
  - `EMAILIT_API_KEY`
  - `EMAILIT_DEFAULT_FROM`
- Fallback behavior:
  - `server/routes/contact.ts` logs the message payload if EmailIt is not configured
  - `server/routes/auth.ts` still creates the user even if custom email sending is skipped

### Vercel Contact Fallback

- `api/contact/send.ts` does not currently send via a provider.
- It logs the composed message and contains TODO comments for a future provider such as Resend or SendGrid.
- If the app is deployed on Vercel using this handler, contact email delivery is not a real external integration yet.

## Admin And Audit Integrations

- Admin authorization is based on Supabase JWT/user metadata role checks in:
  - `server/middleware/admin-auth.ts`
  - `api/admin/access/*.js`
  - `netlify/functions/api.ts`
- Audit trail writes go to Supabase table `admin_audit_log` via `server/lib/audit-logger.ts`.
- Admin APIs present in source:
  - Express: `server/routes/admin-access.ts`, `server/routes/admin-users.ts`
  - Vercel: `api/admin/access/list.js`, `api/admin/access/grant.js`, `api/admin/access/[userId].js`

## Webhooks

- Stripe webhook endpoint: `POST /api/stripe/webhook` in `server/index.ts`, handled by `server/middleware/stripe-webhook.ts`
- Mercado Pago webhook endpoint:
  - Express: `POST /api/mercadopago/webhook` in `server/routes/mercadopago.ts`
  - Vercel: `api/mercadopago-webhook.js`
- Both webhook families mutate Supabase records to reflect payment/access state.

## Maps And Other Third-Party Services

### Google Maps Via Forge Proxy

- `client/src/components/Map.tsx` loads the Google Maps JS API through a proxy URL:
  - default proxy base `https://forge.butterfly-effect.dev`
  - path `${FORGE_BASE_URL}/v1/maps/proxy`
- Required env for this path:
  - `VITE_FRONTEND_FORGE_API_KEY`
  - optional `VITE_FRONTEND_FORGE_API_URL`
- This is an optional frontend-only integration. I did not find current page wiring that proves it is part of the primary user flow.

### Agentation

- `agentation` is mounted in development only in `client/src/App.tsx`.
- This is a local/dev UX integration rather than a production third-party customer service.

## Analytics, Tracking, And Monitoring

- SEO metadata is handled locally with `react-helmet-async` in `client/src/components/ArticleSeo.tsx`.
- I did not find active integrations for:
  - Google Analytics / GA4
  - Meta Pixel
  - PostHog
  - Mixpanel
  - Hotjar
  - Sentry
  - Intercom / Crisp
- News/article content is local static content in `client/src/data/news-articles.ts` and `client/public/docs/`; there is no CMS or external content API in current source.

## SMS And Messaging

- No Twilio, MessageBird, WhatsApp API, Telegram bot, or similar SMS/chat provider integration appears in current source.
- Some UI copy mentions support channels, but I did not find an implemented messaging API.

## Environment-Driven Integration Surface

- Integration-related env templates are documented in `.env.example`.
- Hosting-specific routing/config files that affect integrations:
  - `vercel.json`
  - `netlify.toml`
  - `netlify/functions/api.ts`
- Current source also includes tracked local/prod env files:
  - `.env.local`
  - `.env.production`
- For planning, treat those checked-in env files as current repo state, but the canonical variable inventory should still come from `.env.example` plus code reads.

## Practical Planning Notes

- Canonical external platform today is Supabase.
- Canonical payment flow for the public checkout is Mercado Pago.
- Stripe is still a real dependency because billing/subscription code and schema are present, but it is not the current landing-page checkout path.
- Backend integration behavior can differ by target because Express, Netlify, and Vercel each implement overlapping API logic separately.
