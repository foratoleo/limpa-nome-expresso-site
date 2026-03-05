# Authentication Flow Test

## Expected Flow for forato@gmail.com (admin)

### 1. Login (Landing Page)
- User enters email and password
- Calls `supabase.auth.signInWithPassword()`
- Returns user object with `user_metadata.role: "admin"`
- Redirects to `/auth/callback`

### 2. Auth Callback
- Sets Supabase session
- AuthContext updates user state
- Redirects to `/welcome`

### 3. Welcome Page
- Route: `/welcome` with `requirePayment={false}`
- ProtectedRoute checks:
  - Loading? No
  - User exists? Yes
  - User role == 'admin'? Yes → BYPASS, show content
- Displays welcome message
- After 5 seconds: redirects to `/guia`

### 4. Guide Page (/guia)
- Route: `/guia` with `requirePayment={true}`
- ProtectedRoute checks:
  - Loading? No
  - User exists? Yes
  - User role == 'admin'? Yes → BYPASS at line 48, show content
  - (API check never runs for admins)

## Potential Issues to Investigate

### Issue 1: User metadata not loaded
- If `user.user_metadata.role` is undefined, admin bypass fails
- Fallback: Should use API to check manual access

### Issue 2: API still gets called
- If admin bypass doesn't trigger, API is called
- API might fail or return `{ hasActiveAccess: false }`
- User gets redirected to `/checkout`

### Issue 3: Race condition
- AuthContext not updated before Welcome renders
- User is null when ProtectedRoute checks
- Redirects to home or checkout

## What to Check

1. Does Supabase return user_metadata correctly after login?
2. Is the admin bypass actually being triggered?
3. Is the API returning correct results when called?

## Debug Strategy

Check browser console for:
- `[ProtectedRoute: Admin bypass - access granted]` → Admin bypass worked
- `[ProtectedRoute: No payment access - redirecting to checkout]` → Admin bypass FAILED, API check failed
- `[AUTH DEBUG]` logs to see full flow

Check Network tab for:
- `/api/payments/status` call (should NOT happen for admins)
- Response: `{ hasActiveAccess: true, hasManualAccess: true }`
