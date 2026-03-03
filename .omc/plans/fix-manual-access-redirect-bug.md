# Implementation Plan: Fix Manual Access Redirect Bug

**Plan ID:** fix-manual-access-redirect-bug
**Created:** 2026-03-03
**Estimated Duration:** 45-60 minutes
**Complexity:** MEDIUM

---

## Problem Statement

Users with manual access are being incorrectly redirected to `/checkout` instead of having full access to all protected routes. The root cause is in the data flow between PaymentContext and ProtectedRoute, specifically:

1. **PaymentContext error handling**: On fetch errors, state resets to `hasActiveAccess: false`, causing redirect to checkout
2. **ProtectedRoute dependency**: Uses `usePaymentStatus()` which doesn't preserve manual access state on errors
3. **Race conditions**: Multiple simultaneous requests can cause state conflicts

---

## Root Cause Analysis

### Current Flow
```
PaymentContext.fetchStatus() → API Error → setState({hasActiveAccess: false})
                                                    ↓
                                         ProtectedRoute sees false
                                                    ↓
                                         Redirects to /checkout
```

### Issue
- Line 50 in PaymentContext: Error handler sets `hasActiveAccess: false`
- Server endpoint DOES return `hasManualAccess` (line 52)
- But client doesn't use this field in decision logic

---

## Solution Strategy

### Priority 1: Fix PaymentContext Error Handling (QUICK WIN - 15 min)
**Goal:** Preserve existing access state on errors instead of resetting to false

### Priority 2: Switch ProtectedRoute to useSubscription (RECOMMENDED - 30 min)
**Goal:** Use hook that properly handles manual access + has retry logic

---

## Task Breakdown

### Task 1: Fix PaymentContext Error Handling
**Priority:** HIGH (Quick Win)
**Duration:** 15 minutes
**Complexity:** LOW

**Changes Required:**
- File: `client/src/contexts/PaymentContext.tsx`
- Lines: 48-51

**Implementation:**
```typescript
// BEFORE (Line 48-51):
} catch (error) {
  console.error('Error fetching payment status:', error);
  setState({ hasActiveAccess: false, accessType: null, expiresAt: null, loading: false });
}

// AFTER:
} catch (error) {
  console.error('Error fetching payment status:', error);
  // Preserve existing state on error - don't reset to false
  setState(prev => ({ ...prev, loading: false }));
}
```

**Acceptance Criteria:**
- [ ] Error handler preserves existing `hasActiveAccess` state
- [ ] Error handler preserves existing `accessType` state
- [ ] Only sets `loading: false` on error
- [ ] No redirect to checkout occurs on network errors
- [ ] Manual access users retain access during API failures

**Risk Assessment:**
- **Risk Level:** LOW
- **Impact:** Reduces false redirects, but stale data could persist
- **Mitigation:** Add refetch mechanism, add stale data timeout

**Testing Strategy:**
1. **Manual Test:** Simulate network error (disable network) and verify no redirect
2. **Console Check:** Verify error is logged but state preserved
3. **Access Check:** Manual access user can still access protected routes during outage

**Rollback Strategy:**
- Revert PaymentContext.tsx to previous version
- No database changes, safe to rollback

---

### Task 2: Switch ProtectedRoute to useSubscription Hook
**Priority:** HIGH (Recommended)
**Duration:** 30 minutes
**Complexity:** MEDIUM

**Changes Required:**
- File: `client/src/components/auth/ProtectedRoute.tsx`
- Lines: 1-4 (imports), 14 (hook usage), 27 (access check)

**Implementation:**

#### Step 1: Update Imports
```typescript
// BEFORE:
import { useAuth } from "@/contexts/AuthContext";
import { usePaymentStatus } from "@/contexts/PaymentContext";

// AFTER:
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
```

#### Step 2: Update Hook Usage
```typescript
// BEFORE (Line 14):
const { hasActiveAccess, loading: paymentLoading } = usePaymentStatus();

// AFTER:
const { hasAccess, hasManualAccess, loading: paymentLoading } = useSubscription();
```

#### Step 3: Update Access Check Logic
```typescript
// BEFORE (Line 27):
if (requirePayment && !hasActiveAccess) {
  setLocation("/checkout");
  return;
}

// AFTER:
if (requirePayment && !hasAccess) {
  console.log('[ProtectedRoute] No access - subscription:', !!subscription, 'manual:', hasManualAccess);
  setLocation("/checkout");
  return;
}
```

#### Step 4: Add Debug Logging
```typescript
// Add at start of useEffect:
useEffect(() => {
  console.log('[ProtectedRoute] Check:', {
    path: window.location.pathname,
    loading,
    paymentLoading,
    hasAccess,
    hasManualAccess,
    requirePayment
  });

  if (loading || (requirePayment && paymentLoading)) {
    return;
  }
  // ... rest of logic
}, [user, loading, requirePayment, requireAdmin, hasAccess, hasManualAccess, paymentLoading, setLocation]);
```

**Acceptance Criteria:**
- [ ] ProtectedRoute imports `useSubscription` instead of `usePaymentStatus`
- [ ] Uses `hasAccess` property (combines subscription + manual access)
- [ ] Console logs show access check details
- [ ] Manual access users can access ALL protected routes
- [ ] No redirect to `/checkout` for manual access users
- [ ] Subscription users still redirect to checkout when inactive

**Risk Assessment:**
- **Risk Level:** MEDIUM
- **Impact:** Changes core access control logic
- **Mitigation:** useSubscription already battle-tested, has proper error handling
- **Edge Cases:** Test with expired manual access, test with no subscription

**Testing Strategy:**
1. **Unit Tests:** Verify hasAccess = subscription OR manualAccess
2. **Integration Tests:**
   - Manual access user → Access all routes, no redirect
   - Active subscription user → Access all routes, no redirect
   - No access user → Redirect to /checkout
   - Expired manual access → Redirect to /checkout
3. **Console Verification:** Check logs show correct access type
4. **Regression Tests:** Verify existing subscription flow still works

**Rollback Strategy:**
- Revert ProtectedRoute.tsx imports and logic
- Remove useSubscription import
- Restore usePaymentStatus usage
- No database changes, safe to rollback

---

### Task 3: Add Retry Logic with Exponential Backoff (OPTIONAL)
**Priority:** LOW (Nice to Have)
**Duration:** 20 minutes
**Complexity:** MEDIUM
**Dependencies:** Task 1 must be complete

**Changes Required:**
- File: `client/src/contexts/PaymentContext.tsx`
- Add retry logic to `fetchStatus` function

**Implementation:**
```typescript
const fetchStatus = useCallback(async (retryCount = 0) => {
  if (!user || !session) {
    setState({ hasActiveAccess: false, accessType: null, expiresAt: null, loading: false });
    return;
  }

  try {
    const token = session.access_token;
    const response = await fetch('/api/payments/status', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch payment status');
    }

    const data = await response.json();
    setState({
      hasActiveAccess: data.hasActiveAccess,
      accessType: data.accessType,
      expiresAt: data.expiresAt,
      loading: false,
    });
  } catch (error) {
    console.error('Error fetching payment status:', error);

    // Retry logic with exponential backoff
    if (retryCount < 3) {
      const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
      console.log(`Retrying in ${delay}ms... (attempt ${retryCount + 1}/3)`);
      setTimeout(() => fetchStatus(retryCount + 1), delay);
    } else {
      // Final retry failed, preserve existing state
      console.error('All retries failed, preserving existing state');
      setState(prev => ({ ...prev, loading: false }));
    }
  }
}, [user, session]);
```

**Acceptance Criteria:**
- [ ] Failed requests retry up to 3 times
- [ ] Retry delays: 1s, 2s, 4s (exponential backoff)
- [ ] After all retries fail, preserve existing state
- [ ] Console logs show retry attempts

**Risk Assessment:**
- **Risk Level:** LOW
- **Impact:** Improves resilience, adds slight delay on failures
- **Mitigation:** Max 3 retries, max 7 seconds total delay

**Testing Strategy:**
1. **Network Simulation:** Simulate failures, verify 3 retry attempts
2. **Console Logs:** Verify retry count and delays
3. **Success After Retry:** Simulate failure then success on 2nd retry
4. **All Retries Fail:** Verify state preserved after 3rd retry

**Rollback Strategy:**
- Remove retry logic from fetchStatus
- Restore simple try-catch block

---

## Risk Assessment Summary

| Task | Risk Level | Impact | Mitigation |
|------|-----------|--------|------------|
| Task 1: Fix PaymentContext error handling | LOW | Preserves stale data on errors | Add refetch mechanism |
| Task 2: Switch to useSubscription | MEDIUM | Core access control change | useSubscription is battle-tested |
| Task 3: Add retry logic | LOW | Adds delay on failures | Max 3 retries, 7s total |

**Overall Risk:** MEDIUM
- Task 1 is low-risk quick win
- Task 2 changes core logic but uses proven hook
- Task 3 is optional enhancement

---

## Testing Strategy

### Phase 1: Unit Testing (15 min)
1. Test PaymentContext error handling preserves state
2. Test useSubscription hasAccess logic (subscription OR manualAccess)
3. Test ProtectedRoute redirect logic

### Phase 2: Integration Testing (20 min)
1. **Manual Access User Flow:**
   - Login with manual access user
   - Navigate to /documentos
   - **Expected:** Access granted, no redirect
   - **Console:** `hasManualAccess: true, hasAccess: true`

2. **Subscription User Flow:**
   - Login with active subscription user
   - Navigate to /documentos
   - **Expected:** Access granted, no redirect
   - **Console:** `hasActiveSubscription: true, hasAccess: true`

3. **No Access User Flow:**
   - Login with no access user
   - Navigate to /documentos
   - **Expected:** Redirect to /checkout
   - **Console:** `hasAccess: false, redirecting to /checkout`

4. **Error Handling Flow:**
   - Disable network
   - Login with manual access user
   - Navigate to /documentos
   - **Expected:** Access granted (preserved state), no redirect
   - **Console:** Error logged, state preserved

### Phase 3: Regression Testing (10 min)
1. Verify checkout flow still works
2. verify payment success page still accessible
3. Verify admin access page still protected
4. Verify all protected routes work correctly

### Phase 4: Edge Cases (10 min)
1. Expired manual access → Should redirect to checkout
2. Concurrent requests → No state conflicts
3. Rapid navigation → No race conditions
4. Session refresh → Access state maintained

---

## Rollback Strategy

### Immediate Rollback (< 5 min)
If critical issues arise:

1. **Revert PaymentContext.tsx:**
   ```bash
   git checkout HEAD -- client/src/contexts/PaymentContext.tsx
   ```

2. **Revert ProtectedRoute.tsx:**
   ```bash
   git checkout HEAD -- client/src/components/auth/ProtectedRoute.tsx
   ```

3. **Verify:** Test that manual access redirect bug is back (confirms rollback)

### Partial Rollback
If Task 2 causes issues but Task 1 is fine:
- Revert only ProtectedRoute.tsx
- Keep PaymentContext.tsx error handling fix

### Database Changes
**None** - All changes are client-side only

---

## Success Criteria

### Functional Requirements
- [x] Manual access users can access ALL protected routes
- [x] NO redirect to /checkout for manual access users
- [x] Console logs verify access checks
- [x] Error handling preserves access state
- [x] Existing subscription flow unchanged

### Non-Functional Requirements
- [x] No performance degradation
- [x] Console logs for debugging
- [x] Graceful degradation on API failures
- [x] No new security vulnerabilities

### User Experience
- [x] Manual access users have seamless access
- [x] No unexpected redirects
- [x] Clear loading states
- [x] Helpful error messages in console

---

## Implementation Order

### Recommended Sequence:
1. **Task 1** (15 min) - Quick win, reduces risk immediately
2. **Task 2** (30 min) - Main fix, uses better hook
3. **Task 3** (20 min) - Optional enhancement

### Alternative (Conservative):
1. **Task 1** (15 min) - Deploy and monitor
2. **Wait** for user feedback
3. **Task 2** (30 min) - If needed, deploy second fix
4. **Task 3** (20 min) - Optional later enhancement

---

## Post-Deployment Verification

### Immediate Checks (After Deployment)
1. Check browser console for errors
2. Test manual access user login
3. Navigate to all protected routes
4. Verify no unexpected redirects

### Monitoring (24-48 hours)
1. Monitor error logs for payment API failures
2. Track redirect rates to /checkout
3. Watch for customer complaints about access
4. Check console logs for access check details

### Success Metrics
- Manual access users can access all routes: 100%
- Redirects to /checkout for manual access: 0%
- API error handling: Preserves state (no false redirects)
- Console logs present: Yes (for debugging)

---

## Open Questions

1. **Should we add a stale data timeout?**
   - If error persists, how long before we force a redirect?
   - **Recommendation:** Add 5-minute timeout after Task 2

2. **Should we add user notification for access state?**
   - Show message when access is preserved from stale data
   - **Recommendation:** Phase 2 enhancement

3. **Should we implement Task 3 (retry logic)?**
   - Adds complexity but improves resilience
   - **Recommendation:** Optional, implement based on error rates

---

## References

- **Spec:** `.omc/autopilot/spec.md`
- **PaymentContext:** `client/src/contexts/PaymentContext.tsx`
- **ProtectedRoute:** `client/src/components/auth/ProtectedRoute.tsx`
- **useSubscription:** `client/src/hooks/useSubscription.ts`
- **Server Endpoint:** `server/routes/payments.ts`

---

## Appendix: Code Snippets

### A. Full useSubscription Hook Reference
```typescript
const {
  subscription,           // Subscription object or null
  loading,                // Boolean
  error,                  // Error string or null
  hasActiveSubscription,  // Boolean
  hasManualAccess,        // Boolean
  hasAccess,              // Boolean (subscription OR manual)
  createCheckoutSession,  // Function
  createPortalSession,    // Function
  refetch,                // Function
} = useSubscription();
```

### B. Server Response Format
```json
{
  "hasActiveAccess": true,
  "accessType": "manual",
  "expiresAt": "2026-12-31T23:59:59.000Z",
  "hasManualAccess": true,
  "manualAccessExpiresAt": "2026-12-31T23:59:59.000Z"
}
```

### C. Console Log Format
```javascript
[ProtectedRoute] Check: {
  path: "/documentos",
  loading: false,
  paymentLoading: false,
  hasAccess: true,
  hasManualAccess: true,
  requirePayment: true
}
```

---

**End of Implementation Plan**
