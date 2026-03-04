# Architecture Research

**Domain:** Authentication and Access Control Refactoring (React SPA + Supabase + Express API)
**Researched:** 2026-03-04
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Presentation Layer                      │
│                        (React SPA)                           │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ ProtectedRoute│  │  Dashboard   │  │  AdminPanel  │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│  ┌──────▼──────────────────▼──────────────────▼──────┐     │
│  │              Context Layer (React)                │     │
│  │  ┌──────────────┐      ┌──────────────┐          │     │
│  │  │ AuthContext  │      │PaymentContext│          │     │
│  │  │ (Session)    │      │ (Access)     │          │     │
│  │  └──────┬───────┘      └──────┬───────┘          │     │
│  └─────────┼──────────────────────┼──────────────────┘     │
├────────────┼──────────────────────┼──────────────────────┤
│            │                      │                       │
│  ┌─────────▼──────────────────────▼──────────────────┐   │
│  │              API Layer (Express)                   │   │
│  │  ┌──────────────────────────────────────────┐    │   │
│  │  │  /api/payments/status (Access Validation) │    │   │
│  │  └───────────────────┬──────────────────────┘    │   │
│  │                      │                           │   │
│  │  ┌───────────────────▼──────────────────────┐    │   │
│  │  │  /api/admin/access/* (Admin Management)  │    │   │
│  │  └───────────────────┬──────────────────────┘    │   │
│  └──────────────────────┼──────────────────────────┘   │
├─────────────────────────┼──────────────────────────────┤
│                          │                              │
│  ┌───────────────────────▼──────────────────────────┐  │
│  │              Data Layer (Supabase)                │  │
│  │  ┌──────────────┐  ┌──────────────┐             │  │
│  │  │ auth.users   │  │ user_access  │             │  │
│  │  │ (Session)    │  │ (Payments)   │             │  │
│  │  └──────────────┘  └──────────────┘             │  │
│  │                      ┌──────────────┐             │  │
│  │                      │user_manual_  │             │  │
│  │                      │access (Admin)│             │  │
│  │                      └──────────────┘             │  │
│  └──────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **ProtectedRoute** | Route-level access control, prevents loops, handles loading states | React component with useEffect for navigation |
| **AuthContext** | Supabase session management, auth state, user identity | React Context with Supabase auth listeners |
| **PaymentContext** | Access status caching, centralized validation logic | React Context with API polling + fallback |
| **/api/payments/status** | Single source of truth for access determination | Express endpoint with Supabase queries |
| **/api/admin/access*** | Manual access management (grant/revoke) | Express routes with admin middleware |
| **AdminPanel** | UI for managing manual user access | React components consuming admin APIs |

## Recommended Project Structure

```
client/src/
├── components/
│   ├── auth/
│   │   ├── ProtectedRoute.tsx      # Route protection (NO loops)
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   └── admin/
│       ├── AdminPanel.tsx          # Main admin interface
│       ├── UserAccessList.tsx      # List of manual access grants
│       └── GrantAccessForm.tsx     # Form to grant access
├── contexts/
│   ├── AuthContext.tsx             # Session management (existing)
│   └── PaymentContext.tsx          # Access status + caching (refactor)
├── hooks/
│   ├── useSubscription.ts          # Access status convenience hook
│   └── useAdminAccess.ts           # Admin operations hook (new)
├── lib/
│   ├── access-validation.ts        # Shared access logic (new)
│   └── api-client.ts               # Centralized API calls (new)
└── pages/
    ├── Dashboard.tsx
    ├── Landing.tsx
    └── Admin.tsx                   # Admin dashboard route

server/
├── routes/
│   ├── auth.ts                     # Existing auth routes
│   ├── payments.ts                 # /api/payments/status (centralized)
│   └── admin-access.ts             # Admin management routes (existing)
├── middleware/
│   ├── admin-auth.ts               # Admin verification (extract)
│   └── validation.ts               # Request validation
└── services/
    └── access-service.ts           # Business logic for access (new)
```

### Structure Rationale

- **components/auth/**: Auth-specific UI components, separated from admin concerns
- **components/admin/**: Admin interface components, isolated from regular user flows
- **contexts/**: Global state management - Auth for session, Payment for access (separation of concerns)
- **lib/access-validation.ts**: Centralized access logic to prevent duplication between ProtectedRoute and hooks
- **server/routes/payments.ts**: Single API endpoint for access validation (single source of truth)
- **server/services/access-service.ts**: Business logic separation from route handlers

## Architectural Patterns

### Pattern 1: Stable Reference Pattern for Context Dependencies

**What:** Use `useRef` to store values that Context dependencies need without triggering re-renders or creating infinite loops

**When to use:** When Context needs to access values from another Context but those values change frequently

**Trade-offs:**
- ✅ Prevents infinite loops in useEffect dependencies
- ✅ Reduces unnecessary re-renders
- ❌ Slightly more complex code structure
- ❌ Requires careful synchronization

**Example:**
```typescript
// PaymentContext.tsx
const userSessionRef = useRef({ user, session });

// Keep refs in sync with latest values
useEffect(() => {
  userSessionRef.current = { user, session };
}, [user, session]);

const fetchStatus = useCallback(async () => {
  // Read from ref instead of depending on user/session props
  const currentUser = userSessionRef.current.user;
  const currentSession = userSessionRef.current.session;
  // ... fetch logic
}, []); // Empty dependency array - no infinite loop
```

**Why this matters for the project:** The existing PaymentContext already implements this pattern to prevent the race condition described in PROJECT.md. This pattern should be preserved and documented.

### Pattern 2: Single Source of Truth for Access Validation

**What:** All access checks flow through a single API endpoint (`/api/payments/status`) that combines multiple access sources

**When to use:** When access determination involves multiple data sources (payment access, manual access, subscriptions)

**Trade-offs:**
- ✅ Consistent access logic across all components
- ✅ Easier to debug and test
- ✅ Single place to add new access types
- ❌ Network dependency for every check
- ❌ API becomes a critical path

**Example:**
```typescript
// server/routes/payments.ts
router.get('/status', async (req, res) => {
  const user = await getUserFromToken(req);

  // Check payment access
  const { data: paymentAccess } = await supabase
    .from('user_access')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .gte('expires_at', new Date().toISOString())
    .maybeSingle();

  // Check manual access
  const { data: manualAccess } = await supabase
    .from('user_manual_access')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .or('expires_at.is.null,expires_at.gte.' + new Date().toISOString())
    .maybeSingle();

  // Combined result
  return res.json({
    hasActiveAccess: !!paymentAccess || !!manualAccess,
    accessType: paymentAccess?.access_type || 'manual',
    expiresAt: paymentAccess?.expires_at || manualAccess?.expires_at,
  });
});
```

**Why this matters for the project:** Currently, ProtectedRoute, PaymentContext, and useSubscription all need to check access. Centralizing this prevents divergence and bugs.

### Pattern 3: Three-State Loading Pattern

**What:** Components track three states: `loading` (initial data), `initialized` (data loaded once), and specific operation states

**When to use:** When protected routes need to wait for async data before rendering

**Trade-offs:**
- ✅ Prevents flash of unauthorized content
- ✅ Clear UX with loading indicators
- ❌ More complex state management
- ❌ Requires careful state synchronization

**Example:**
```typescript
// PaymentContext.tsx
const [state, setState] = useState({
  hasActiveAccess: false,
  loading: true,      // Initial fetch in progress
  initialized: false, // First fetch completed
});

// ProtectedRoute.tsx
if (loading || (requirePayment && !initialized)) {
  return <LoadingSpinner />;
}

// Now safe to check access
if (!user || (requirePayment && !hasAccess)) {
  return null; // or redirect handled in useEffect
}
```

**Why this matters for the project:** The existing code shows timing issues where ProtectedRoute redirects before PaymentContext has finished loading. This pattern explicitly waits for initialization.

### Pattern 4: Soft Delete for Access Records

**What:** Instead of deleting access records, set `is_active: false` to preserve audit trail

**When to use:** For any access control or permission system where audit history matters

**Trade-offs:**
- ✅ Complete audit trail
- ✅ Can reactivate easily
- ❌ Database growth over time
- ❌ Queries must always filter by `is_active`

**Example:**
```typescript
// Revoke access (don't delete)
await supabase
  .from('user_manual_access')
  .update({ is_active: false })
  .eq('user_id', userId)
  .eq('is_active', true);
```

**Why this matters for the project:** The existing admin-access routes already implement this pattern. It should be documented and consistently applied.

## Data Flow

### Request Flow: Login → Protected Route

```
[User submits login]
    ↓
[LoginForm] → signIn() → Supabase Auth
    ↓                          ↓
[AuthContext] ← onAuthStateChange ← Session Created
    ↓
[PaymentContext] ← onAuthStateChange (INITIAL_SESSION, SIGNED_IN)
    ↓
fetchStatus() → /api/payments/status
    ↓                      ↓
[API] → Check user_access → Check user_manual_access
    ↓                      ↓
[PaymentContext] ← Combined access result
    ↓ (set state: initialized = true)
[ProtectedRoute] ← Re-renders with access data
    ↓
[Check access] → hasAccess? → [Render Dashboard] : [Redirect to Checkout]
```

### Request Flow: Admin Grants Manual Access

```
[Admin: AdminPanel]
    ↓
[UserAccessList] → GET /api/admin/access/list
    ↓
[API] → verifyAdmin middleware → Check user_metadata.role === 'admin'
    ↓
[API] → Query user_manual_access + Enrich with user emails
    ↓
[AdminPanel] ← Display list of active manual access grants
    ↓
[Admin: GrantAccessForm]
    ↓
[POST /api/admin/access/grant] → { email, reason, expires_at }
    ↓
[API] → verifyAdmin → Find user by email
    ↓
[API] → Insert into user_manual_access (is_active: true)
    ↓
[AdminPanel] ← Success message
    ↓
[Target User] → Next PaymentContext refresh → Access granted
```

### Key Data Flows

1. **Authentication Flow:** Supabase Auth → AuthContext → PaymentContext (via onAuthStateChange) → ProtectedRoute decision
2. **Access Validation Flow:** ProtectedRoute → PaymentContext → /api/payments/status → Combined access result
3. **Admin Grant Flow:** AdminPanel → /api/admin/access/grant → user_manual_access table → Target user's next access check
4. **Cache Invalidation:** PaymentContext refreshes on auth events (TOKEN_REFRESHED, USER_UPDATED) → New access status from API

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k users | Current architecture is optimal. Single API endpoint for access checks is fine. Direct DB queries in admin routes acceptable. |
| 1k-100k users | Add Redis caching for /api/payments/status (5-10 min TTL). Index user_access and user_manual_access by user_id + expires_at. Consider paginating admin list endpoint. |
| 100k+ users | Separate read replica for access checks. Queue-based webhook processing for MercadoPago. Dedicated admin service with rate limiting. Consider moving access validation to edge (Supabase Edge Functions). |

### Scaling Priorities

1. **First bottleneck:** `/api/payments/status` will be called on every protected route navigation and auth state change
   - **Fix:** Add short-term caching (30-60s) in PaymentContext, already implemented with `initialized` flag
   - **Monitoring:** Log cache hit rate and API response times

2. **Second bottleneck:** Admin access list fetches all users from Supabase Auth
   - **Fix:** Implement pagination, search by email, or cache user email mappings
   - **Monitoring:** Track list API response times

## Anti-Patterns

### Anti-Pattern 1: Redirect Loop in ProtectedRoute

**What people do:**
```typescript
// BAD: Causes infinite loop
useEffect(() => {
  if (!user) {
    setLocation('/login');  // Triggers re-render
  }
  if (!hasAccess) {
    setLocation('/checkout');  // Triggers re-render
  }
}); // Missing dependencies or unstable dependencies
```

**Why it's wrong:**
- `setLocation()` causes component re-render
- Re-render triggers useEffect again
- If conditions haven't changed, infinite loop
- Especially bad when `hasAccess` comes from an async fetch that hasn't completed

**Do this instead:**
```typescript
// GOOD: Explicit loading state, stable dependencies
const [decisionMade, setDecisionMade] = useState(false);

useEffect(() => {
  if (loading) return; // Wait for data

  if (!user) {
    setLocation('/login');
    setDecisionMade(true);
    return;
  }

  if (requirePayment && !hasAccess) {
    setLocation('/checkout');
    setDecisionMade(true);
    return;
  }

  setDecisionMade(true);
}, [user, loading, hasAccess, requirePayment]);

if (!decisionMade || loading) {
  return <LoadingSpinner />;
}
```

### Anti-Pattern 2: Multiple Access Check Sources

**What people do:**
```typescript
// BAD: Access logic scattered across components
// Component A checks user_access table directly
// Component B calls an API endpoint
// Component C checks hasManualAccess flag

// In ProtectedRoute
const { data } = await supabase.from('user_access').select();

// In another component
const response = await fetch('/api/payments/status');
```

**Why it's wrong:**
- Different components may disagree on access
- Bug fix requires updating multiple places
- Inconsistent caching behavior
- Hard to debug access issues

**Do this instead:**
```typescript
// GOOD: Single source of truth
// All access checks go through /api/payments/status
// All components use PaymentContext

// Anywhere access is needed:
const { hasActiveAccess, hasManualAccess } = usePaymentStatus();

// If direct API access needed (rare):
const response = await fetch('/api/payments/status');
```

### Anti-Pattern 3: Silent Access Denial

**What people do:**
```typescript
// BAD: User sees nothing, no explanation
if (!hasAccess) {
  return null;
}
```

**Why it's wrong:**
- User doesn't know why they can't access
- Looks like a bug or broken page
- No clear path to fix (pay, contact admin, etc.)

**Do this instead:**
```typescript
// GOOD: Clear feedback with action
if (!hasAccess) {
  return (
    <AccessDeniedMessage
      reason="Pagamento necessário"
      action={{
        text: "Ir para Pagamento",
        href: "/checkout"
      }}
    />
  );
}

// Or redirect with state:
if (!hasAccess) {
  setLocation('/checkout?redirect=' + currentPath);
}
```

### Anti-Pattern 4: Admin Role Check Only on Client

**What people do:**
```typescript
// BAD: Only checks on frontend
if (user.user_metadata?.role === 'admin') {
  return <AdminPanel />;
}
```

**Why it's wrong:**
- Client-side checks can be bypassed
- API endpoints without admin checks are exposed
- User can modify localStorage or session storage

**Do this instead:**
```typescript
// GOOD: Defense in depth
// Frontend: Show/hide UI based on role
if (user.user_metadata?.role === 'admin') {
  return <AdminPanel />;
}

// Backend: Always verify admin role
async function verifyAdmin(req, res, next) {
  const { user } = await supabase.auth.getUser(req.headers.authorization);
  if (user.user_metadata?.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  req.user = user;
  next();
}

router.get('/api/admin/access/list', verifyAdmin, handler);
```

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| **Supabase Auth** | Direct client SDK + Admin SDK on server | Use service role key for admin operations, regular auth for user operations |
| **MercadoPago** | Webhook → server → user_access table | Ensure webhook updates both access status and expiry date |
| **EmailIt API** | Server-side email sending | Used for custom confirmation emails, already integrated |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| **AuthContext ↔ PaymentContext** | Event-driven (onAuthStateChange) | PaymentContext listens to auth events, no direct import |
| **PaymentContext ↔ ProtectedRoute** | Context consumption (usePaymentStatus) | ProtectedRoute reads state, doesn't modify it |
| **Frontend ↔ Backend** | REST API (Bearer token auth) | All requests include Authorization header with Supabase JWT |
| **Admin routes ↔ Regular routes** | Separate route prefixes (/api/admin/*) | Admin middleware verifies role on every request |

## Build Order for Refactoring

Based on component dependencies and risk minimization:

### Phase 1: Foundation (Low Risk)
1. **Create `lib/access-validation.ts`** - Extract common access logic
2. **Create `lib/api-client.ts`** - Centralize API call logic
3. **Add comprehensive logging** - Instrument existing flows to understand timing

### Phase 2: Fix Critical Issues (High Risk, High Priority)
4. **Fix ProtectedRoute loop** - Implement stable loading state pattern
5. **Verify PaymentContext caching** - Ensure no unnecessary re-fetches
6. **Test /api/payments/status** - Confirm it returns correct combined access

### Phase 3: Admin Interface (Medium Risk)
7. **Create admin components** - AdminPanel, UserAccessList, GrantAccessForm
8. **Add admin routes** - `/admin` route with ProtectedRoute(requireAdmin)
9. **Test admin operations** - Grant, revoke, reactivate access

### Phase 4: Polish & Monitoring (Low Risk)
10. **Add access denied UI** - Clear feedback for denied access
11. **Implement redirect handling** - Proper post-login/post-payment routing
12. **Add monitoring** - Track access check latency, cache hit rate

## Sources

- **Existing Codebase Analysis:** ProtectedRoute.tsx, PaymentContext.tsx, auth.ts, payments.ts, admin-access.ts
- **React Context Patterns:** Official React documentation on context and useCallback
- **Supabase Best Practices:** Supabase Auth documentation, Row Level Security guides
- **Express Route Organization:** Express.js middleware and routing patterns

---
*Architecture research for: Limpa Nome Expresso auth/payment refactoring*
*Researched: 2026-03-04*
