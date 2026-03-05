# Auth Flow Debugging Guide

## Overview

A comprehensive authentication debugging system has been integrated into the application to track every step of the auth flow. This creates an audit trail in sessionStorage that can be viewed even in production.

## Debug Utility Location

`client/src/lib/debugAuth.ts`

## Integrated Components

The debug utility tracks authentication flow in these key components:

1. **AuthContext** (`client/src/contexts/AuthContext.tsx`)
   - Initial session retrieval
   - Auth state changes
   - Sign in attempts (with results)
   - Sign out events

2. **ProtectedRoute** (`client/src/components/auth/ProtectedRoute.tsx`)
   - Every access check
   - Loading states
   - Redirect decisions
   - Admin bypass events

3. **useAccessStatus** (`client/src/hooks/useAccessStatus.ts`)
   - API fetch attempts
   - Query state changes
   - Loading, error, and success states
   - Access status updates

4. **PaymentContext** (`client/src/contexts/PaymentContext.tsx`)
   - Context value updates
   - Error events
   - Payment access changes

## How to Use

### In Browser Console

#### View all logs:
```javascript
console.log(JSON.parse(sessionStorage.getItem('authDebugLogs')))
```

#### Export logs to clipboard:
```javascript
copy(JSON.parse(sessionStorage.getItem('authDebugLogs')))
```

#### Use helper functions (development only):
```javascript
// Get logs as array
authDebugLogs.get()

// Pretty print logs as table
authDebugLogs.print()

// Export logs as JSON string
authDebugLogs.export()

// Clear all logs
authDebugLogs.clear()
```

## Log Structure

Each log entry contains:

```typescript
{
  timestamp: string,    // ISO timestamp
  step: string,         // Description of the auth step
  data: any            // Relevant data for that step
}
```

## Common Debugging Scenarios

### 1. User Cannot Access Protected Route

**What to check:**
- Look for "ProtectedRoute: Check" logs
- Verify user and session data
- Check if payment access is granted
- Look for redirect decisions

**Expected flow:**
```
AuthContext: Initial session retrieved → user present
useAccessStatus: Fetching access status → success
PaymentContext: Context value updated → hasActiveAccess: true
ProtectedRoute: Check → all checks pass
ProtectedRoute: Access granted
```

### 2. Login Issues

**What to check:**
- "AuthContext: signIn called" - attempt started
- "AuthContext: signIn completed" - attempt result
- "AuthContext: Auth state changed" - session established
- "useAccessStatus: Query state changed" - access status loaded

**Red flags:**
- signIn hasError: true
- Auth state changed but no user
- Access status query fails

### 3. Payment Access Not Working

**What to check:**
- "useAccessStatus: Fetching access status"
- API response status
- hasActiveAccess value
- Error messages in the response

**Red flags:**
- Fetch failed (401, 403, 500)
- hasActiveAccess: false when user should have access
- Query retry attempts

## Production Debugging

The debug utility works in production by storing logs in sessionStorage. To debug production issues:

1. Reproduce the issue in production
2. Open browser DevTools Console
3. Run: `copy(JSON.parse(sessionStorage.getItem('authDebugLogs')))`
4. Paste the logs into a text editor or issue tracker
5. Analyze the flow to identify where it diverges from expected behavior

## Storage Limits

- Maximum logs stored: 200 entries
- When limit is reached, oldest logs are automatically removed
- This prevents sessionStorage overflow
- Logs persist across page refreshes but are cleared when:
  - User closes the browser tab
  - Manually cleared via `authDebugLogs.clear()`
  - SessionStorage is cleared by browser

## Development vs Production

**Development:**
- Logs are output to console in real-time
- Helper functions available globally
- Full object inspection available

**Production:**
- Logs stored in sessionStorage only
- No console output (to avoid clutter)
- Retrieve logs manually when needed
- Helper functions not exposed globally

## Example Debug Session

```javascript
// 1. Clear old logs before testing
authDebugLogs.clear()

// 2. Reproduce the issue (e.g., try to login)

// 3. View the logs
authDebugLogs.print()

// 4. Export for analysis
const logs = authDebugLogs.export()

// 5. Filter specific steps
JSON.parse(logs).filter(l => l.step.includes('signIn'))
```

## Troubleshooting

### Logs not appearing
- Check browser supports sessionStorage
- Verify no browser extensions are blocking storage
- Check if private/incognito mode is limiting storage

### Logs disappearing unexpectedly
- sessionStorage is cleared when tab is closed
- Some browsers clear sessionStorage in certain modes
- Check if any code is calling `clearAuthDebugLogs()`

### Too many logs
- Use `authDebugLogs.clear()` before starting a new test
- The system automatically keeps only the most recent 200 logs
- Consider filtering logs by specific steps when analyzing

## Best Practices

1. **Clear logs before each test** to get clean data
2. **Use `print()` for quick overview** of the flow
3. **Export logs when reporting bugs** for complete context
4. **Look for error fields** in log data
5. **Check timestamps** to understand timing issues
6. **Compare working vs broken flows** to identify divergence
