# Code Conventions

## Architecture Shape

- The repo is split by runtime: browser code lives under `client/src`, server code under `server`, shared types/constants under `shared`, and deployment-specific handlers under `api`.
- The main client composition happens in `client/src/main.tsx` and `client/src/App.tsx`. Providers are layered near the root: React Query, `AuthProvider`, `PaymentProvider`, `AtlaskitProvider`, and the legacy `ThemeProvider`.
- The main server composition happens in `server/start.ts` and `server/index.ts`. `server/start.ts` loads `.env.local` before any imports, and `server/index.ts` mounts feature routers under `/api/*`.
- Feature code is mostly colocated by domain. Examples: admin UI in `client/src/components/admin` and `client/src/hooks/useAdminUsers.ts`, auth UI in `client/src/components/auth`, and payment/access APIs in `server/routes/payments.ts` and `server/routes/admin-access.ts`.
- Barrel exports are used selectively for feature folders such as `client/src/components/checkout/index.ts`, `client/src/components/client-area/index.ts`, and `client/src/components/landing/index.ts`.

## Naming And File Layout

- React components use PascalCase file names and exports, for example `client/src/pages/AdminPanel.tsx`, `client/src/components/auth/RegisterForm.tsx`, and `client/src/components/ui/button.tsx`.
- Hooks use `use*` camelCase names in files that mirror the hook name, for example `client/src/hooks/useAccessStatus.ts` and `client/src/hooks/useDebounce.ts`.
- Contexts are named `*Context.tsx` and expose paired hooks that throw if used outside the provider, for example `client/src/contexts/AuthContext.tsx`, `client/src/contexts/PaymentContext.tsx`, and `client/src/contexts/ThemeContext.tsx`.
- Validation files use noun-based names around the domain they validate, for example `client/src/lib/validation/registration-schema.ts`, `client/src/lib/validation/admin.ts`, and `server/middleware/validation.ts`.
- Server route modules are flat feature routers named after the resource, for example `server/routes/auth.ts`, `server/routes/contact.ts`, `server/routes/payments.ts`, and `server/routes/admin-access.ts`.

## Import And Module Conventions

- The client uses the `@` alias for `client/src` and `@shared` for shared code. This is defined in both `vite.config.ts` and `vitest.config.ts`.
- Server imports use relative paths with `.js` extensions because the project is ESM and the build step bundles `server/start.ts` with esbuild.
- Types are usually colocated with the owning module or feature, but shared API/data types exist in `client/src/types`, `shared/supabase/types.ts`, and hook files such as `client/src/hooks/useAdminUsers.ts`.

## Component And UI Patterns

- UI primitives in `client/src/components/ui` use a wrapper pattern around third-party libraries. `client/src/components/ui/button.tsx` is representative: it preserves a local variant API while optionally delegating to Atlaskit.
- Styling is primarily class-based through Tailwind plus `cn()` from `client/src/lib/utils.ts`. Inline styles are common for brand colors and stateful UI in page-level components such as `client/src/pages/AdminPanel.tsx` and `client/src/components/auth/ProtectedRoute.tsx`.
- The codebase is mid-migration between an Atlaskit theme system and older shadcn-style components. That dual-stack is explicit in `client/src/App.tsx`, `client/src/components/providers/AtlaskitProvider.tsx`, and `client/src/contexts/ThemeContext.tsx`.
- Pages tend to compose many presentational children rather than keeping everything inline. `client/src/pages/Landing.tsx`, `client/src/pages/AdminPanel.tsx`, and `client/src/pages/Home.tsx` follow that pattern.

## State Management

- Server state and remote fetch state are expected to live in React Query. The central defaults and query keys are in `client/src/lib/query-client.ts`.
- Authentication is managed with React context around the Supabase browser client in `client/src/contexts/AuthContext.tsx`.
- Payment/access state is a layered abstraction: `client/src/hooks/useAccessStatus.ts` does the real React Query fetch, `client/src/contexts/PaymentContext.tsx` re-exposes it as context, and `client/src/hooks/useSubscription.ts` wraps that again for legacy consumers.
- Local UI state stays in component `useState` or `react-hook-form`, as seen in `client/src/pages/AdminPanel.tsx`, `client/src/components/auth/LoginForm.tsx`, and `client/src/components/documents/DocumentUpload.tsx`.
- Theme state is local context with `localStorage` persistence only when switching is enabled, via `client/src/contexts/ThemeContext.tsx` and `client/src/components/providers/AtlaskitProvider.tsx`.

## Validation Patterns

- Client form validation generally uses Zod plus `react-hook-form` resolvers. Representative files are `client/src/lib/validation/registration-schema.ts`, `client/src/lib/validation/admin.ts`, and `client/src/pages/AdminPanel.tsx`.
- Dynamic document/form flows also use schema-like config objects instead of Zod, for example `client/src/config/formSchemas.ts` and the types in `client/src/types/form.ts`.
- Server request validation is mixed:
  - Registration uses bespoke middleware in `server/middleware/validation.ts`.
  - Admin access endpoints use inline Zod `safeParse` schemas inside `server/routes/admin-access.ts`.
- There is intentional but duplicated validation logic between client and server for admin access. `client/src/lib/validation/admin.ts` and `server/routes/admin-access.ts` define nearly identical schemas independently.

## Error Handling

- Client-side async flows usually follow `try/catch`, log to `console.error`, and surface UX feedback via `toast.error` or fallback UI. Examples: `client/src/contexts/AuthContext.tsx`, `client/src/pages/AdminPanel.tsx`, `client/src/pages/Support.tsx`, and `client/src/hooks/useDocuments.ts`.
- Server routes usually return explicit JSON error objects and avoid throwing raw errors across the HTTP boundary. `server/routes/admin-access.ts`, `server/routes/admin-users.ts`, and `server/routes/payments.ts` are representative.
- `server/index.ts` adds a final API-only error middleware so `/api/*` failures return JSON rather than HTML.
- Error boundaries are used sparingly but intentionally around high-level theme/app shells in `client/src/components/ErrorBoundary.tsx` and `client/src/components/providers/AtlaskitProvider.tsx`.
- Logging is mostly plain `console.*` with occasional structured JSON payloads. Registration and validation paths are the most structured: `server/routes/auth.ts` and `server/middleware/validation.ts`.

## Auth, Access, And Security Patterns

- The browser uses the typed Supabase client from `client/src/lib/supabase.ts`; server code uses service-role clients in files such as `server/lib/supabase-server.ts`, `server/routes/auth.ts`, and `server/middleware/admin-auth.ts`.
- Protected client routing is centralized in `client/src/components/auth/ProtectedRoute.tsx`, which handles auth redirects, payment checks, and an admin-role bypass using `user.user_metadata.role`.
- Admin API protection is enforced in `server/middleware/admin-auth.ts`, which validates the bearer token through Supabase and re-attaches the user to the request.
- Access control logic is spread across `client/src/hooks/useAccessStatus.ts`, `client/src/contexts/PaymentContext.tsx`, `server/routes/payments.ts`, and `server/routes/admin-access.ts`. This is a recurring design pattern, but it also means access rules must be kept in sync in several places.

## Recurring Implementation Patterns

- Query hooks obtain a Supabase session just-in-time, then call internal REST endpoints with a bearer token. See `client/src/hooks/useAdminUsers.ts`, `client/src/hooks/useAdminMutations.ts`, and `client/src/hooks/useAccessStatus.ts`.
- Provider hooks throw fast when misused outside a provider. This is standard in `client/src/contexts/AuthContext.tsx`, `client/src/contexts/PaymentContext.tsx`, and `client/src/contexts/ThemeContext.tsx`.
- Page-level loading and failure states are rendered explicitly instead of abstracted away. `client/src/pages/AdminPanel.tsx` and `client/src/components/auth/ProtectedRoute.tsx` are typical.
- Many modules include long explanatory comments and migration notes. This is especially common in UI wrappers such as `client/src/components/ui/button.tsx`, the app shell in `client/src/App.tsx`, and test/config files.
- The codebase prefers soft-delete style updates for access records rather than destructive deletes. See `server/routes/admin-access.ts` and the related database tests in `server/tests/database/query-performance.test.ts`.

## Quality Notes For Later Planning

- State abstractions around access are layered but partially redundant. `client/src/hooks/useSubscription.ts` explicitly notes that subscription data is now delegated elsewhere, which is a sign that this area still carries migration residue.
- Some pages bypass shared abstractions. `client/src/pages/AdminPanel.tsx` creates a fresh Supabase client inside `handleGrantAccess` instead of reusing `client/src/lib/supabase.ts` or the mutation hooks in `client/src/hooks/useAdminMutations.ts`.
- Validation strategy is inconsistent across server boundaries: registration uses handwritten validators in `server/middleware/validation.ts`, while admin routes use Zod in `server/routes/admin-access.ts`.
- Logging is verbose and sometimes mixes structured JSON with free-form debugging, especially in `server/routes/auth.ts`, `server/routes/payments.ts`, and `client/src/lib/debugAuth.ts`.
- The repo is intentionally in a design-system migration state. Any future work touching theming or UI primitives should assume both Atlaskit and legacy component paths are still live until `client/src/App.tsx` and `client/src/components/providers/AtlaskitProvider.tsx` are simplified.
