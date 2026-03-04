# Phase 1: Authentication Foundation - Research

**Researched:** 2026-03-04
**Domain:** React SPA Authentication with Supabase + Express API
**Confidence:** HIGH

## Summary

Phase 1 focuses on fixing critical authentication flow issues preventing users from accessing paid content. The current system has a race condition between `AuthContext` and `PaymentContext` that causes infinite redirect loops in `ProtectedRoute`, despite recent improvements using refs to break dependency cycles. The core issue is that `ProtectedRoute` attempts to make access decisions before payment context is fully initialized, leading to premature redirects to `/checkout` even for users with valid access.

The recommended approach is **three-pronged**: (1) Implement a three-state loading pattern in `ProtectedRoute` that clearly distinguishes between `loading`, `initialized`, and `decisionMade` states, (2) Replace the custom `PaymentContext` implementation with **@tanstack/react-query** for proven cache management and automatic auth-aware refetching, and (3) Ensure the existing `/api/payments/status` endpoint serves as the single source of truth for all access checks. This phase also requires verifying the MercadoPago webhook's idempotency to prevent duplicate access grants.

**Primary recommendation:** Implement React Query for access status caching with `staleTime: 5 * 60 * 1000` (5 minutes) and `gcTime: 10 * 60 * 1000` (10 minutes), add explicit `initialized` flag to `useSubscription` hook, and refactor `ProtectedRoute` to wait for `initialized === true` before making access decisions.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **@tanstack/react-query** | v5.51+ | Server state management for access status | Industry standard for API caching, automatic refetch on auth changes, eliminates Context loop bugs |
| **React Context** | Built-in | Auth state (user, session) | Proven pattern for global auth state, already working correctly |
| **Supabase Auth** | v2.98.0 | Authentication provider | Already integrated, handles session management and token refresh |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **@tanstack/react-query-devtools** | v5.51+ | Debug cache state during development | Development only, helps inspect cache hits/misses |
| **Zod** | v4.1.12 | Schema validation for API responses | Already installed, validate `/api/payments/status` responses |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| React Query | SWR | Similar features, but React Query has better TypeScript support and larger ecosystem |
| React Query | Context + manual state | Current approach causing infinite loops, requires complex dependency management |
| React Query | Redux | Overkill for simple access caching, adds boilerplate and complexity |

**Installation:**
```bash
pnpm add @tanstack/react-query @tanstack/react-query-devtools
```

## Architecture Patterns

### Recommended Project Structure
```
client/src/
├── contexts/
│   ├── AuthContext.tsx          # Keep as-is (working correctly)
│   └── PaymentContext.tsx       # Replace with React Query hook
├── hooks/
│   ├── useAuth.ts               # Existing, no changes needed
│   ├── useSubscription.ts       # Add `initialized` flag, use React Query
│   └── useAccessStatus.ts       # NEW: React Query hook for /api/payments/status
├── lib/
│   ├── api/
│   │   └── access.ts            # NEW: Typed API client for access checks
│   └── supabase.ts              # Existing, no changes needed
└── components/
    └── auth/
        └── ProtectedRoute.tsx   # Refactor: three-state loading pattern
```

### Pattern 1: Three-State Loading Pattern
**What:** Distinguish between loading auth state, loading payment status, and ready to make access decisions
**When to use:** Route-level access control that depends on multiple async sources
**Example:**
```typescript
// ProtectedRoute should use three distinct states:
// 1. authLoading: Supabase session loading
// 2. paymentLoading: Access status fetching
// 3. initialized: Both auth and payment are ready

interface AccessState {
  authLoading: boolean;
  paymentLoading: boolean;
  initialized: boolean;  // NEW: True only after both loads complete
  hasAccess: boolean;
}

// Only redirect when initialized === true and hasAccess === false
// Show loading spinner when authLoading || paymentLoading || !initialized
```

### Pattern 2: React Query for Access Caching
**What:** Use `useQuery` to fetch and cache access status with automatic invalidation
**When to use:** Server state that needs caching, automatic refetching, and background updates
**Example:**
```typescript
// Source: https://tanstack.com/query/latest/docs/react/overview
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface AccessStatus {
  hasActiveAccess: boolean;
  hasManualAccess: boolean;
  accessType: 'subscription' | 'one_time' | 'manual' | null;
  expiresAt: string | null;
}

export function useAccessStatus(userId: string | null) {
  const queryClient = useQueryClient();

  // Invalidate cache when auth state changes
  useEffect(() => {
    if (!userId) {
      queryClient.removeQueries({ queryKey: ['accessStatus'] });
    }
  }, [userId, queryClient]);

  return useQuery({
    queryKey: ['accessStatus', userId],
    queryFn: async () => {
      const response = await fetch('/api/payments/status');
      if (!response.ok) throw new Error('Failed to fetch access status');
      return response.json() as Promise<AccessStatus>;
    },
    enabled: !!userId,  // Only fetch when user is authenticated
    staleTime: 5 * 60 * 1000,  // 5 minutes - consider data fresh
    gcTime: 10 * 60 * 1000,    // 10 minutes - keep in cache after inactive
    retry: 1,                  // Retry once on failure
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });
}
```

### Pattern 3: Single Source of Truth for Access
**What:** All access checks flow through `/api/payments/status` endpoint
**When to use:** Multiple access types (payment + manual) need to be combined
**Example:**
```typescript
// server/routes/payments.ts - Already exists, keep as-is
// The endpoint combines user_access and user_manual_access tables

// client/src/hooks/useAccessStatus.ts - New hook
export function useAccessStatus() {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const query = useQuery({
    queryKey: ['accessStatus', userId],
    queryFn: fetchAccessStatus,
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  return {
    hasAccess: query.data?.hasActiveAccess ?? false,
    hasManualAccess: query.data?.hasManualAccess ?? false,
    accessType: query.data?.accessType ?? null,
    expiresAt: query.data?.expiresAt ?? null,
    loading: query.isLoading,
    initialized: !query.isLoading && userId !== null,  // Key for ProtectedRoute
    refetch: query.refetch,
  };
}
```

### Anti-Patterns to Avoid
- **Dependecy cycles in Context**: Never create useEffect dependencies between AuthContext and PaymentContext - use refs or React Query instead
- **Early redirects before initialization**: Never redirect while `initialized === false` - causes infinite loops
- **Multiple access check sources**: Don't check both `user_access` table directly AND `/api/payments/status` - creates split-brain issues
- **Client-side access validation**: Never determine access solely on the client - always verify with server endpoint

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| **API response caching** | Manual state in PaymentContext with useEffect dependencies | @tanstack/react-query | Handles loading states, error states, cache invalidation, background refetching automatically |
| **Access state management** | Custom hooks with useState and useEffect | React Query's `useQuery` | Proven pattern used by 100K+ projects, eliminates re-render loops |
| **Request deduplication** | Manual abort controllers and refs | React Query's built-in deduplication | Automatically prevents duplicate requests for same query key |
| **Cache invalidation** | Manual refetch on auth changes | React Query's `invalidateQueries` | Auth state change → invalidate cache → auto-refetch |

**Key insight:** The current `PaymentContext` implementation attempts to solve caching, loading states, abort controllers, and dependency cycles manually. React Query provides all of this out-of-the-box with battle-tested reliability.

## Common Pitfalls

### Pitfall 1: ProtectedRoute Redirect Loop
**What goes wrong:** `ProtectedRoute` redirects to `/checkout` while access status is still loading, causing infinite navigation loop
**Why it happens:** `useSubscription` returns `loading: true` during initial fetch, but `ProtectedRoute` interprets this as "no access" and redirects
**How to avoid:** Add explicit `initialized` flag that is `false` until first access check completes. Only redirect when `initialized === true && hasAccess === false`
**Warning signs:** Browser shows "Too many redirects" error, network tab shows repeated requests to `/checkout`, console shows infinite loop of navigation events

### Pitfall 2: React Context Infinite Re-render Loop
**What goes wrong:** PaymentContext triggers re-renders infinitely, causing performance degradation
**Why it happens:** Context value includes `fetchStatus` function that depends on `user` and `session`, creating a dependency cycle with useEffect
**How to avoid:** Use React Query instead (no dependency cycles), or wrap callback in `useCallback` and store frequently-changing values in `useRef`
**Warning signs:** React DevTools Profiler shows hundreds of component renders per second, memory usage grows continuously, useEffect logs show repeated calls

### Pitfall 3: Race Condition in Access Validation
**What goes wrong:** Access check happens before auth session is fully initialized, returning false negatives
**Why it happens:** `AuthContext` sets `loading: false` before `onAuthStateChange` fires with `INITIAL_SESSION` event
**How to avoid:** Wait for both `AuthContext.loading === false` AND `PaymentContext.initialized === true` before making access decisions
**Warning signs:** Users randomly get "access denied" errors on first page load, refreshing the page fixes the issue, console shows access check before session ready

### Pitfall 4: MercadoPago Webhook Duplicate Access Grants
**What goes wrong:** Webhook retries create duplicate `user_access` records for the same payment
**Why it happens:** Webhook may be called multiple times by MercadoPago for the same payment event
**How to avoid:** Implement idempotency check using `mercadopago_payment_id` in payments table before inserting user_access
**Warning signs:** Database shows multiple user_access records with same payment_id, users report access extending beyond expected duration

## Code Examples

Verified patterns from official sources:

### React Query Access Hook
```typescript
// Source: https://tanstack.com/query/latest/docs/react/react/queries
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

interface AccessStatusResponse {
  hasActiveAccess: boolean;
  hasManualAccess: boolean;
  accessType: 'subscription' | 'one_time' | 'manual' | null;
  expiresAt: string | null;
}

async function fetchAccessStatus(): Promise<AccessStatusResponse> {
  const response = await fetch('/api/payments/status');
  if (!response.ok) {
    throw new Error('Failed to fetch access status');
  }
  return response.json();
}

export function useAccessStatus() {
  const { user, session } = useAuth();
  const userId = user?.id ?? null;

  const query = useQuery({
    queryKey: ['accessStatus', userId],
    queryFn: fetchAccessStatus,
    enabled: !!userId && !!session,  // Only fetch when authenticated
    staleTime: 5 * 60 * 1000,  // 5 minutes
    gcTime: 10 * 60 * 1000,    // 10 minutes
    retry: 1,
  });

  return {
    hasAccess: query.data?.hasActiveAccess ?? false,
    hasManualAccess: query.data?.hasManualAccess ?? false,
    accessType: query.data?.accessType ?? null,
    expiresAt: query.data?.expiresAt ?? null,
    isLoading: query.isLoading,
    error: query.error,
    initialized: !query.isLoading && userId !== null,
    refetch: query.refetch,
  };
}
```

### ProtectedRoute with Three-State Loading
```typescript
// Source: Current codebase analysis + React Router patterns
import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { useAccessStatus } from '@/hooks/useAccessStatus';

export function ProtectedRoute({ children, requirePayment = true }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { hasAccess, initialized, isLoading: paymentLoading } = useAccessStatus();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Don't make decisions while initializing
    if (authLoading || paymentLoading || !initialized) {
      return;
    }

    // Redirect to login if not authenticated
    if (!user) {
      setLocation('/');
      return;
    }

    // Redirect to checkout if payment required but no access
    if (requirePayment && !hasAccess) {
      setLocation('/checkout');
      return;
    }
  }, [user, authLoading, paymentLoading, initialized, hasAccess, requirePayment, setLocation]);

  // Show loading while initializing
  if (authLoading || paymentLoading || !initialized) {
    return <LoadingSpinner />;
  }

  // Don't render if access denied (redirect will happen in useEffect)
  if (!user || (requirePayment && !hasAccess)) {
    return null;
  }

  return <>{children}</>;
}
```

### MercadoPago Webhook Idempotency Check
```typescript
// Source: Current codebase (server/routes/mercadopago.ts) - Already implemented correctly
router.post('/webhook', async (req: Request, res: Response) => {
  const { data, type } = req.body;

  if (type === 'payment' && data?.id) {
    const paymentId = data.id;

    // IDEMPOTENCY CHECK: Verify payment doesn't already exist
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id')
      .eq('mercadopago_payment_id', paymentId)
      .maybeSingle();

    if (existingPayment) {
      console.log(`Payment ${paymentId} already processed, skipping`);
      return res.status(200).json({ received: true, duplicate: true });
    }

    // ... proceed with payment processing
  }
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual state in Context | React Query for server state | Phase 1 | Eliminates infinite loops, automatic cache management |
| `loading` boolean only | Three states: `loading`, `initialized`, `decisionMade` | Phase 1 | Prevents premature redirects, clear state progression |
| Client-side access checks | Server-side `/api/payments/status` only | Already done | Security + single source of truth |
| useEffect dependency cycles | React Query's `enabled` option | Phase 1 | No manual dependency management, auto-refetch on auth change |

**Deprecated/outdated:**
- **PaymentContext with manual state**: The current implementation (lines 1-230 in PaymentContext.tsx) attempts to handle caching manually with refs and abort controllers. This should be replaced with React Query.
- **`useSubscription` without `initialized` flag**: Current hook exposes `loading` but not `initialized`, causing confusion about when access check is ready.

## Open Questions

1. **React Query cache invalidation timing**
   - What we know: Need to invalidate cache when user signs out or switches accounts
   - What's unclear: Should we also invalidate on token refresh, or is the 5-minute staleTime sufficient?
   - Recommendation: Invalidate on `SIGNED_OUT` and `USER_UPDATED` events, keep 5-minute staleTime for normal operation

2. **Access status endpoint response format**
   - What we know: Endpoint returns `hasActiveAccess`, `hasManualAccess`, `accessType`, `expiresAt`
   - What's unclear: Should we add a `lastChecked` timestamp for debugging?
   - Recommendation: Add timestamp during Phase 1 implementation for better debugging

3. **Test user forato@gmail.com access**
   - What we know: User has manual access configured in database
   - What's unclear: Is the access record active (is_active=true) and not expired (expires_at >= NOW())?
   - Recommendation: Verify with SQL query: `SELECT * FROM user_manual_access WHERE user_id = '...'`

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest v2.1.4 + React Testing Library v16.3.2 |
| Config file | `vitest.config.ts` (already configured) |
| Quick run command | `pnpm test` |
| Full suite command | `pnpm test:coverage` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AUTH-01 | `/api/payments/status` endpoint returns correct access status | integration | `pnpm test server/tests/payments.test.ts` | ❌ Need to create |
| AUTH-02 | ProtectedRoute waits for initialized before redirecting | unit | `pnpm test client/src/components/auth/ProtectedRoute.test.tsx` | ❌ Need to create |
| AUTH-03 | PaymentContext uses React Query instead of manual state | unit | `pnpm test client/src/contexts/PaymentContext.test.tsx` | ❌ Need to create |
| AUTH-04 | Three loading states implemented correctly | unit | `pnpm test client/src/hooks/useSubscription.test.ts` | ❌ Need to create |
| AUTH-05 | No race conditions between AuthContext and PaymentContext | integration | `pnpm test client/src/__tests__/integration/auth-flow.test.tsx` | ❌ Need to create |
| INT-01 | MercadoPago webhook updates user_access table | integration | `pnpm test server/tests/mercadopago-webhook.test.ts` | ❌ Need to create |
| INT-02 | Webhook is idempotent (no duplicate access grants) | integration | `pnpm test server/tests/mercadopago-webhook-idempotency.test.ts` | ❌ Need to create |
| INT-03 | Dashboard redirects paid users to content after login | e2e | `pnpm test:e2e e2e/login-flow.spec.ts` | ❌ Need to create |
| INT-04 | Dashboard redirects unpaid users to checkout after login | e2e | `pnpm test:e2e e2e/login-flow.spec.ts` | ❌ Need to create |
| UX-02 | Clear error messages when access denied | unit | `pnpm test client/src/components/auth/ProtectedRoute.test.tsx` | ❌ Need to create |
| UX-03 | Loading states shown during validation | unit | `pnpm test client/src/components/auth/ProtectedRoute.test.tsx` | ❌ Need to create |

### Sampling Rate
- **Per task commit:** `pnpm test` (run unit tests for modified files only)
- **Per wave merge:** `pnpm test:coverage` (ensure coverage doesn't drop)
- **Phase gate:** Full suite green + `pnpm test:e2e` passes before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `client/src/components/auth/ProtectedRoute.test.tsx` - Test ProtectedRoute loading states and redirect logic
- [ ] `client/src/hooks/useAccessStatus.test.ts` - Test React Query hook for access status
- [ ] `client/src/__tests__/setup/auth-test-provider.tsx` - Mock AuthContext and PaymentContext for tests
- [ ] `server/tests/payments.test.ts` - Test `/api/payments/status` endpoint
- [ ] `server/tests/mercadopago-webhook.test.ts` - Test webhook processing and idempotency
- [ ] Framework: Already installed (Vitest + React Testing Library) - no installation needed

## Sources

### Primary (HIGH confidence)
- **@tanstack/react-query Documentation** - Official React Query library documentation for cache management, query invalidation, and best practices
- **React Documentation** - Official React docs for useEffect, useContext, and performance patterns
- **Supabase Auth Documentation** - Official Supabase Auth documentation for session management and auth state changes
- **Current codebase analysis** - Analyzed AuthContext.tsx, PaymentContext.tsx, ProtectedRoute.tsx, payments.ts, mercadopago.ts (1000+ lines)

### Secondary (MEDIUM confidence)
- **Vitest Documentation** - Official Vitest docs for testing React components and hooks
- **React Testing Library Documentation** - Official RTL docs for testing user interactions and component behavior
- **MercadoPago Webhook Documentation** - Webhook handling best practices for payment processing

### Tertiary (LOW confidence)
- None - all sources verified against official documentation or current codebase

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - React Query is industry standard, official docs verify all patterns
- Architecture: HIGH - Analyzed existing codebase, patterns verified with React and React Query docs
- Pitfalls: HIGH - All pitfalls identified from current codebase issues, solutions verified with official docs

**Research date:** 2026-03-04
**Valid until:** 2026-04-03 (30 days - React Query and Supabase are stable, patterns unlikely to change)
