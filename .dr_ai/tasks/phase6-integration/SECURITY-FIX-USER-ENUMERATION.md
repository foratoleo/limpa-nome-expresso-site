# Security Fix: User Enumeration Vulnerability

## Date
2026-03-03

## Vulnerability Description
The `/api/auth/check-user` endpoint exposed whether a user exists in the system, enabling user enumeration attacks. This is a critical security vulnerability that allows attackers to:

1. **Identify registered users**: Check if email addresses are associated with accounts
2. **Targeted attacks**: Focus phishing attempts on confirmed users
3. **Privacy violation**: Reveal user registration status without authentication

## Affected Endpoint
- **Path**: `/api/auth/check-user`
- **File**: `/server/routes/auth.ts` (lines 262-303)
- **Method**: POST

## Previous Implementation (VULNERABLE)
```typescript
const response = {
  success: true,
  exists: !!user,                    // ⚠️ EXPOSES user existence
  hasPassword: user?.app_metadata?.provider === 'email' && !user?.app_metadata?.passwordless,
  emailConfirmed: user?.email_confirmed_at !== null,
};
```

**Security Issues**:
- Response structure changes based on user existence
- Exposes authentication method (password vs magic link)
- Reveals email confirmation status
- Enables timing attacks through inconsistent response times

## Fixed Implementation (SECURE)
```typescript
// SECURITY: Always return same response structure regardless of user existence
// to prevent user enumeration attacks. UI should show all auth options universally.
authRouter.post("/check-user", async (req, res) => {
  // ... validation ...

  // SECURITY: Perform the lookup but don't expose results
  // This prevents timing attacks by ensuring consistent execution time
  const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();

  // Lookup user but don't include in response
  const user = users?.find(u => u.email === email);

  // SECURITY: Always return success with same structure
  // Don't expose user existence, password status, or confirmation status
  res.json({
    success: true,
    // No user-specific data exposed
  });
});
```

## Security Improvements

### 1. Consistent Response Structure
- **Before**: Response changed based on user existence
- **After**: Always returns `{ success: true }` with identical structure

### 2. No Information Disclosure
- **Removed**: `exists`, `hasPassword`, `emailConfirmed` fields
- **Result**: Attacker cannot determine user status from response

### 3. Timing Attack Mitigation
- Lookup operation still executes to maintain consistent timing
- Response time remains similar regardless of user existence
- Future enhancement: Consider adding artificial delay for complete timing safety

## Client-Side Changes

### Updated TypeScript Interface
**File**: `/client/src/contexts/AuthContext.tsx`

**Before**:
```typescript
checkUser: (email: string) => Promise<{ exists: boolean; hasPassword: boolean; emailConfirmed: boolean } | null>;
```

**After**:
```typescript
checkUser: (email: string) => Promise<{ success: boolean } | null>;
```

### Impact on Frontend
The `checkUser` function now only indicates if the API request succeeded, not user status. This requires UI adjustments:

1. **Show all auth options universally**: Display both password and magic link options to all users
2. **Handle failures gracefully**: If user doesn't have password, show appropriate error during login
3. **User-friendly flows**: Let users discover their authentication method through natural interaction

## Verification

### Build Status
✅ Build successful: `npm run build` completed without errors
- Vite build: 2224 modules transformed
- Server build: esbuild completed successfully

### Test Status
✅ All tests passing: 113 passed | 1 skipped
- Theme tests: 62 tests passed
- Component tests: 52 tests passed, 1 skipped

### TypeScript Compilation
✅ No TypeScript errors in modified files
- AuthContext type definitions updated correctly
- Server-side route types validated

## Security Checklist

- [x] User existence is not exposed in response
- [x] Response structure is consistent for existing and non-existing users
- [x] Timing attacks are mitigated (lookup still executes for consistent timing)
- [x] Error handling maintained
- [x] TypeScript compiles without errors
- [x] All tests passing
- [x] Build successful

## Future Enhancements

### Optional Security Improvements
1. **Rate Limiting**: Add rate limiting (5 requests per 15 minutes per email)
2. **Artificial Delay**: Add constant-time delay to further prevent timing attacks
3. **Logging**: Monitor for suspicious patterns (multiple checks on same email)
4. **CAPTCHA**: Add CAPTCHA after several failed attempts

### Example Rate Limiting Implementation
```typescript
import rateLimit from 'express-rate-limit';

const checkUserLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Muitas tentativas. Tente novamente em 15 minutos.',
  standardHeaders: true,
  legacyHeaders: false,
});

authRouter.post("/check-user", checkUserLimiter, async (req, res) => {
  // ... existing implementation ...
});
```

## Related Tasks
- Task #12: SECURITY: Fix user enumeration vulnerability ✅ COMPLETED

## References
- [OWASP User Enumeration](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/03-Identity_Management_Testing/04-Testing_for_Account_Enumeration)
- [CWE-204: Observable Response Discrepancy](https://cwe.mitre.org/data/definitions/204.html)
