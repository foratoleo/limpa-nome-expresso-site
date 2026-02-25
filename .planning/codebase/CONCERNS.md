# Codebase Concerns

**Analysis Date:** 2025-02-25

## Tech Debt

**Patch File Management:**
- Issue: Third-party dependency patching (`wouter@3.7.1.patch`) manually maintained to inject route collection logic
- Files: `patches/wouter@3.7.1.patch`, `vite.config.ts`
- Impact: Patch may break on `wouter` updates; custom `window.__WOUTER_ROUTES__` injection is fragile
- Fix approach: Consider forking wouter or creating a proper wrapper/route registration system instead of patching

**Large Monolithic Component:**
- Issue: `Home.tsx` contains 523 lines with mixed concerns (data, hooks, UI components, business logic)
- Files: `client/src/pages/Home.tsx`
- Impact: Difficult to maintain and test; changes risk breaking multiple features
- Fix approach: Extract step data to constants, separate components into dedicated module (`components/checklist/`, `components/steps/`)

**No Type Safety for External Links:**
- Issue: TJSP and Serasa URLs are hardcoded strings with no validation
- Files: `client/src/pages/Home.tsx` (lines 76-77, 98-99, 120-121)
- Impact: Link rot goes undetected until users report broken URLs
- Fix approach: Create URL constants file with periodic validation script or external config

**Missing Environment Variable Handling:**
- Issue: No `.env` file present; build assumes hardcoded configuration
- Files: `vite.config.ts`, `server/index.ts`
- Impact: Deployment to different environments requires code changes
- Fix approach: Create `.env.example` and implement `process.env` fallbacks with proper typing

## Known Bugs

**LocalStorage Parsing Failure Silent Catch:**
- Symptoms: If localStorage contains corrupted JSON, checklist silently resets
- Files: `client/src/pages/Home.tsx` (lines 136-141)
- Trigger: Browser localStorage corruption or manual tampering
- Workaround: User must manually clear localStorage
- Fix approach: Add error logging and user notification when data reset occurs

**Theme Context Throws Without Provider:**
- Symptoms: Runtime error if `useTheme()` called outside `ThemeProvider`
- Files: `client/src/contexts/ThemeContext.tsx` (line 61)
- Trigger: Component using theme hook without proper provider wrapper
- Workaround: Ensure `ThemeProvider` wraps all `useTheme` consumers
- Fix approach: Provide default fallback context instead of throwing

**Google Maps Console Errors on Missing API Key:**
- Symptoms: Console errors when Map component renders without Google Maps loaded
- Files: `client/src/components/Map.tsx` (lines 106, 131)
- Trigger: Google Maps script fails to load or API key missing
- Workaround: Errors are logged but don't crash app
- Fix approach: Add proper error boundary and user-facing message

## Security Considerations

**External Image URL with Expiring Token:**
- Risk: Hero background image URL contains signed CloudFront token that will expire
- Files: `client/src/pages/Home.tsx` (line 396)
- Current mitigation: None; image will break when token expires
- Recommendations: Move to `public/` directory or use CDN without signed URLs

**Manus Debug Collector in Production:**
- Risk: Debug collector script captures user interactions and sends to development endpoint
- Files: `client/public/__manus__/debug-collector.js`, `vite.config.ts` (lines 77-151)
- Current mitigation: Script only injected in development (`NODE_ENV !== production`)
- Recommendations: Verify production builds exclude script; add build-time assertion

**No Content Security Policy:**
- Risk: No CSP headers defined; vulnerable to XSS if third-party scripts compromised
- Files: `vite.config.ts`, `server/index.ts`
- Current mitigation: None
- Recommendations: Add CSP headers in Express server for production

**External Links Open in New Window:**
- Risk: All external TJSP/Serasa links use `target="_blank"` without explicit `rel="noopener noreferrer"` consistency
- Files: `client/src/pages/Home.tsx` (lines 188-189)
- Current mitigation: `rel` attribute present on LinkBtn component
- Recommendations: Audit all external links for consistent security attributes

## Performance Bottlenecks

**Large UI Component Bundle:**
- Problem: 50+ Radix UI components imported but only ~5 used in actual application
- Files: `client/src/components/ui/*` (734-line sidebar.tsx alone)
- Cause: Full shadcn/ui template included unused components
- Improvement path: Tree-shake unused imports or remove unused component files

**No Route-Level Code Splitting:**
- Problem: All routes load entire application bundle immediately
- Files: `client/src/App.tsx`
- Cause: Wouter Switch doesn't implement lazy loading
- Improvement path: Implement `React.lazy()` for route components

**Client-Side Font Loading:**
- Problem: Playfair Display, Inter, Space Grotesk loaded from Google Fonts
- Files: `client/src/pages/Home.tsx` (implicit in inline styles)
- Cause: No self-hosting or font-display strategy
- Improvement path: Self-host fonts with `font-display: swap`

## Fragile Areas

**LocalStorage Key Management:**
- Files: `client/src/pages/Home.tsx` (line 137), `client/src/contexts/ThemeContext.tsx` (line 26)
- Why fragile: String literals scattered across codebase; no central key registry
- Safe modification: Create `client/src/constants/storageKeys.ts` with typed exports
- Test coverage: No tests for localStorage behavior

**Step Data Structure:**
- Files: `client/src/pages/Home.tsx` (lines 27-131)
- Why fragile: Add/edit/remove steps requires modifying large hardcoded array; risk of ID collisions
- Safe modification: Extract to `client/src/data/steps.ts` with validation schema
- Test coverage: No tests for step data integrity

**Wouter Patch Compatibility:**
- Files: `patches/wouter@3.7.1.patch`
- Why fragile: Patch targets specific line numbers; any wouter update breaks patch application
- Safe modification: Monitor wouter releases; test patch on each minor version bump
- Test coverage: No automated tests verify patch behavior

## Scaling Limits

**Single-Page Application Architecture:**
- Current capacity: Static content served via Express; no backend API
- Limit: Cannot add user accounts, data persistence, or personalized features without backend
- Scaling path: Add API routes in `server/` or migrate to serverless functions

**Document Storage:**
- Current capacity: 3 markdown files in `client/public/docs/` (~17KB total)
- Limit: No document management system; all files committed to git
- Scaling path: Implement CMS or external document hosting for dynamic updates

**No Analytics or Error Tracking:**
- Current capacity: Development-only debug logs
- Limit: No visibility into production errors or user behavior
- Scaling path: Integrate error tracking (Sentry) and analytics (Plausible/umami)

## Dependencies at Risk

**vite-plugin-manus-runtime:**
- Risk: Manus-specific plugin may not be maintained long-term
- Impact: Build process breaks if plugin becomes incompatible
- Migration plan: Document plugin purpose; identify standard alternatives

**streamdown:**
- Risk: Lesser-known markdown rendering library
- Impact: If abandoned, may have security vulnerabilities
- Migration plan: Switch to react-markdown or marked as fallback

**Tailwind CSS 4.x:**
- Risk: Bleeding-edge version (4.1.14) may have breaking changes in minor updates
- Impact: Custom utilities may break on upgrade
- Migration plan: Pin to specific version; test thoroughly before upgrades

## Missing Critical Features

**No Search Functionality:**
- Problem: Users cannot search within legal guide or checklist items
- Blocks: Finding specific legal references or steps quickly
- Fix approach: Add client-side search with fuse.js or similar

**No Print-Friendly Styles:**
- Problem: Legal guide is reference material but cannot be printed cleanly
- Blocks: Users wanting physical copy for court proceedings
- Fix approach: Add `@media print` CSS or dedicated print view

**No Progress Export/Import:**
- Problem: Checklist progress stuck in localStorage; cannot transfer between devices
- Blocks: Users starting on desktop, continuing on mobile
- Fix approach: Add export/import functionality for checked items

**No Accessibility Audit:**
- Problem: No ARIA labels documented; keyboard navigation untested
- Blocks: Users with disabilities accessing legal information
- Fix approach: Run axe-core audit; fix violations; add keyboard navigation tests

## Test Coverage Gaps

**No Unit Tests:**
- What's not tested: All component logic, hooks, utilities
- Files: `client/src/**/*` (no .test.ts or .spec.ts files)
- Risk: Refactoring breaks existing functionality silently
- Priority: High

**No Integration Tests:**
- What's not tested: User flows (checklist completion, localStorage persistence, route navigation)
- Files: `client/src/pages/Home.tsx`, `client/src/App.tsx`
- Risk: User-facing bugs reach production
- Priority: High

**No E2E Tests:**
- What's not tested: Critical paths (download documents, complete checklist, external links)
- Files: All user workflows
- Risk: External link rot and broken downloads detected late
- Priority: Medium

**No Visual Regression Tests:**
- What's not tested: UI styling changes, responsive layouts, theme application
- Files: All component files
- Risk: Accidental style changes go unnoticed
- Priority: Low

---

*Concerns audit: 2025-02-25*
