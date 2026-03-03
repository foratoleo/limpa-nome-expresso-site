# AutoPILOT Spec - Fix Navigation Redirect Bug

## Problem Statement
Users with valid access are redirected to `/checkout` after navigation, even though they have `hasActiveAccess: true` on first load.

## Root Cause
Fallback in PaymentContext only checks `user_manual_access`, not `user_access` (subscriptions).

## Implementation Plan
1. Fix fallback to check BOTH tables
2. Add AbortController for request cancellation
3. Add auth event listener for token refresh detection

## Success Criteria
✅ Users NOT redirected after navigation
✅ Console shows `hasAccess: true` consistently
