# Testing Patterns

**Analysis Date:** 2026-02-25

## Test Framework

**Runner:**
- Vitest 2.1.4 (installed but not configured)
- No test configuration file found (no `vitest.config.ts`)

**Assertion Library:**
- Vitest includes built-in assertions (Chai-compatible)

**Run Commands:**
```bash
# Not currently configured in package.json
# Expected commands would be:
pnpm test              # Run all tests (when configured)
pnpm test:watch        # Watch mode (when configured)
pnpm test:coverage     # Coverage (when configured)
```

**Current package.json scripts:**
```json
{
  "dev": "vite --host",
  "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
  "start": "NODE_ENV=production node dist/index.js",
  "preview": "vite preview --host",
  "check": "tsc --noEmit",
  "format": "prettier --write ."
}
```

## Test File Organization

**Location:**
- Not implemented (no test files found in project)
- tsconfig.json excludes `**/*.test.ts` files

**Naming:**
- Expected pattern: `*.test.ts`, `*.test.tsx`, `*.spec.ts`, `*.spec.tsx`
- Not currently used

**Structure:**
```
Expected structure (not implemented):
├── client/src/
│   ├── components/
│   │   ├── __tests__/
│   │   │   └── *.test.tsx
│   │   └── *.tsx
│   ├── hooks/
│   │   ├── __tests__/
│   │   │   └── *.test.ts
│   │   └── *.ts
│   └── ...
├── shared/
│   └── __tests__/
└── server/
    └── __tests__/
```

## Test Structure

**Suite Organization:**
- Not implemented (no existing test patterns to document)

**Patterns:**
- Not applicable (no tests exist)

## Mocking

**Framework:** None configured

**Patterns:**
- Not applicable (no tests exist)

**What to Mock:**
- When implementing tests, consider mocking:
  - `localStorage` operations
  - `window.location` for routing
  - HTTP requests (axios)
  - Environment variables (`import.meta.env`)

**What NOT to Mock:**
- UI components (test rendered output instead)

## Fixtures and Factories

**Test Data:**
- Not implemented

**Location:**
- When implementing, consider: `client/src/__tests__/fixtures/`

## Coverage

**Requirements:** None enforced

**View Coverage:**
- Not configured

**Current status:**
- No coverage reporting
- No test files exist in project
- TypeScript `check` script available: `pnpm check` runs `tsc --noEmit`

## Test Types

**Unit Tests:**
- Not implemented
- Should cover:
  - Utility functions (`cn()` in `lib/utils.ts`)
  - Custom hooks (`useComposition`, `useMobile`, `usePersistFn`)
  - Context providers
  - Pure functions

**Integration Tests:**
- Not implemented
- Should cover:
  - Component integration with contexts
  - Routing behavior
  - State management across components

**E2E Tests:**
- Not used
- Framework: None installed (no Playwright, Cypress, etc.)

## Common Patterns

**Async Testing:**
- Not implemented
- When implementing, use `async/await` with Vitest

**Error Testing:**
- Not implemented
- When implementing, test:
  - Error boundary behavior
  - localStorage parse failures
  - Network errors

## Recommended Testing Setup

**To implement testing, add to `package.json`:**
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

**Create `vitest.config.ts`:**
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './client/src/__tests__/setup.ts',
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', '.manus-logs'],
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@shared': path.resolve(__dirname, './shared')
    }
  }
});
```

**Required dev dependencies to add:**
- `@vitest/ui` - Test UI
- `jsdom` - DOM environment for component testing
- `@testing-library/react` - React component testing utilities
- `@testing-library/user-event` - User interaction simulation
- `@testing-library/jest-dom` - Custom Jest matchers

## Testing Priorities

**High Priority (Untested Critical Code):**
1. `client/src/lib/utils.ts` - `cn()` utility function
2. `client/src/hooks/` - Custom hooks for composition, mobile detection, persistence
3. `client/src/contexts/ThemeContext.tsx` - Theme provider and hook
4. `client/src/components/ErrorBoundary.tsx` - Error boundary behavior

**Medium Priority:**
1. `client/src/pages/Home.tsx` - Main page component with checklist logic
2. `client/src/App.tsx` - Root component and routing
3. `shared/const.ts` - Shared constants

**Low Priority:**
1. UI components from shadcn/ui (well-tested library)
2. `server/index.ts` - Simple Express server

---

*Testing analysis: 2026-02-25*
