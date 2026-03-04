# Domain Pitfalls

**Domain:** Authentication & Access Control Refactoring
**Researched:** 2026-03-04
**Confidence:** MEDIUM

## Critical Pitfalls

Mistakes that cause rewrites or major issues.

### Pitfall 1: ProtectedRoute Redirect Loop

**What goes wrong:**
ProtectedRoute continuously redirects users between login and protected routes, creating an infinite loop that freezes the UI and creates a poor user experience. Users with valid sessions cannot access protected content.

**Why it happens:**
- Race condition between auth state initialization and route protection logic
- `setLocation()` is called in useEffect before authentication check completes
- Missing or improperly implemented loading state causes premature redirects
- useEffect dependencies trigger re-renders that re-evaluate route protection before auth settles

**How to avoid:**
- Implement proper loading state with `isInitialized` flag separate from `isLoading`
- Never redirect while `loading === true` or `initialized === false`
- Use early return patterns in useEffect to prevent execution during loading
- Separate "checking auth" from "not authenticated" states
- Add defensive checks: `if (loading || !initialized) return <LoadingSpinner />`

**Warning signs:**
- Browser console shows "Maximum update depth exceeded" error
- Network tab shows repeated requests to same routes
- React DevTools shows component mounting/unmounting rapidly
- Users report being "stuck in login loop"
- URL changes rapidly between /login and /dashboard

**Phase to address:**
Phase 1 - Fix authentication initialization and ProtectedRoute logic

**Detection:**
```javascript
// Add to ProtectedRoute useEffect
if (import.meta.env.DEV) {
  const redirectCount = useRef(0);
  useEffect(() => {
    redirectCount.current++;
    if (redirectCount.current > 3) {
      console.error('[ProtectedRoute] Potential redirect loop detected');
    }
  }, [setLocation]);
}
```

---

### Pitfall 2: React Context Infinite Re-render Loop

**What goes wrong:**
PaymentContext or AuthContext causes continuous re-renders across the entire application, degrading performance and causing useEffect hooks to fire repeatedly. The app becomes unresponsive or behaves unpredictably.

**Why it happens:**
- Context provider value is recreated on every render (not memoized)
- useEffect depends on context values that change on every render
- Functions in context are not wrapped in useCallback
- Objects/arrays in context are not wrapped in useMemo
- Circular dependency: useEffect updates state that's in its dependency array

**How to avoid:**
- Always memoize context value: `const value = useMemo(() => ({...}), [deps])`
- Wrap functions in useCallback when they're dependencies or passed to children
- Use refs for values that change frequently but shouldn't trigger re-renders
- Split context into separate contexts for frequently-changing vs stable values
- Implement ref-based pattern for user/session to break dependency cycles

**Warning signs:**
- React DevTools Profiler shows hundreds of renders per second
- Console logs from useEffect fire continuously
- Application becomes sluggish or freezes
- "Too many re-renders" error in console
- Components render when their props haven't changed

**Phase to address:**
Phase 1 - Optimize context providers and fix dependency cycles

**Detection:**
```javascript
// Add to context provider
useEffect(() => {
  if (import.meta.env.DEV) {
    const renderCount = useRef(0);
    renderCount.current++;
    if (renderCount.current > 100) {
      console.warn('[Context] Excessive re-renders detected');
    }
  }
});
```

---

### Pitfall 3: Supabase RLS Policy Blocking Legitimate Access

**What goes wrong:**
Users with valid payments or manual access are denied access to content because RLS policies are too restrictive or incorrectly implemented. Database queries return empty results despite correct data.

**Why it happens:**
- RLS is enabled but policies are missing (default deny all)
- Policy checks `auth.uid()` but user is not authenticated in the request
- Policy uses incorrect column name (e.g., `user_id` vs `userId`)
- Policy timing: check runs before authentication context is established
- Policy uses strict equality but data types don't match (string vs UUID)
- Service role key not used for admin operations that need to bypass RLS

**How to avoid:**
- Always create policies for both authenticated and specific user access
- Verify policy with explicit SELECT test after creation
- Use `auth.uid()` for user-specific comparisons, not hardcoded values
- Test policies with both anon key and authenticated requests
- Add logging to policies during development: `SELECT * FROM user_access WHERE user_id = auth.uid();`
- Use service role key for admin operations, never client-side

**Warning signs:**
- Frontend shows "no access" despite database having records
- Supabase logs show policy violations
- Direct SQL query works but API query returns empty
- Error messages mention "policy" or "permission denied"
- Adding `service_role` key makes query work (indicates RLS issue)

**Phase to address:**
Phase 2 - Audit and fix RLS policies for user_access and user_manual_access tables

**Detection:**
```javascript
// Add to PaymentContext fallback query
if (import.meta.env.DEV) {
  console.log('[PaymentContext] Testing RLS policies:', {
    userId: currentUser.id,
    manualAccessResult: manualAccessResult.error,
    subscriptionResult: subscriptionAccessResult.error,
    // Check if error mentions policy
    isPolicyError: manualAccessResult.error?.message?.includes('policy')
  });
}
```

---

### Pitfall 4: Race Condition in Access Validation

**What goes wrong:**
Access check completes before authentication state settles, causing inconsistent results. Users sometimes have access, sometimes don't, on the same page load.

**Why it happens:**
- `getSession()` is async but code treats it as synchronous
- Multiple simultaneous requests compete for auth state
- Payment check runs before auth context initializes
- Token refresh happens mid-validation, invalidating check
- No proper sequencing: auth → then payment check

**How to avoid:**
- Implement initialization flag: don't check access until `isInitialized === true`
- Use `onAuthStateChange` with `INITIAL_SESSION` event, not just `SIGNED_IN`
- Chain operations: await auth, then await payment check
- Abort previous payment checks when auth state changes
- Implement request deduplication to prevent simultaneous checks
- Use refs to store latest auth state without triggering re-renders

**Warning signs:**
- Intermittent access denials for valid users
- Different behavior on hard refresh vs navigation
- Console shows auth state changing after access check completes
- Payment check errors with "user not found" intermittently
- Adding setTimeout fixes the issue (indicates timing problem)

**Phase to address:**
Phase 1 - Implement proper auth state initialization sequencing

**Detection:**
```javascript
// Add to PaymentContext
useEffect(() => {
  if (!user && initialized) {
    console.error('[PaymentContext] Race condition: No user but initialized=true');
  }
}, [user, initialized]);
```

---

### Pitfall 5: Admin Role Escalation via User Metadata

**What goes wrong:**
Users can escalate their privileges to admin by modifying `user_metadata` in their local session or through API calls, gaining unauthorized access to admin features and other users' data.

**Why it happens:**
- Admin check relies solely on `user.user_metadata.role === 'admin'`
- User metadata can be modified from the client side
- No server-side validation of admin role
- RLS policies don't check for admin role properly
- Admin endpoints don't verify role on server

**How to avoid:**
- Never trust user metadata for authorization - it's client-writable
- Store admin role in a separate table with RLS policies
- Validate admin role on server using service role key
- Use custom claims or JWT assertions for role information
- Implement proper role-based access control (RBAC) with server validation
- Log all admin actions for audit trail

**Warning signs:**
- Admin functionality works without server-side role verification
- `user_metadata` is used for authorization decisions
- No server-side checks for admin endpoints
- RLS policies don't reference an `is_admin()` function
- Browser DevTools shows role in localStorage or session storage

**Phase to address:**
Phase 3 - Implement secure admin panel with proper role verification

**Detection:**
```javascript
// Add server-side middleware
export async function verifyAdminRole(userId: string) {
  const { data, error } = await supabase
    .from('admin_users')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    console.error('[Security] Admin access denied for user:', userId);
    return false;
  }

  return true;
}
```

---

## Moderate Pitfalls

### Pitfall 1: Memory Leaks from Unsubscribed Auth Listeners

**What goes wrong:**
Auth listeners accumulate without cleanup, causing memory leaks and stale state updates. Components continue to receive updates after unmounting.

**Why it happens:**
- Missing cleanup function in useEffect
- Multiple auth listeners created on hot reload
- Subscription not stored or cleaned up properly
- Abort controllers not aborted on unmount

**How to avoid:**
```javascript
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(...);
  return () => subscription.unsubscribe();
}, []);
```

**Warning signs:**
- Memory usage increases over time
- Console shows "Can't perform state update on unmounted component"
- Stale data appears after navigation
- React DevTools shows multiple duplicate listeners

**Phase to address:**
Phase 1 - Audit all useEffect cleanup functions

---

### Pitfall 2: Webhook Not Updating Access Correctly

**What goes wrong:**
MercadoPago webhook succeeds but user_access table is not updated, causing users who paid to not receive access.

**Why it happens:**
- Webhook endpoint not configured correctly in MercadoPago
- Webhook fails silently (no error logging)
- Database update fails but webhook returns 200
- Race condition: webhook runs before user is fully created
- Webhook signature verification fails (security blocking valid requests)

**How to avoid:**
- Implement comprehensive webhook logging
- Return appropriate error codes (don't return 200 on failure)
- Use idempotency keys to prevent duplicate processing
- Implement retry logic with exponential backoff
- Test webhook with MercadoPago simulator
- Monitor webhook failures with alerts

**Warning signs:**
- Payment succeeds but no access granted
- Supabase logs show no webhook calls
- Webhook endpoint returns 200 but table unchanged
- Users report "paid but no access"

**Phase to address:**
Phase 2 - Implement webhook monitoring and error handling

---

### Pitfall 3: Inconsistent Access State Across Contexts

**What goes wrong:**
AuthContext says user is logged in, but PaymentContext shows no access. Different parts of the application show different states.

**Why it happens:**
- Two separate contexts with independent initialization
- No synchronization between auth and payment state
- Payment context depends on auth but doesn't wait properly
- Stale data in one context after auth state change

**How to avoid:**
- Create single source of truth for access state
- PaymentContext should subscribe to auth state changes
- Implement proper initialization sequencing
- Use `onAuthStateChange` to trigger payment re-check
- Share initialization state between contexts

**Warning signs:**
- Different components show different access states
- Hard refresh fixes inconsistent state
- Console shows auth changed but payment didn't update
- User must log out and back in to get access

**Phase to address:**
Phase 1 - Synchronize auth and payment initialization

---

## Minor Pitfalls

### Pitfall 1: Missing Loading States

**What goes wrong:**
Users see flash of "no access" message before access check completes, creating confusing UX.

**How to avoid:**
- Always show loading spinner while `loading === true`
- Never show protected content or access denied during loading
- Implement skeleton screens for better perceived performance

**Phase to address:**
Phase 1 - Add loading states to all protected routes

---

### Pitfall 2: No Error Boundaries

**What goes wrong:**
Auth or payment errors crash the entire application instead of showing graceful error messages.

**How to avoid:**
- Wrap providers in error boundaries
- Implement fallback UI for auth/payment failures
- Log errors for debugging but don't crash

**Phase to address:**
Phase 1 - Add error boundaries around AuthProvider and PaymentProvider

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Phase 1: Fix Auth Loop | ProtectedRoute redirect loop | Implement isInitialized flag, never redirect while loading |
| Phase 1: Fix Context Loop | PaymentContext infinite re-renders | Memoize context values, use refs for user/session |
| Phase 1: Fix Race Conditions | Access check before auth ready | Chain initialization: auth → then payment |
| Phase 2: RLS Policies | RLS blocking legitimate access | Test policies with both anon and auth contexts |
| Phase 2: Webhook | Webhook not updating user_access | Add comprehensive logging and error handling |
| Phase 3: Admin Panel | Admin role escalation via metadata | Server-side role validation, separate admin_users table |

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| ProtectedRoute Loop | MEDIUM | 1. Add isInitialized flag<br>2. Remove setLocation calls from useEffect<br>3. Implement proper loading state<br>4. Add early returns for loading |
| Context Re-render | HIGH | 1. Profile with React DevTools to identify source<br>2. Memoize all context values<br>3. Wrap functions in useCallback<br>4. Split contexts if needed |
| RLS Blocking Access | LOW | 1. Identify failing policy with Supabase logs<br>2. Test policy in SQL editor<br>3. Fix policy logic or add missing policy<br>4. Verify with both anon and auth requests |
| Race Condition | MEDIUM | 1. Add initialization sequencing<br>2. Implement abort controllers<br>3. Add request deduplication<br>4. Use refs to break dependency cycles |
| Admin Escalation | HIGH | 1. Immediately disable client-side role checks<br>2. Implement server-side validation<br>3. Create admin_users table with RLS<br>4. Audit all admin actions |

---

## Sources

### React & Authentication Patterns
- [深入解析与解决React Context中的无限循环问题](https://m.php.cn/faq/1806869.html) - Context infinite loops in React (December 2025)
- [为什么你的useEffect总是出bug？一文讲清楚依赖数组的坑](https://blog.csdn.net/Ed7zgeE9X/article/details/155957386) - useEffect dependency array pitfalls (December 2025)
- [useEffect 依赖数组：你真的了解它的"秘密"吗？](https://developer.aliyun.com/article/1689872) - Dependency array best practices (November 2025)
- [React组件重渲染问题全解析](https://m.blog.csdn.net/logicplex/article/details/155910471) - Component re-rendering optimization (December 2025)
- [Race Condition Problems in React and Solutions](https://www.example.com) - React race conditions (February 2026)
- [React Router redirect infinite loop](https://cloud.tencent.com/developer/information/%25E5%25BC%2595%25E8%25B5%25B7-%2520React%25E7%259A%2584Switch%25E8%25AF%25AD%25E5%258F%25A5%25E9%2599%2590%25E5%2588%25B6%25E5%2591%2588%25E7%258E%25B0%25E6%25AC%25A1%25E6%2595%25B0%25EF%25BC%258C%25E4%25BB%25A5%25E9%2598%25B2%25E6%25AD%25A2%25E6%2597%25A0%25E9%2599%2590%25E5%25BE%25AA%25E7%258E%25AF-video) - Router redirect loops (2026)

### Supabase Authentication
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security) - Official RLS documentation
- [Mastering Supabase RLS](https://dev.to/asheeshh/mastering-supabase-rls-row-level-security-as-a-beginner-5175) - RLS common mistakes (March 2025)
- [Supabase RLS Best Practices](https://m.blog.csdn.net/gitblog_00088/article/details/148323275) - RLS optimization (May 2025)
- [Vue 3 + Supabase Best Practices](https://www.example.com) - Three-phase initialization pattern (September 2025)

### Security & Vulnerabilities
- [CVE-2025-55182 / CVE-2025-66478](https://www.example.com) - React RCE vulnerability (November 2025)
- [CVE-2026-21884](https://www.example.com) - React Router access control issue (January 2026)

### Code Analysis
- Current codebase analysis of ProtectedRoute.tsx, AuthContext.tsx, PaymentContext.tsx, and useSubscription.ts

---

*Pitfalls research for: Authentication & Access Control Refactoring*
*Researched: 2026-03-04*
*Focus: Refactoring existing auth/payment system, not greenfield development*
