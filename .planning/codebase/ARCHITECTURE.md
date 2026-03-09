# Architecture

## Overview

This repository is a single product with one primary frontend codebase in `client/`, one primary Node/Express backend in `server/`, and two deployment-specific serverless API variants in `netlify/functions/` and `api/`.

At runtime, the product is a gated React SPA for the "CPF Blindado" legal-consumer workflow:

- Marketing and acquisition start at `client/src/pages/Landing.tsx`.
- Authenticated paid users use the guide and workspace pages mounted from `client/src/App.tsx`.
- Persistent user data is split between:
  - Direct browser-to-Supabase access for user-owned workspace entities.
  - Backend-mediated access for registration, payment/access checks, admin operations, and contact/email flows.

The system is therefore not a pure frontend app and not a clean single-backend app either. It currently operates as a hybrid with three backend entry surfaces:

- Express app in `server/index.ts`
- Netlify function router in `netlify/functions/api.ts`
- Vercel-style functions in `api/`

That deployment duplication is a first-order architectural fact and should be assumed in future planning.

## Primary Runtime Entry Points

### Frontend

- `client/src/main.tsx`
  - Browser entrypoint.
  - Initializes Atlaskit feature flags with `client/src/lib/atlaskit-init.ts`.
  - Wraps the app in React Query via `client/src/lib/query-client.ts`.
- `client/src/App.tsx`
  - Global composition root.
  - Mounts providers in this order:
    - `HelmetProvider`
    - `ErrorBoundary`
    - `AuthProvider`
    - `PaymentProvider`
    - `AtlaskitProvider`
    - `ThemeProvider`
    - `TooltipProvider`
  - Defines all SPA routes with `wouter`.

### Express backend

- `server/start.ts`
  - Loads `.env.local` before server imports.
  - Verifies required Supabase variables.
  - Imports `server/index.ts`.
- `server/index.ts`
  - Creates the Express app and HTTP server.
  - Applies CORS and JSON parsing.
  - Mounts API routers.
  - Serves static frontend assets from `dist/public`.
  - Falls back to `index.html` for client-side routing.

### Serverless backend variants

- `netlify/functions/api.ts`
  - Monolithic Netlify handler that normalizes paths and handles multiple `/api/*` routes inside one file.
  - Exists in parallel to `server/` rather than wrapping it.
- `api/*.js` and `api/contact/send.ts`
  - Vercel-style serverless functions.
  - Implement overlapping concerns such as Mercado Pago checkout, webhook handling, payment status, and contact form delivery.

## Layered Architecture

### 1. Presentation layer

The presentation layer lives under `client/src/pages/` and `client/src/components/`.

- Page-level route entrypoints are in `client/src/pages/`.
- Reusable feature components are grouped by domain in folders like:
  - `client/src/components/auth/`
  - `client/src/components/admin/`
  - `client/src/components/checkout/`
  - `client/src/components/client-area/`
  - `client/src/components/documents/`
  - `client/src/components/landing/`
  - `client/src/components/legal-guides/`
  - `client/src/components/roadmap/`
- Shared design-system primitives live in `client/src/components/ui/`.

The frontend is route-driven rather than state-machine-driven. Most pages assemble domain hooks plus presentational components rather than delegating through a separate application service layer.

### 2. Client application/state layer

The client state layer is split across providers and hooks.

- `client/src/contexts/AuthContext.tsx`
  - Owns Supabase session/user state.
  - Uses direct Supabase browser auth for sign-in, sign-out, magic link, and password reset.
  - Uses backend registration endpoint `/api/auth/register` so the custom confirmation email flow stays server-controlled.
- `client/src/contexts/PaymentContext.tsx`
  - Wraps payment/access state from `client/src/hooks/useAccessStatus.ts`.
- `client/src/components/auth/ProtectedRoute.tsx`
  - Enforces auth, payment gating, and admin gating at route render time.
- `client/src/lib/query-client.ts`
  - Central React Query configuration for cached server-fetched data, especially admin/payment status flows.

The hook layer is the main boundary between UI and data sources:

- Backend-backed hooks:
  - `client/src/hooks/useAccessStatus.ts`
  - `client/src/hooks/useAdminUsers.ts`
  - `client/src/hooks/useAdminMutations.ts`
- Direct Supabase hooks:
  - `client/src/hooks/useChecklistSync.ts`
  - `client/src/hooks/useDocuments.ts`
  - `client/src/hooks/useNotes.ts`
  - `client/src/hooks/useTodos.ts`
  - `client/src/hooks/useProcesses.ts`

### 3. Content/model layer in the frontend

Some core product behavior is static-content-driven, not database-driven.

- `client/src/data/steps.tsx`
  - Canonical definition of the 5-step legal journey.
  - Drives the guide UI, progress calculation, downloads, and search indexing.
- `client/src/hooks/useCurrentPhase.ts`
  - Derives phase progress from checked items.
- `client/src/hooks/useSearchGuide.ts`
  - Builds an in-memory search index from step content plus guide metadata.
- `client/src/data/guides-metadata.ts`
  - Guide catalog metadata for content discovery.

This means some "domain model" is encoded in TypeScript content files, while user state for that model lives in Supabase.

### 4. Backend API layer

The Express API is organized by route modules under `server/routes/`.

- `server/routes/auth.ts`
  - Registration and user-check endpoints.
  - Uses Supabase admin APIs plus custom email delivery.
- `server/routes/payments.ts`
  - Access status lookup from `user_access` and `user_manual_access`.
- `server/routes/mercadopago.ts`
  - Preference creation, payment lookup, webhook processing, config endpoint.
- `server/routes/stripe.ts`
  - Legacy Stripe checkout/portal/subscription routes.
- `server/routes/contact.ts`
  - Contact form handling and email dispatch.
- `server/routes/admin-access.ts`
  - Manual-access list/grant/revoke flow.
- `server/routes/admin-users.ts`
  - Admin user listing enriched with access data.

The route modules are relatively "thick": validation, data access, external service calls, and response shaping often happen in the route file itself rather than in a separate service/use-case layer.

### 5. Middleware and service layer

- `server/middleware/admin-auth.ts`
  - Validates bearer tokens with Supabase and enforces `user_metadata.role === "admin"`.
- `server/middleware/validation.ts`
  - Validation and logging helpers for registration flow.
- `server/middleware/stripe-webhook.ts`
  - Raw-body Stripe webhook handling.
- `server/services/email.service.ts`
  - Higher-level email composition service.
- `server/lib/emailit.ts`
  - Low-level EmailIt API client.
- `server/lib/mercadopago.ts`
  - Mercado Pago integration helpers.
- `server/lib/mercadopago-config.ts`
  - Mercado Pago config constants like access duration.
- `server/lib/audit-logger.ts`
  - Central write/read helpers for `admin_audit_log`.
- `server/lib/supabase-server.ts`
  - Generic service-role Supabase client helper, though several route files still create their own clients instead of reusing it.

### 6. Persistence layer

Supabase is the primary system of record for app data and access control.

Key schema sources:

- `supabase/migrations/001_initial_schema.sql`
- `supabase/migrations/003_manual_access.sql`
- `supabase/migrations/010_admin_audit_log.sql`
- additional incremental migrations in `supabase/migrations/`

Important persisted entities visible in code:

- `checklist_progress`
- `user_processes`
- `user_documents`
- `user_notes`
- `user_todos`
- `payments`
- `user_access`
- `user_manual_access`
- `subscriptions`
- `stripe_customers`
- `admin_audit_log`

Client-side type mirrors exist in:

- `client/src/types/supabase.ts`
- `shared/supabase/types.ts`

`client/src/types/supabase.ts` is the broader and more current application-facing type surface.

## Data Flow

### Auth and session flow

1. `client/src/contexts/AuthContext.tsx` initializes the browser session with `client/src/lib/supabase.ts`.
2. Normal login uses `supabase.auth.signInWithPassword`.
3. Registration is intentionally routed through `/api/auth/register` instead of direct client signup.
4. `server/routes/auth.ts` creates the user via Supabase admin APIs and sends a custom confirmation email template from `client/public/email-templates/confirm-signup.html`.
5. After auth state changes, gated routes re-evaluate through `client/src/components/auth/ProtectedRoute.tsx`.

### Access and payment gating flow

1. `client/src/hooks/useAccessStatus.ts` calls `/api/payments/status` with the Supabase access token.
2. `server/routes/payments.ts` verifies the token and queries:
   - `user_access`
   - `user_manual_access`
3. `client/src/contexts/PaymentContext.tsx` exposes that state to the app.
4. `client/src/components/auth/ProtectedRoute.tsx` redirects unpaid users to `/checkout`.

Mercado Pago purchase flow:

1. `client/src/components/checkout/CheckoutPage.tsx` calls `client/src/lib/api/mercadopago.ts`.
2. Backend preference creation happens through `/api/mercadopago/create-preference` in `server/routes/mercadopago.ts` or a deployment-specific variant.
3. Mercado Pago webhook calls `/api/mercadopago/webhook`.
4. Webhook handler stores a `payments` row and grants `user_access`.
5. Access status is later surfaced through `/api/payments/status`.

Stripe remains present as a legacy or fallback path:

- Client config in `client/src/lib/stripe-config.ts`
- Server routes in `server/routes/stripe.ts`
- Subscriptions persisted in `subscriptions`

### User workspace data flow

For guide/workspace features, the browser talks directly to Supabase:

- Checklist progress:
  - UI in `client/src/pages/Home.tsx`
  - Hook in `client/src/hooks/useChecklistSync.ts`
  - Table `checklist_progress`
- Documents:
  - Components in `client/src/components/documents/`
  - Hook in `client/src/hooks/useDocuments.ts`
  - Uses both `user_documents` table and Supabase Storage bucket `user-documents`
- Notes:
  - Components in `client/src/components/notes/`
  - Hook in `client/src/hooks/useNotes.ts`
- Todos:
  - Components in `client/src/components/todos/`
  - Hook in `client/src/hooks/useTodos.ts`
- Processes:
  - Components in `client/src/components/processes/`
  - Hook in `client/src/hooks/useProcesses.ts`

This direct access pattern relies on Supabase RLS rather than on the Node backend for per-user authorization.

### Admin flow

1. Admin UI is mounted from `client/src/pages/AdminPanel.tsx`.
2. The page and route guard both depend on `user.user_metadata.role`.
3. Client hooks fetch and mutate through admin endpoints:
   - `client/src/hooks/useAdminUsers.ts`
   - `client/src/hooks/useAdminMutations.ts`
4. `server/middleware/admin-auth.ts` re-verifies admin privileges server-side.
5. Admin routes query or mutate `user_manual_access`, `user_access`, and auth users.
6. `server/lib/audit-logger.ts` writes to `admin_audit_log`.

## Shared Abstractions and Contracts

### Path aliases

Vite aliases in `vite.config.ts` are core shared boundaries:

- `@` -> `client/src`
- `@shared` -> `shared`
- `@assets` -> `attached_assets`

### Type contracts

- Frontend DB contract: `client/src/types/supabase.ts`
- Shared DB contract: `shared/supabase/types.ts`
- Shared constants: `shared/const.ts`
- Client form/types:
  - `client/src/types/form.ts`
  - `client/src/types/guides.ts`
  - `client/src/types/theme.ts`
  - `client/src/types/tokens.ts`

### UI abstraction

There is a dual UI stack in active use:

- Atlaskit-based provider/theme setup in:
  - `client/src/components/providers/AtlaskitProvider.tsx`
  - `client/src/lib/atlaskit-theme.ts`
- shadcn/Radix-style primitive set in `client/src/components/ui/`

`client/src/App.tsx` explicitly documents this as an in-progress migration. That mixed UI foundation is a real shared abstraction boundary for any future UI work.

## Module Boundaries

### Boundary: pages vs components

- `client/src/pages/` should be treated as route entrypoints and composition shells.
- `client/src/components/` holds reusable UI and feature modules.

### Boundary: hooks vs UI

- Data ownership generally lives in `client/src/hooks/`.
- Rendering and interaction composition live in components/pages.

### Boundary: direct Supabase vs backend API

Use backend routes for:

- registration
- access/payment checks
- admin operations
- webhooks
- contact/email

Use direct Supabase browser access for:

- user checklist state
- user documents and storage
- user notes
- user todos
- user processes

This split is one of the most important planning boundaries in the repo.

### Boundary: canonical backend vs deployment adapters

The codebase does not currently have a single backend implementation reused across all deployments.

- `server/` is the richest and clearest backend source.
- `netlify/functions/api.ts` is a separate implementation.
- `api/` contains additional separate implementations.

For planning, treat `server/` plus `supabase/migrations/` as the canonical architecture, and treat `netlify/functions/api.ts` and `api/` as deployment adapters with duplicated logic that may drift.

## Architectural Constraints and Planning Notes

- The app is operationally centered on Supabase, not on the Node server.
- Backend logic is duplicated across deployment targets, which increases drift risk.
- Stripe and Mercado Pago both exist, but Mercado Pago appears to be the primary live checkout path in current UI code.
- Some older types and README content underdescribe the current product scope; current source under `client/src/`, `server/`, and `supabase/migrations/` is more accurate.
- `client/src/pages/AdminPanel.tsx` contains some inline auth/session-fetching logic that duplicates patterns already available in hooks and contexts.
- `server/routes/*` frequently instantiate their own Supabase clients instead of consistently reusing `server/lib/supabase-server.ts`.
- Static legal/process content in `client/src/data/steps.tsx` is effectively part of the domain model and should be treated as such during planning.
