# Concerns

## Snapshot

- Current repo shape is significantly more complex than the README implies: browser app in `client/`, Express server in `server/`, Vercel handlers in `api/`, a monolithic Netlify handler in `netlify/functions/api.ts`, Supabase SQL in `supabase/migrations/`, and multiple deployment manifests in `vercel.json`, `netlify.toml`, and `render.yaml`.
- Verification is already degraded:
  - `pnpm check` fails with broad type drift across client and server.
  - `pnpm test` fails because Vitest, Playwright, DOM setup, and environment-dependent server tests are not isolated cleanly.
  - `pnpm audit --prod --audit-level high` reports 19 vulnerabilities, including a critical `jspdf` issue and a high `axios` issue.

## Highest-Risk Change Areas

### 1. Runtime sprawl and incompatible backends

- The same business flows exist in multiple runtimes with different implementations:
  - Express routes in `server/routes/auth.ts`, `server/routes/payments.ts`, `server/routes/mercadopago.ts`, `server/routes/admin-access.ts`, `server/routes/admin-users.ts`
  - Vercel handlers in `api/payments/status.js`, `api/create-preference.js`, `api/mercadopago-webhook.js`, `api/admin/access/list.js`, `api/admin/access/grant.js`, `api/contact/send.ts`
  - Netlify mega-handler in `netlify/functions/api.ts`
- The implementations are not equivalent. Example mismatches:
  - `client/src/hooks/useAdminUsers.ts` expects `/api/admin/access/list` to return `{ users }`, but `server/routes/admin-access.ts` and `api/admin/access/list.js` return `{ accesses }`.
  - `client/src/lib/api/mercadopago.ts` calls `/api/create-preference`, while Express exposes `/api/mercadopago/create-preference` and Netlify handles both aliases.
  - Contact flow differs between `server/routes/contact.ts`, `api/contact/send.ts`, and `netlify/functions/api.ts`.
- Practical risk: fixing a bug in one runtime does not fix production everywhere. Any change to auth, payments, or admin requires checking at least three codepaths.

### 2. Payment stack is partially migrated and internally contradictory

- Checkout has moved to MercadoPago in `client/src/components/checkout/CheckoutPage.tsx` and `client/src/lib/mercadopago-config.ts`.
- Stripe is still present in `server/routes/stripe.ts`, `server/middleware/stripe-webhook.ts`, and `client/src/lib/stripe-config.ts`.
- `client/src/hooks/useSubscription.ts` says the old `subscriptions` table is obsolete, but still exposes Stripe checkout/portal helpers and computes subscription state from a hook that no longer returns subscription data.
- `server/routes/stripe.ts` still reads and writes `subscriptions` and `stripe_customers`, while access checks in `server/routes/payments.ts` are driven by `user_access` and `user_manual_access`.
- Practical risk: payment changes can silently break because there is no single source of truth for access entitlement or the active provider.

### 3. Admin surface is type-drifted and likely broken during routine edits

- `client/src/pages/AdminAccess.tsx` still assumes an older `AdminUser` shape with fields like `is_active`, `expires_at`, `user_email`, `granter_email`, and `granted_at`.
- `client/src/hooks/useAdminUsers.ts` defines a richer user-centric type, but the backend list endpoints return manual-access records instead.
- The current drift is visible in `pnpm check`, where `client/src/pages/AdminAccess.tsx` and `client/src/hooks/useAdminUsers.ts` fail together.
- There are also two admin pages, `client/src/pages/AdminPanel.tsx` and `client/src/pages/AdminAccess.tsx`, overlapping the same domain with different assumptions.
- Practical risk: admin access work is a hotspot for regressions because frontend contracts and backend payloads have already diverged.

## Security Concerns

### 4. MercadoPago webhook verification is incomplete or absent

- `server/lib/mercadopago.ts` explicitly accepts webhook requests without real HMAC verification and logs `TODO: Implement proper HMAC verification using crypto module`.
- `api/mercadopago-webhook.js` does not verify any webhook signature before granting access in `user_access`.
- Both webhook implementations can mutate paid access state.
- Practical risk: forged webhook calls can create or extend access records.

### 5. Admin authorization trusts mutable auth metadata

- `server/middleware/admin-auth.ts` authorizes admins via `user.user_metadata?.role === "admin"`.
- The Vercel admin handlers in `api/admin/access/list.js` and `api/admin/access/grant.js` use the same pattern.
- There is no DB-backed admin table or allowlist in the request path; authorization depends on user metadata embedded in the auth profile.
- Practical risk: if admin metadata is mis-set during auth operations or manually edited, privileged endpoints inherit that mistake everywhere.

### 6. Sensitive flows are over-logged

- Registration logs are verbose in `server/routes/auth.ts`, including request traces around account creation, link generation, and email flow.
- `client/src/lib/debugAuth.ts` persists auth flow logs into `sessionStorage` even outside development mode.
- `server/routes/contact.ts`, `api/contact/send.ts`, and multiple admin handlers log operational data directly.
- Practical risk: debugging state and user-identifying information can linger in browsers or platform logs longer than intended.

### 7. User document storage appears public-by-URL

- `client/src/hooks/useDocuments.ts` uploads to the `user-documents` storage bucket and stores `getPublicUrl(...)` output in `user_documents.file_url`.
- Download protection is only a string prefix check against the Supabase storage URL.
- Practical risk: this pattern assumes bucket privacy is not needed. If user documents contain personal case files, public URLs are the wrong default.

### 8. Markdown rendering keeps an elevated XSS surface

- `client/src/components/legal-guides/MarkdownRenderer.tsx` uses `rehypeRaw` and a custom sanitize config.
- `client/src/pages/NoticiaDetail.tsx` also uses `rehypeRaw` plus `rehypeSanitize`.
- The current content appears repo-controlled, but the rendering path is permissive enough that future content sourcing changes will be high-risk.
- Practical risk: content-system changes can create XSS exposure faster than reviewers expect because raw HTML is already enabled.

## Operational Fragility

### 9. Deployment configuration is internally inconsistent

- `vercel.json` builds only the SPA with `pnpm exec vite build`, while the main server build in `package.json` also bundles `server/start.ts`.
- `netlify.toml` routes all `/api/*` traffic into `netlify/functions/api.ts`.
- `render.yaml` declares a static site with `publishPath: dist`, but Vite outputs browser assets to `dist/public`.
- Practical risk: the active deployment target changes which backend is actually live, and at least one manifest (`render.yaml`) looks misconfigured for current build output.

### 10. Server startup and imports fail hard on missing env

- `server/start.ts` exits the process if `VITE_SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` is missing.
- `server/routes/admin-access.ts`, `server/routes/admin-users.ts`, `server/middleware/admin-auth.ts`, and `server/lib/supabase-server.ts` all instantiate privileged Supabase clients at module load with non-null assertions.
- In tests, these import-time assumptions already explode when env is absent.
- Practical risk: local setup, CI, preview environments, and partial backend reuse are all fragile because modules are not lazily configured.

### 11. CORS and origin handling are brittle across environments

- `server/index.ts` hardcodes a small local origin allowlist and optionally appends `VITE_APP_URL`.
- Netlify and Vercel handlers often set permissive `Access-Control-Allow-Origin: *` instead.
- `netlify/functions/api.ts` derives site origin dynamically, while `server/lib/mercadopago.ts` hardcodes localhost back URLs.
- Practical risk: environment moves and domain changes will produce inconsistent auth, checkout, and webhook behavior.

### 12. `netlify/functions/api.ts` is a monolith

- The file contains auth, payments, admin access, contact, and MercadoPago logic in a single handler of roughly 2,000 lines.
- Practical risk: changes are hard to review, hard to test in isolation, and likely to create unrelated regressions in adjacent branches of the path router.

## Build, Test, and Tooling Debt

### 13. TypeScript baseline is currently red

- `pnpm check` fails across routing, validation, Stripe typings, old admin screens, and stale hook contracts.
- Concrete drift examples:
  - `client/src/App.tsx` routes `GuidePage` with props incompatible with `wouter`.
  - `client/src/contexts/PaymentContext.tsx` exposes a `refetch` type that does not match the declared context signature.
  - `client/src/hooks/useSearchGuide.ts` imports `CheckItemData` from `client/src/data/steps.tsx`, but `steps.tsx` only re-exports `CheckItem`.
  - `server/middleware/stripe-webhook.ts` and `server/routes/stripe.ts` use a Stripe API version string that no longer matches installed typings.
  - `server/start.ts` uses top-level `await`, but `tsconfig.json` is not aligned for that file.
- Practical risk: refactors are happening without a trustworthy compile gate.

### 14. Test suite is not partitioned correctly

- `pnpm test` still executes Playwright specs from `e2e/` under Vitest, which then fail with `Playwright Test did not expect test.describe() to be called here`.
- Multiple browser tests fail with `document is not defined` even though `vitest.config.ts` defines a jsdom client project.
- `client/src/hooks/__tests__/useAdminMutations.test.ts` contains JSX in a `.ts` file and currently fails transformation.
- Atlaskit packages trigger transform errors in several tests.
- Server tests require live Supabase secrets and fail on import when env is missing.
- Practical risk: the test command is too noisy to protect changes; teams will stop trusting it.

### 15. `tsconfig.json` and test file patterns are drifting out of sync

- `tsconfig.json` excludes `**/*.test.ts` but not `**/*.test.tsx`, so test files still participate in `pnpm check`.
- That is part of why frontend test artifacts and obsolete pages currently break typecheck.
- Practical risk: build-health work and test-health work are coupled unnecessarily, which slows down both.

## Data Model and Product Drift

### 16. Guides and search subsystem are only partially integrated

- `client/src/pages/GuidePage.tsx` is still a placeholder-style implementation and uses `require(...)` inside ESM React code.
- `client/src/App.tsx` routes `/guia/:id` and `/guia/:slug` to `GuidePage`, but current prop typing does not match router expectations.
- `client/src/hooks/useSearchGuide.ts` and `client/src/data/guides-metadata.ts` drift on types and imports.
- Practical risk: guide-related changes will keep breaking route, search, and typing boundaries until the subsystem is normalized.

### 17. Debug-only surfaces remain in app routes

- `client/src/App.tsx` exposes `/debug-access`.
- `client/src/pages/DebugAccess.tsx` expects fields like `trialEndsAt` and `subscriptionStatus` that `useAccessStatus()` no longer returns.
- Practical risk: debugging pages are stale and can mislead operators during production incidents.

### 18. Database and migration story is fragmented

- There are formal migrations in `supabase/migrations/`, but also many alternate SQL entrypoints in `server/database-scripts/` and helper docs like `supabase/migrations/EXECUTE_THIS.sql`, `COPY_PASTE_SUPABASE.sql`, and `quick-setup.sql`.
- `client/src/hooks/useChecklistDocuments.ts` already has runtime fallback logic for a missing `checklist_documents` table, which is a sign environments are not consistently migrated.
- Practical risk: schema state can diverge between environments, and application code is already compensating for it.

## Performance and Scale Concerns

### 19. Admin queries fetch everything and filter in memory

- `server/routes/admin-access.ts` loads the entire `user_manual_access` table and then the entire Supabase user list on each request.
- Search filtering is applied in memory after fetching all users and all access rows.
- The Vercel admin handlers in `api/admin/access/list.js` and `api/admin/access/grant.js` do the same pattern.
- Practical risk: admin pages will degrade quickly as user counts grow, and the same inefficiency exists in every runtime.

### 20. Client-side sync patterns are chatty and weak on failure recovery

- `client/src/hooks/useChecklistSync.ts` writes to Supabase on every toggle without batching, retry strategy, or offline queueing.
- `client/src/hooks/useDocuments.ts`, `client/src/hooks/useProcesses.ts`, and similar hooks eagerly refetch whole tables after mutations.
- Practical risk: modest product growth will amplify network chatter and make transient failures user-visible.

### 21. External script loading is mount-sensitive

- `client/src/components/Map.tsx` injects the Google Maps script on mount and removes the script tag immediately after load.
- There is no shared loader state across component mounts.
- Practical risk: this is easy to break in multi-mount or route-transition scenarios and will be hard to debug when it flakes.

## Dependency and Supply-Chain Concerns

### 22. Known vulnerable production dependencies are present

- `pnpm audit --prod --audit-level high` currently reports:
  - critical and high issues in `jspdf`, used by `client/src/lib/pdfGenerator.ts`
  - a high issue in `axios`
  - a high transitive `serialize-javascript` issue via Remotion tooling
- Practical risk: document generation is a user-facing feature, so `jspdf` exposure is not theoretical.

### 23. Patched routing dependency raises maintenance cost

- `package.json` depends on `wouter`, and `pnpm-lock.yaml` applies a local patch from `patches/wouter@3.7.1.patch`.
- Practical risk: future router upgrades or reinstall drift can invalidate the patch unexpectedly, especially while route typing is already broken in `client/src/App.tsx`.

## Places Likely To Break During Changes

- Auth and registration:
  - `client/src/contexts/AuthContext.tsx`
  - `server/routes/auth.ts`
  - `netlify/functions/api.ts`
  - `api/contact/send.ts`
- Access control and admin:
  - `client/src/contexts/PaymentContext.tsx`
  - `client/src/hooks/useAccessStatus.ts`
  - `client/src/hooks/useAdminUsers.ts`
  - `client/src/pages/AdminPanel.tsx`
  - `client/src/pages/AdminAccess.tsx`
  - `server/routes/admin-access.ts`
  - `server/middleware/admin-auth.ts`
- Payments:
  - `client/src/components/checkout/CheckoutPage.tsx`
  - `client/src/lib/api/mercadopago.ts`
  - `server/routes/mercadopago.ts`
  - `api/create-preference.js`
  - `api/mercadopago-webhook.js`
  - `server/routes/stripe.ts`
  - `server/middleware/stripe-webhook.ts`
- Guides and content:
  - `client/src/App.tsx`
  - `client/src/pages/GuidePage.tsx`
  - `client/src/hooks/useSearchGuide.ts`
  - `client/src/components/legal-guides/MarkdownRenderer.tsx`
  - `client/src/pages/NoticiaDetail.tsx`

## Planning Priorities

1. Collapse to one backend execution model for auth, payments, admin, and contact flows.
2. Fix webhook verification and move admin authorization to a server-side source of truth.
3. Restore green `pnpm check` and isolate `pnpm test` so the repo has a trustworthy change detector again.
4. Normalize admin and payment contracts before adding features on top of them.
5. Decide whether user documents are public or private, then implement storage accordingly.
