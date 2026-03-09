# Testing Overview

## Test Stack

- Unit and integration tests use Vitest, configured in `vitest.config.ts`.
- Client-side tests run in `jsdom` with React Testing Library and `@testing-library/jest-dom`. The setup file is `client/src/__tests__/setup.ts`.
- End-to-end and visual tests use Playwright, configured in `playwright.config.ts`.
- Server HTTP tests use `supertest` against ad hoc Express apps, for example `server/tests/registration.test.ts` and `server/routes/__tests__/admin-access.test.ts`.
- Database tests hit Supabase directly through a service-role client from `server/tests/database/conftest.ts`.

## File Layout

- Client tests are colocated under `client/src/__tests__`, `client/src/hooks/__tests__`, and component-local `__tests__` folders such as `client/src/components/admin/__tests__`.
- Current client test files:
  - `client/src/__tests__/components.test.tsx`
  - `client/src/__tests__/theme.test.tsx`
  - `client/src/hooks/__tests__/useAdminMutations.test.ts`
  - `client/src/hooks/__tests__/useDebounce.test.ts`
  - `client/src/components/admin/__tests__/RevokeConfirmDialog.test.tsx`
  - `client/src/components/admin/__tests__/UserFilters.test.tsx`
  - `client/src/components/admin/__tests__/UserSearchInput.test.tsx`
  - `client/src/components/admin/__tests__/UserStatusBadge.test.tsx`
  - `client/src/components/form/FormInput.test.tsx`
- Server tests are split between `server/tests` and `server/routes/__tests__`.
- Database-focused tests live in `server/tests/database`.
- E2E specs live in `e2e`, currently including `e2e/accessibility.spec.ts`, `e2e/admin-panel-search.spec.ts`, `e2e/admin-panel.spec.ts`, and `e2e/visual-regression.spec.ts`.

## Vitest Configuration Shape

- `vitest.config.ts` defines two projects:
  - `client`: `jsdom`, globals enabled, setup file `./client/src/__tests__/setup.ts`, includes `client/src/**/*.{test,spec}.{ts,tsx}`.
  - `server`: `node`, globals enabled, includes only `server/tests/**/*.{test,spec}.{ts,tsx}`.
- Coverage is configured with the V8 provider and HTML, JSON, text, and LCOV reporters, writing to `./coverage`.
- Coverage thresholds are set at 50% statements, 40% branches, 50% functions, and 50% lines in `vitest.config.ts`.
- Coverage includes only selected app paths such as `client/src/components`, `client/src/lib`, `client/src/utils`, `client/src/types`, `server/routes`, and `server/lib`.

## Current Coverage Shape

- Coverage is concentrated around design-system migration code and the admin/access flow.
- Client coverage is strongest in:
  - UI primitives and migrated components via `client/src/__tests__/components.test.tsx`
  - Theme/token utilities via `client/src/__tests__/theme.test.tsx`
  - Admin interaction components under `client/src/components/admin/__tests__`
  - A couple of hooks under `client/src/hooks/__tests__`
- Server coverage is strongest in:
  - Registration flow via `server/tests/registration.test.ts`
  - Database policy/index/performance checks via `server/tests/database/*.test.ts`
- By file count, the repo currently has 9 client test files, 4 Vitest-included server test files under `server/tests`, 2 server route test files outside the configured include path, and 4 Playwright spec files.
- Large areas remain effectively uncovered by source inspection:
  - Most pages in `client/src/pages`
  - Most feature hooks such as `client/src/hooks/useDocuments.ts`, `client/src/hooks/useNotes.ts`, and `client/src/hooks/useProcesses.ts`
  - Most server routes including `server/routes/contact.ts`, `server/routes/stripe.ts`, `server/routes/mercadopago.ts`, and parts of `server/routes/payments.ts`

## Mocking And Test Helpers

- Browser APIs are globally mocked in `client/src/__tests__/setup.ts`, including `localStorage`, `matchMedia`, `ResizeObserver`, `IntersectionObserver`, and `window.scrollTo`.
- Client tests use `vi.mock(...)` for module-level seams. Good examples:
  - `client/src/hooks/__tests__/useAdminMutations.test.ts` mocks `@/lib/supabase` and `sonner`
  - Admin component tests use fake timers and spies to control debounce and callbacks
- `global.fetch` is replaced directly in client hook tests, especially `client/src/hooks/__tests__/useAdminMutations.test.ts`.
- Query-hook tests build an isolated `QueryClient` and wrapper `QueryClientProvider` inside the spec rather than relying on shared helpers.
- Server HTTP tests construct small Express apps in the spec files, for example `server/tests/registration.test.ts` and `server/routes/__tests__/admin-access.test.ts`.
- Database tests share fixtures and Supabase helpers through `server/tests/database/conftest.ts`.

## Practical Gaps And Drift

- `server/routes/__tests__/admin-access.test.ts` and `server/routes/__tests__/admin-users.test.ts` are outside the Vitest server include glob in `vitest.config.ts`, so they are likely not executed by `pnpm test`.
- `client/src/components/form/FormInput.test.tsx` is not a real test suite. It exports `FormDemo` and contains no assertions, so it behaves as a demo file with a `.test.tsx` suffix.
- Playwright config appears out of sync with Vite dev config:
  - `playwright.config.ts` uses `baseURL: "http://localhost:3000"` and waits for `url: "http://localhost:3000"`.
  - `vite.config.ts` starts the dev server on port `3010`.
- The main E2E login flow in `e2e/admin-panel.spec.ts` goes to `/login`, but `client/src/App.tsx` does not define a `/login` route. That suggests at least part of the E2E suite is stale against the current app shell.
- Some assertions also look stale against current implementation. For example, `server/routes/__tests__/admin-access.test.ts` expects `{ error: "Unauthorized" }`, while `server/middleware/admin-auth.ts` returns more specific unauthorized messages.
- The database suite depends on real infrastructure and custom RPCs such as `exec_sql` and `query_indexes` from `server/tests/database/conftest.ts`. These are integration tests, not hermetic unit tests, and they will fail without a correctly provisioned Supabase environment.
- `server/tests/registration.test.ts` also requires real Supabase credentials and performs actual admin-user lifecycle operations for cleanup.
- There is at least one explicitly skipped unit test in `client/src/__tests__/components.test.tsx` for `Button` `asChild` behavior because of jsdom limitations.

## What The Existing Tests Optimize For

- UI tests prioritize rendering contracts, variant class names, and interactive behavior rather than full page workflows. See `client/src/__tests__/components.test.tsx` and `client/src/components/admin/__tests__/UserSearchInput.test.tsx`.
- Hook tests focus on async state transitions, optimistic caching expectations, and debounced timing behavior. See `client/src/hooks/__tests__/useAdminMutations.test.ts` and `client/src/hooks/__tests__/useDebounce.test.ts`.
- Server tests focus on access-control correctness, structured validation responses, and database safety/performance. See `server/tests/registration.test.ts` and `server/tests/database/*.test.ts`.
- Playwright coverage is aimed at admin workflows, accessibility heuristics, and visual regression snapshots rather than broader business flows.

## Highest-Value Missing Coverage

- Auth and route-guard behavior lacks focused tests around `client/src/contexts/AuthContext.tsx`, `client/src/components/auth/ProtectedRoute.tsx`, and `client/src/hooks/useAccessStatus.ts`.
- Payment and access APIs need direct route coverage for `server/routes/payments.ts`, `server/routes/stripe.ts`, and `server/routes/mercadopago.ts`.
- Document, notes, process, and template flows are largely untested even though they contain data mutations and file operations in hooks such as `client/src/hooks/useDocuments.ts`, `client/src/hooks/useNotes.ts`, and `client/src/hooks/useProcesses.ts`.
- The dual theme/provider migration path in `client/src/App.tsx` and `client/src/components/providers/AtlaskitProvider.tsx` is partially covered by token tests but not by route-level or integration tests.
- E2E coverage should be reconciled with the current routing table in `client/src/App.tsx` before adding more browser tests; otherwise new tests will inherit the same drift.
