# Stack

## Overview

- The repo is a TypeScript monorepo-style app with a browser client in `client/`, an Express backend in `server/`, serverless adapters in `api/` and `netlify/functions/`, Supabase SQL in `supabase/migrations/`, and a small `shared/` folder.
- `package.json` declares `"type": "module"`, so runtime code is ESM across frontend and backend.
- The active app shape is a Vite-built SPA plus API endpoints. Source supports three deployment modes at once:
  - Standalone Node server via `server/start.ts` -> `server/index.ts`
  - Netlify function wrapper via `netlify/functions/api.ts`
  - Vercel-style serverless endpoints via `api/*.js` and `api/**/*.ts`

## Languages And Runtime

- Primary language: TypeScript in `client/src/`, `server/`, `shared/`, `vite.config.ts`, `vitest.config.ts`, and `playwright.config.ts`.
- Some serverless endpoints are plain JavaScript in `api/*.js`.
- Node.js is the backend/runtime target:
  - `netlify.toml` pins `NODE_VERSION = "20"`
  - `server/start.ts` loads `.env.local` and starts the Node server
  - `package.json` builds the server with `esbuild` and runs it with `node dist/start.js`
- Browser runtime is React 19 from `client/src/main.tsx`.

## Frontend Stack

- Build tool: Vite 7 configured in `vite.config.ts`.
- Frontend framework: React 19 with React DOM 19 from `package.json`.
- Routing: `wouter` in `client/src/App.tsx`.
- Head/SEO management: `react-helmet-async` in `client/src/App.tsx` and `client/src/components/ArticleSeo.tsx`.
- Async state/data fetching: `@tanstack/react-query` in `client/src/main.tsx`, `client/src/lib/query-client.ts`, and hooks such as `client/src/hooks/useAccessStatus.ts`.
- Forms: `react-hook-form`, `@hookform/resolvers`, and `zod`; validation schemas live in `client/src/config/formSchemas.ts` and `client/src/lib/validation/`.
- Styling system:
  - Tailwind CSS 4 via `@tailwindcss/vite` in `vite.config.ts`
  - Global tokens and theme CSS in `client/src/index.css`
  - `tw-animate-css` and `tailwindcss-animate` for motion utilities
  - `clsx`, `tailwind-merge`, and `class-variance-authority` for component styling
- UI component sources:
  - Large custom UI layer in `client/src/components/ui/`
  - Radix primitives from `@radix-ui/*`
  - Atlassian/Atlaskit migration layer in `client/src/components/providers/AtlaskitProvider.tsx`, `client/src/lib/atlaskit-init.ts`, and `client/src/lib/atlaskit-theme.ts`
- Notifications: `sonner` in `client/src/App.tsx`.
- Motion/media:
  - `framer-motion` in dependencies
  - Remotion video composition entrypoints in `client/src/video/`
- Document generation in the browser:
  - PDF via `client/src/lib/pdfGenerator.ts` and `jspdf`
  - DOCX via `client/src/lib/docxGenerator.ts` and `docx`
  - File downloads via `file-saver`

## Backend Stack

- HTTP server: Express 4 in `server/index.ts`.
- CORS middleware: `cors` in `server/index.ts`.
- Raw server bootstrap: `http.createServer()` in `server/index.ts`.
- Environment loading: `dotenv` in `server/start.ts`.
- Backend route groups:
  - Auth: `server/routes/auth.ts`
  - Contact/support email: `server/routes/contact.ts`
  - Mercado Pago: `server/routes/mercadopago.ts`
  - Stripe: `server/routes/stripe.ts`
  - Payment/access status: `server/routes/payments.ts`
  - Admin access: `server/routes/admin-access.ts`
  - Admin user listing: `server/routes/admin-users.ts`
- Webhook handling:
  - Stripe webhook middleware in `server/middleware/stripe-webhook.ts`
  - Mercado Pago webhook handler inside `server/routes/mercadopago.ts`
- Shared backend helpers:
  - Supabase admin client in `server/lib/supabase-server.ts`
  - Mercado Pago SDK wrapper in `server/lib/mercadopago.ts`
  - EmailIt client in `server/lib/emailit.ts`
  - Admin audit logger in `server/lib/audit-logger.ts`

## Data And Persistence

- Primary database/auth/storage platform: Supabase.
- Frontend Supabase client: `client/src/lib/supabase.ts`.
- Backend/service-role Supabase clients appear in `server/routes/*.ts`, `server/middleware/*.ts`, and `netlify/functions/api.ts`.
- SQL schema and policy history lives in `supabase/migrations/`.
- Main persisted app entities present in migrations and hooks:
  - `checklist_progress`
  - `user_processes`
  - `user_documents`
  - `checklist_documents`
  - `user_manual_access`
  - `user_access`
  - `payments`
  - `subscriptions`
  - `stripe_customers`
  - `admin_audit_log`
- Supabase Storage bucket usage is hardcoded in `client/src/hooks/useDocuments.ts` as `user-documents`.

## Tooling And Quality

- Package manager: pnpm via `packageManager` in `package.json` and `pnpm-lock.yaml`.
- Formatting: Prettier config in `.prettierrc`.
- Type checking: `tsc --noEmit` via `pnpm check` and `tsconfig.json`.
- Testing:
  - Vitest projects for client and server in `vitest.config.ts`
  - React Testing Library and jsdom for frontend tests
  - Node-based server/database tests in `server/tests/`
  - Playwright E2E in `playwright.config.ts`
- Build pipeline:
  - `pnpm build` runs `vite build`
  - Server bundle is produced by `esbuild server/start.ts ... --outdir=dist`
- Vite dev tooling includes:
  - `@builder.io/vite-plugin-jsx-loc`
  - `vite-plugin-manus-runtime`
  - custom debug log collector in `vite.config.ts` writing to `.manus-logs/`
- Dependency patching/override:
  - `wouter` patch in `patches/wouter@3.7.1.patch`
  - `tailwindcss > nanoid` override in `package.json`

## Configuration Surfaces

- Frontend/client env is loaded from repo root because `vite.config.ts` sets `envDir`.
- Important runtime config files:
  - `vite.config.ts`
  - `tsconfig.json`
  - `tsconfig.node.json`
  - `vercel.json`
  - `netlify.toml`
  - `.env.example`
  - `.env.production.example`
- The code expects these env groups:
  - Supabase: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_URL`
  - App URL/origin: `VITE_APP_URL`, `PUBLIC_SITE_URL`, `VERCEL_URL`
  - Email: `EMAILIT_API_KEY`, `EMAILIT_DEFAULT_FROM`, `CONTACT_EMAIL`
  - Payments: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `VITE_STRIPE_PUBLIC_KEY`, `MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_PUBLIC_KEY`
  - Optional map proxy: `VITE_FRONTEND_FORGE_API_KEY`, `VITE_FRONTEND_FORGE_API_URL`
- Source currently contains tracked env files `/.env.local` and `/.env.production` in addition to templates. Planning should treat committed env material as part of the current repo state.

## Deployment-Relevant Stack Choices

### Standalone Node deploy

- `pnpm build` outputs frontend assets to `dist/public` and backend bundle to `dist/start.js`.
- `pnpm start` runs `NODE_ENV=production node dist/start.js`.
- `server/index.ts` serves both API routes and static SPA assets.

### Vercel deploy

- `vercel.json` serves `dist/public` as the output directory and routes `/api/*` to `api/*`.
- Vercel serverless endpoints exist in:
  - `api/create-preference.js`
  - `api/mercadopago.js`
  - `api/mercadopago-webhook.js`
  - `api/payments/status.js`
  - `api/contact/send.ts`
  - `api/admin/access/*.js`
- This is a parallel backend implementation rather than a thin proxy to `server/`.

### Netlify deploy

- `netlify.toml` publishes `dist/public` and rewrites `/api/*` to `/.netlify/functions/api/:splat`.
- `netlify/functions/api.ts` is a consolidated Netlify handler that re-implements several API flows directly.

## Notable Stack State

- The codebase is mid-migration on UI and monetization:
  - Atlaskit and legacy theme systems run together in `client/src/App.tsx`
  - Stripe subscription code remains in `server/routes/stripe.ts`, `client/src/hooks/useSubscription.ts`, and `client/src/lib/stripe-config.ts`
  - Landing and checkout explicitly switched to Mercado Pago in `client/src/pages/Landing.tsx` and `client/src/components/checkout/CheckoutPage.tsx`
- Because Express routes, Netlify function code, and Vercel `api/` handlers all coexist, backend behavior can differ by hosting target. Any future planning should decide which backend path is canonical before major changes.
