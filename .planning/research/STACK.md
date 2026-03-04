# Technology Stack

**Project:** Limpa Nome Expresso - Refatoração Autenticação e Pagamentos
**Researched:** 2026-03-04
**Mode:** Refactoring (existing system)

## Current Stack (Existing)

### Core Framework
| Technology | Version | Purpose | Status |
|------------|---------|---------|--------|
| React | 19.2.1 | Frontend framework | ✅ Keep |
| TypeScript | 5.6.3 | Type safety | ✅ Keep |
| Vite | 7.1.7 | Build tool | ✅ Keep |
| Express | 4.21.2 | Backend API | ✅ Keep |

### Authentication & Database
| Technology | Version | Purpose | Status |
|------------|---------|---------|--------|
| Supabase JS | 2.98.0 | Auth & database client | ✅ Keep |
| Supabase Auth | - | Authentication provider | ✅ Keep |
| PostgreSQL | - | Database (via Supabase) | ✅ Keep |

### Payment
| Technology | Version | Purpose | Status |
|------------|---------|---------|--------|
| MercadoPago SDK | 2.12.0 | Payment processing | ✅ Keep |

### UI Components (Existing)
| Technology | Version | Purpose | Status |
|------------|---------|---------|--------|
| Radix UI | - | Headless UI primitives | ✅ Keep |
| Tailwind CSS | 4.1.14 | Styling | ✅ Keep |
| Atlaskit | - | Additional UI components | ✅ Keep |

---

## Stack Additions for Refactoring

### 1. Admin Panel UI Components

#### **@tanstack/react-table** (v8.21+)
**Purpose:** Headless table library for admin user management interface

**Why:**
- **Headless & Flexible:** Complete control over markup/styling to match existing design system
- **TypeScript First:** Full type inference for column definitions and data
- **Performance:** Handles 1000+ rows efficiently with virtualization support
- **Already in ecosystem:** Consistent with modern React patterns (2025-2026 best practice)
- **Lightweight:** ~12KB with tree-shaking vs AG Grid's 85KB

**Use for:**
- User management table (email, access status, granted date, actions)
- Manual access grants history
- Payment history table (if needed)

**Installation:**
```bash
pnpm add @tanstack/react-table
```

**Alternatives Considered:**
- **AG Grid:** Rejected - Too heavy (85KB), paid enterprise features, less flexibility
- **Radix UI DataTable:** Rejected - Doesn't exist as standalone component (must build custom)
- **shadcn/ui DataTable:** Rejected - Would require adding entire shadcn dependency

**Confidence:** HIGH (MEDIUM - Verified via WebSearch, no official docs check)

---

### 2. Access Validation & State Management

#### **@tanstack/react-query** (v5+)
**Purpose:** Cache invalidation and access status synchronization

**Why:**
- **Solves Context Loop Issues:** Replaces manual Context state management with proven cache patterns
- **Automatic Refetching:** Handles token refresh and session changes automatically
- **Stale-while-revalidate:** Prevents loading states while ensuring fresh data
- **Auth-Aware:** Built-in support for cache invalidation on auth state changes
- **TypeScript Native:** Full type safety for query keys and data

**Use for:**
- Centralizing `/api/payments/status` calls
- Automatic cache invalidation when user logs in/out
- Preventing duplicate access checks
- Handling race conditions in access validation

**Installation:**
```bash
pnpm add @tanstack/react-query
```

**Key Patterns:**
```typescript
// Query key factory for type safety
const accessKeys = {
  status: (userId: string) => ['access', 'status', userId] as const,
  manual: (userId: string) => ['access', 'manual', userId] as const,
}

// Invalidate on auth changes
queryClient.invalidateQueries({ queryKey: accessKeys.status(userId) })
```

**Replaces:** Manual Context state management in PaymentContext (fixes infinite loops)

**Alternatives Considered:**
- **SWR:** Rejected - Simpler but less granular cache control, harder to manage complex auth flows
- **Manual Context:** Rejected - Current implementation has loop issues (proven problematic)

**Confidence:** HIGH (MEDIUM - Verified via WebSearch, official docs show v5+ current)

---

### 3. Form Validation (Admin Panel)

#### **Zod** (v4.1.12 - already installed)
**Purpose:** Schema validation for admin forms (already in package.json)

**Why Already Installed:**
- Project already has Zod v4.1.12 in dependencies
- TypeScript-first schema validation
- Runtime type safety for admin inputs

**Use for:**
- Validating email input when granting manual access
- Validating expiration dates
- Type-safe API request/response validation

**No Additional Installation Needed**

**Confidence:** HIGH (Verified in package.json)

---

### 4. Supabase RLS Policy Patterns

#### **PostgreSQL RLS Best Practices**
**Purpose:** Secure access control at database level

**Why:**
- **Defense in Depth:** Database-level enforcement even if API bypassed
- **Performance:** Proper indexing on policy columns provides 99.94% improvement
- **Simplicity:** Policies are declarative and testable

**Required Patterns:**

**1. Index Policy Columns (Performance)**
```sql
-- Critical for performance
CREATE INDEX idx_user_access_user_id ON user_access(user_id);
CREATE INDEX idx_user_manual_access_user_id ON user_manual_access(user_id);
CREATE INDEX idx_user_access_expires_at ON user_access(expires_at);
```

**2. Wrap auth.uid() in SELECT (Performance Optimization)**
```sql
-- Instead of: USING (auth.uid() = user_id)
-- Use this for 94%+ performance improvement:
CREATE POLICY "Users can read own access"
ON user_access FOR SELECT
USING ((SELECT auth.uid()) = user_id);
```

**3. Explicit Deny Policies (Security)**
```sql
-- Prevent users from modifying their own access
CREATE POLICY "Users cannot update own access"
ON user_access FOR UPDATE
USING (false);

CREATE POLICY "Users cannot delete own access"
ON user_access FOR DELETE
USING (false);
```

**4. Service Role Only for Modifications**
```sql
-- Only service_role can modify access records
CREATE POLICY "Service role can update access"
ON user_access FOR UPDATE
USING (auth.role() = 'service_role');
```

**Current Status:**
- ✅ Migration 006 already implements explicit UPDATE/DELETE policies
- ✅ Service role restrictions in place
- ⚠️ Indexing status unknown (need verification)
- ⚠️ auth.uid() optimization not applied (potential performance issue)

**Confidence:** HIGH (MEDIUM - WebSearch verified, official Supabase docs confirm)

---

### 5. React Context Loop Prevention Patterns

#### **Context Performance Optimization**
**Purpose:** Fix infinite loop issues in AuthContext and PaymentContext

**Proven Patterns (2025 Best Practices):**

**1. Use Refs for Non-Rendering Values**
```typescript
// Store user/session in ref to avoid dependency cycles
const userSessionRef = useRef({ user, session });

useEffect(() => {
  userSessionRef.current = { user, session };
}, [user, session]);

// Read from ref in fetchStatus instead of depending on user/session
const fetchStatus = useCallback(async () => {
  const currentUser = userSessionRef.current.user;
  // ...
}, []); // Empty deps - no dependency on user/session
```

**2. Memoize Context Provider Values**
```typescript
const value = useMemo(() => ({
  user,
  session,
  loading,
  // ... other values
}), [user, session, loading]);

return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
```

**3. Separate Contexts by Concern**
- Keep AuthContext (authentication state) separate from PaymentContext (access state)
- Don't merge - separation of concerns prevents cascading updates

**4. Use AbortController for Cleanup**
```typescript
useEffect(() => {
  const controller = new AbortController();

  fetchData({ signal: controller.signal });

  return () => controller.abort();
}, []);
```

**Current Status:**
- ✅ PaymentContext already uses ref pattern (lines 31-38)
- ✅ AbortController implemented
- ⚠️ Context value not memoized (potential optimization)
- ⚠️ AuthContext could benefit from same ref pattern

**Confidence:** HIGH (MEDIUM - WebSearch 2025 articles verify patterns)

---

### 6. Testing Stack

#### **Existing Test Tools** (No additions needed)
| Tool | Version | Purpose | Status |
|------|---------|---------|--------|
| Vitest | 2.1.4 | Unit/integration tests | ✅ Already installed |
| @testing-library/react | 16.3.2 | Component testing | ✅ Already installed |
| Playwright | 1.58.2 | E2E tests | ✅ Already installed |
| MSW | - | API mocking | ⚠️ Not installed (consider adding) |

**Testing Strategy for Refactoring:**

**Unit Tests (Vitest + React Testing Library):**
```typescript
// Mock auth context
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-id', email: 'test@example.com' },
    session: { access_token: 'test-token' }
  })
}));

// Test access validation hooks
describe('usePaymentStatus', () => {
  it('should fetch access status on mount', async () => {
    // ... test implementation
  });
});
```

**E2E Tests (Playwright):**
```typescript
// Test login → payment check → protected route flow
test('user with active access can access dashboard', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[type="email"]', 'forato@gmail.com');
  await page.fill('[type="password"]', 'test-password');
  await page.click('button[type="submit"]');

  // Should redirect to dashboard (not checkout)
  await expect(page).toHaveURL('/dashboard');
});
```

**Optional Addition: MSW (Mock Service Worker)**
```bash
pnpm add -D msw
```

**Why MSW:**
- Mock API responses in tests without hitting real backend
- Test error states (network failures, 500 errors)
- Test loading states without delay

**Confidence:** HIGH (MEDIUM - Playwright verified in package.json, MSW recommended via WebSearch)

---

## Installation Summary

### Required Additions
```bash
# Admin panel table component
pnpm add @tanstack/react-table

# Cache management for access validation
pnpm add @tanstack/react-query

# Optional: API mocking for tests
pnpm add -D msw
```

### No Changes Required
- ✅ Zod (v4.1.12) - Already installed
- ✅ Supabase JS (v2.98.0) - Already installed
- ✅ Testing tools (Vitest, Playwright, RTL) - Already installed
- ✅ Radix UI - Already installed
- ✅ Tailwind CSS - Already installed

---

## Architecture Recommendations

### Centralized Access Validation

**Problem:** Current implementation has multiple sources of truth (PaymentContext, useSubscription, direct Supabase queries)

**Solution:** Single access validation endpoint with React Query caching

```typescript
// hooks/useAccess.ts
import { useQuery } from '@tanstack/react-query';

export function useAccess() {
  const { session } = useAuth();

  return useQuery({
    queryKey: ['access', 'status', session?.user?.id],
    queryFn: async () => {
      const response = await fetch('/api/payments/status', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      return response.json();
    },
    enabled: !!session,
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
  });
}
```

**Benefits:**
- Single source of truth
- Automatic cache invalidation on auth changes
- No more manual state management in contexts
- Prevents duplicate API calls

---

## Anti-Patterns to Avoid

### 1. ❌ DON'T: Merge Auth and Payment Contexts
**Why:** Separation of concerns prevents cascading updates. Auth (session) is different from Access (payment status).

### 2. ❌ DON'T: Use AG Grid for Admin Panel
**Why:** Too heavy (85KB), paid features needed, overkill for simple user management table.

### 3. ❌ DON'T: Skip RLS Policy Indexing
**Why:** Without indexes, RLS policies cause 99.94% performance degradation on user_access queries.

### 4. ❌ DON'T: Use auth.uid() Directly in Policies
**Why:** Wrapping in `SELECT` provides 94%+ performance improvement by caching function result.

### 5. ❌ DON'T: Build Custom Table Component
**Why:** TanStack Table is mature, battle-tested, and already designed for this use case.

---

## Migration Strategy

### Phase 1: Fix Immediate Issues (Week 1)
1. Add missing indexes on user_access tables
2. Optimize RLS policies with SELECT wrapper
3. Fix ProtectedRoute loop with React Query
4. Implement centralized access validation hook

### Phase 2: Admin Panel (Week 2)
1. Install @tanstack/react-table
2. Build user management table component
3. Implement admin access routes (already exists in server/routes/admin-access.ts)
4. Add admin panel UI with Radix UI primitives

### Phase 3: Testing (Week 3)
1. Add unit tests for access hooks
2. Add E2E tests for login → access → dashboard flow
3. Test admin panel CRUD operations
4. Mock MercadoPago webhooks for testing

---

## Sources

### HIGH Confidence (Official Docs)
- TanStack Table: https://tanstack.com/table/latest (Official documentation)
- Supabase RLS: https://supabase.com/docs/guides/auth/row-level-security (Official documentation)
- React Query: https://tanstack.com/query/latest (Official documentation)
- Zod: https://zod.dev/ (Official documentation)

### MEDIUM Confidence (WebSearch Verified 2025-2026)
- React Context Performance Optimization: https://juejin.cn/post/7578793960626602010 (Nov 2025)
- TanStack Table vs AG Grid Comparison: [Search result analysis showing 12KB vs 85KB bundle size]
- Supabase RLS Performance Optimization: [WebSearch results showing 99.94% improvement with indexes]
- MercadoPago Webhook Best Practices: [WebSearch results showing signature verification patterns]

### LOW Confidence (WebSearch Only)
- Specific version numbers for latest packages (verify with npm before install)
- MercadoPago webhook testing patterns (verify with official docs)

---

## Confidence Assessment

| Area | Confidence | Reason |
|------|------------|--------|
| Admin Panel Table | HIGH | TanStack Table is industry standard for this use case |
| Cache Management | HIGH | React Query proven solution for auth/access caching |
| RLS Policies | HIGH | Official Supabase docs + WebSearch verification |
| Context Patterns | MEDIUM | 2025 articles verify patterns, but project-specific context needed |
| Testing Strategy | MEDIUM | Tools already installed, but MSW addition optional |
| MercadoPago Webhooks | MEDIUM | WebSearch provides patterns, need verification with official docs |

---

## Open Questions

1. **Index Status:** Are indexes already created on user_access.user_id? Need verification.
2. **MSW Necessity:** Is API mocking needed for testing, or can we use real test database?
3. **Admin Permission System:** Is role-based admin check sufficient, or need more granular permissions?
4. **Performance Baseline:** What are current query times on user_access? Need measurement before optimization.
5. **Webhook Reliability:** Current webhook implementation needs review for idempotency and retry logic.

---

*Last updated: 2026-03-04*
*Next review: After Phase 1 implementation*
