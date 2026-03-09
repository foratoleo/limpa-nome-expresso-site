# Structure

## Repository Layout

Top-level layout, using current source as the guide:

- `client/`
  - Vite/React frontend application.
- `server/`
  - Express backend, integration code, middleware, and backend tests.
- `api/`
  - Vercel-style serverless functions that duplicate part of the backend surface.
- `netlify/functions/`
  - Netlify serverless function entrypoint, also overlapping with `server/`.
- `supabase/`
  - SQL migrations and Supabase local metadata.
- `shared/`
  - Small shared TypeScript surface for constants and DB types.
- `e2e/`
  - Playwright end-to-end and regression tests.
- `scripts/`
  - Utility scripts, mostly for migrations and operational tasks.
- `docs/`
  - Deployment and runbook-style docs.
- `.planning/`
  - Planning artifacts; not the source of truth for product behavior.

## Frontend Layout

### `client/src/`

This is the main application codebase.

Key top-level files:

- `client/src/main.tsx`
  - Browser bootstrap.
- `client/src/App.tsx`
  - Global provider composition and route table.
- `client/src/index.css`
  - Global styling foundation.
- `client/src/const.ts`
  - Frontend constants.

### `client/src/pages/`

Route entrypoints live here. File names are page-oriented and mostly map directly to routes in `client/src/App.tsx`.

Examples:

- `client/src/pages/Landing.tsx`
- `client/src/pages/Home.tsx`
- `client/src/pages/Dashboard.tsx`
- `client/src/pages/Documents.tsx`
- `client/src/pages/Templates.tsx`
- `client/src/pages/Support.tsx`
- `client/src/pages/Process.tsx`
- `client/src/pages/AdminPanel.tsx`
- `client/src/pages/AuthCallback.tsx`
- `client/src/pages/PaymentSuccess.tsx`
- `client/src/pages/PaymentFailed.tsx`
- `client/src/pages/GuidePage.tsx`

Pattern:

- Pages compose hooks plus components.
- Route protection is usually applied in `client/src/App.tsx` through `ProtectedRoute`, not inside the page module itself.

### `client/src/components/`

Components are grouped primarily by feature/domain, with a separate `ui/` primitives folder.

Feature folders:

- `client/src/components/admin/`
  - Admin panel widgets like tables, filters, and dialogs.
- `client/src/components/auth/`
  - Auth modal, login/register forms, and `ProtectedRoute`.
- `client/src/components/checkout/`
  - Mercado Pago checkout UI.
- `client/src/components/client-area/`
  - Dashboard panels and sidebar.
- `client/src/components/documents/`
  - User document upload/list UI.
- `client/src/components/form/`
  - Generic form building blocks and related tests.
- `client/src/components/landing/`
  - Marketing page sections.
- `client/src/components/legal-guides/`
  - Guide browsing and markdown rendering.
- `client/src/components/notes/`
  - User note management.
- `client/src/components/pricing/`
  - Pricing section components, likely older Stripe-oriented UI.
- `client/src/components/processes/`
  - User process management.
- `client/src/components/providers/`
  - App-level provider adapters such as Atlaskit theme integration.
- `client/src/components/roadmap/`
  - Timeline/process-map UI for the core guide.
- `client/src/components/todos/`
  - Todo/task management UI.

Shared primitives:

- `client/src/components/ui/`
  - Reusable low-level components such as `button.tsx`, `dialog.tsx`, `input.tsx`, `table.tsx`, `tooltip.tsx`, `sidebar.tsx`.

Pattern:

- Folder names are noun-based and domain-based.
- Many feature folders expose an `index.ts` barrel file for cleaner imports.
- UI primitives are file-per-component and lower-level than feature folders.

### `client/src/hooks/`

Hooks hold most client-side data access and derived-state logic.

Examples:

- `client/src/hooks/useAccessStatus.ts`
- `client/src/hooks/useChecklistSync.ts`
- `client/src/hooks/useDocuments.ts`
- `client/src/hooks/useNotes.ts`
- `client/src/hooks/useTodos.ts`
- `client/src/hooks/useProcesses.ts`
- `client/src/hooks/useAdminUsers.ts`
- `client/src/hooks/useAdminMutations.ts`
- `client/src/hooks/useCurrentPhase.ts`
- `client/src/hooks/useSearchGuide.ts`
- `client/src/hooks/useDebounce.ts`

Pattern:

- Hooks use `useX.ts` naming consistently.
- Business/data hooks sit here rather than in `lib/`.
- Tests for hooks are colocated under `client/src/hooks/__tests__/`.

### `client/src/contexts/`

App-wide client state lives here:

- `client/src/contexts/AuthContext.tsx`
- `client/src/contexts/PaymentContext.tsx`
- `client/src/contexts/ThemeContext.tsx`

Pattern:

- Contexts represent cross-route concerns.
- Feature-specific state generally stays in hooks instead of new contexts.

### `client/src/lib/`

`lib/` contains integrations, adapters, and reusable non-visual utilities.

Examples:

- API/integration:
  - `client/src/lib/supabase.ts`
  - `client/src/lib/api/mercadopago.ts`
  - `client/src/lib/stripe-config.ts`
  - `client/src/lib/mercadopago-config.ts`
- application setup:
  - `client/src/lib/query-client.ts`
  - `client/src/lib/atlaskit-init.ts`
  - `client/src/lib/atlaskit-theme.ts`
- document/template utilities:
  - `client/src/lib/docxGenerator.ts`
  - `client/src/lib/pdfGenerator.ts`
  - `client/src/lib/templateFetcher.ts`
  - `client/src/lib/templateParser.ts`
- validation and misc helpers:
  - `client/src/lib/formValidators.ts`
  - `client/src/lib/debugAuth.ts`
  - `client/src/lib/utils.ts`
  - `client/src/lib/validation/`

Pattern:

- `lib/` is for reusable code that is not a React hook and not a UI component.
- Subfolders appear when a concern grows, for example `client/src/lib/api/` and `client/src/lib/validation/`.

### `client/src/data/`

Static application content and metadata live here.

- `client/src/data/steps.tsx`
  - Core legal journey definition.
- `client/src/data/guides-metadata.ts`
  - Guide registry/search metadata.
- `client/src/data/news-articles.ts`
  - News/article data.

Pattern:

- Data files are treated as source code, not content pulled from a CMS.
- This folder is important for planning because product logic depends on it.

### `client/src/types/`

Frontend types are grouped by concern:

- `client/src/types/supabase.ts`
- `client/src/types/form.ts`
- `client/src/types/guides.ts`
- `client/src/types/theme.ts`
- `client/src/types/tokens.ts`

Pattern:

- Shared DB types are duplicated here in a richer app-facing form than `shared/`.

### `client/src/config/`

- `client/src/config/formSchemas.ts`

This folder is small and currently holds configuration-like form schema material rather than runtime environment config.

### `client/src/utils/`

Utility helpers with some migration notes:

- `client/src/utils/icons.ts`
- `client/src/utils/colors.ts`
- `client/src/utils/ICON_MIGRATION.md`

### `client/src/video/`

Separate Remotion video entry surface:

- `client/src/video/Root.tsx`
- `client/src/video/PhaseTrailVideo.tsx`
- `client/src/video/Config.ts`

This is adjacent to the main app, not embedded into it.

### `client/src/__tests__/`

Frontend test support and broad component/theme tests:

- `client/src/__tests__/setup.ts`
- `client/src/__tests__/components.test.tsx`
- `client/src/__tests__/theme.test.tsx`

## Backend Layout

### `server/`

This is the main backend implementation.

Core entrypoints:

- `server/start.ts`
- `server/index.ts`

### `server/routes/`

Express route modules organized by domain:

- `server/routes/auth.ts`
- `server/routes/contact.ts`
- `server/routes/mercadopago.ts`
- `server/routes/payments.ts`
- `server/routes/stripe.ts`
- `server/routes/admin-access.ts`
- `server/routes/admin-users.ts`

Pattern:

- File names are endpoint-domain-based.
- Each file exports a router.
- Routes usually contain validation, service calls, and database access in one place.

### `server/middleware/`

Cross-cutting request concerns:

- `server/middleware/admin-auth.ts`
- `server/middleware/stripe-webhook.ts`
- `server/middleware/validation.ts`

Pattern:

- Middleware naming is explicit and responsibility-specific.

### `server/lib/`

Backend integration and infrastructure helpers:

- `server/lib/supabase-server.ts`
- `server/lib/emailit.ts`
- `server/lib/mercadopago.ts`
- `server/lib/mercadopago-config.ts`
- `server/lib/audit-logger.ts`

Pattern:

- `lib/` is for reusable backend helpers and external API adapters.
- Some routes still create clients inline rather than depending only on `lib/`.

### `server/services/`

Higher-level backend service objects:

- `server/services/email.service.ts`

Pattern:

- This layer exists, but it is thin. Most backend business logic still lives in route files.

### `server/tests/` and `server/routes/__tests__/`

Backend tests are split by subject:

- route tests under `server/routes/__tests__/`
- broader tests under `server/tests/`
- DB-focused tests under `server/tests/database/`

Examples:

- `server/routes/__tests__/admin-access.test.ts`
- `server/routes/__tests__/admin-users.test.ts`
- `server/tests/registration.test.ts`
- `server/tests/database/rls-policies.test.ts`

### `server/database-scripts/`

Operational SQL scripts and testing docs that sit outside the canonical `supabase/migrations/` history.

Examples:

- `server/database-scripts/00_create_payments_table.sql`
- `server/database-scripts/002_create_user_access.sql`
- `server/database-scripts/TEST_QUICK_START.md`

Planning note:

- Treat this folder as operational/support SQL, not the primary migration history.

## Deployment-Specific Backend Layout

### `netlify/functions/`

- `netlify/functions/api.ts`

This is a single-function API router for Netlify. It overlaps heavily with `server/routes/` and should be treated as a separate deployment adapter rather than a thin wrapper.

### `api/`

Serverless functions for Vercel-style deployment:

- `api/create-preference.js`
- `api/mercadopago-webhook.js`
- `api/mercadopago.js`
- `api/payments/status.js`
- `api/contact/send.ts`

Pattern:

- File structure matches request paths.
- Logic is duplicated rather than shared from `server/`.

## Database and Shared Code Layout

### `supabase/migrations/`

This is the canonical schema history for planning database changes.

Examples:

- `supabase/migrations/001_initial_schema.sql`
- `supabase/migrations/003_manual_access.sql`
- `supabase/migrations/007_create_user_access_table.sql`
- `supabase/migrations/010_admin_audit_log.sql`

Pattern:

- Incremental SQL migrations.
- Some helper files also exist, such as `COMBINED_MIGRATIONS.sql` and setup scripts, but the numbered files are the clearest source of change history.

### `shared/`

Small shared TS surface:

- `shared/const.ts`
- `shared/supabase/types.ts`

Pattern:

- Intended for code shared across client/server, though current usage appears limited compared with `client/src/types/supabase.ts`.

## Public Assets and Content

### `client/public/`

Static assets served by Vite:

- `client/public/email-templates/`
- `client/public/peticao_inicial_jec.md`
- `client/public/favicon.svg`
- `client/public/sitemap.xml`
- media files like `client/public/ln01.mp4`

Pattern:

- Templates and downloadable legal content are kept as static assets, then fetched client-side or read server-side.

## Tooling and Operations

### Root config files

Important operational files at the repo root:

- `package.json`
- `vite.config.ts`
- `vitest.config.ts`
- `playwright.config.ts`
- `tsconfig.json`
- `tsconfig.node.json`
- `netlify.toml`
- `vercel.json`
- `render.yaml`

Pattern:

- This repo supports multiple deployment targets simultaneously.

### `scripts/`

Utility scripts:

- `scripts/execute-migrations.ts`
- `scripts/run-migrations.cjs`

### `e2e/`

Playwright end-to-end coverage:

- `e2e/accessibility.spec.ts`
- `e2e/admin-panel.spec.ts`
- `e2e/admin-panel-search.spec.ts`
- `e2e/visual-regression.spec.ts`

## Naming and Organization Patterns

Observed patterns in current source:

- React route pages use PascalCase file names in `client/src/pages/`.
- Feature hooks use `useX.ts` naming in `client/src/hooks/`.
- Feature component folders are grouped by business domain rather than by technical layer alone.
- Shared UI primitives use lowercase kebab-style file names in `client/src/components/ui/` such as `alert-dialog.tsx` and `dropdown-menu.tsx`.
- Many feature folders expose barrel exports through `index.ts`.
- Backend route files are domain-named and export Express routers.
- SQL migration files are numbered and descriptive.

## Practical Planning Boundaries

For future planning, these folders are the most important ownership zones:

- Frontend UX and route behavior: `client/src/pages/` and `client/src/components/`
- Client data flows: `client/src/hooks/`, `client/src/contexts/`, `client/src/lib/`
- Static product content: `client/src/data/` and `client/public/`
- Canonical backend behavior: `server/`
- Canonical database evolution: `supabase/migrations/`
- Deployment adapters with drift risk: `netlify/functions/` and `api/`

Folders that exist but should usually be treated as secondary evidence, not primary architecture sources:

- `.planning/`
- `docs/`
- `server/database-scripts/`
- generated or operational directories like `.netlify/`, `dist/`, `.omc/`, `.omx/`, `.dr_ai/`
