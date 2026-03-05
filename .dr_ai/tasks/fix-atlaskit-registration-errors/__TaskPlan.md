Task Name: fix-atlaskit-registration-errors
Date: 03/03/2026 21:36:06
Git Branch: fix/fix-atlaskit-registration-errors

## Task Objectives

This task addresses three critical errors affecting application stability and user experience: (1) a PaymentContext infinite loop causing "Maximum update depth exceeded" errors and performance degradation, (2) Atlaskit AppProvider feature gate warnings during initialization, and (3) registration form error handling that returns 500 errors even for valid validation failures. The PaymentContext loop is particularly severe as it causes continuous re-renders and blocks normal application functionality. The Atlaskit error, while not breaking functionality, pollutes console logs and indicates potential library initialization issues. The registration error handling needs improvement to provide better user feedback for invalid email formats. Fixing these issues will restore application stability, improve user experience during registration, and ensure clean console logs for debugging.

## Implementation Summary

The implementation will address three distinct issues using different architectural approaches. For the PaymentContext infinite loop, the fix requires restructuring the useEffect dependencies to prevent fetchStatus from being called on every render. The current implementation has fetchStatus in the useEffect dependency array while fetchStatus itself depends on user and session, creating a circular dependency. The solution will use useRef to track user/session changes separately or move the auth state listener outside the useEffect to break the dependency cycle.

For the Atlaskit feature gate error, the issue stems from @atlaskit/app-provider's internal feature gate checking system that expects certain initialization states. The error message indicates `platform_dst_subtree_theming` gate check is failing because a client is not properly initialized. The solution will involve either: (1) ensuring the AppProvider is correctly initialized with required props, (2) adding error boundaries to suppress non-critical warnings, or (3) updating to a newer version of @atlaskit/app-provider if this is a known bug.

For registration error handling, the current implementation correctly handles Supabase validation errors (status 400 for invalid email), but the frontend may be masking these errors. The implementation will add client-side email validation before making API calls, improve error message parsing to distinguish between different error types, and add better visual feedback for validation errors. The server-side auth.ts already handles validation_failed errors appropriately (line 57-62), so focus will be on frontend validation and error display.

The tech stack includes React 19.2.1 with TypeScript 5.6.3, Supabase auth-js 2.98.0, and @atlaskit/app-provider 4.1.0. State management uses React Context and hooks. The application uses Vite 7.1.7 for development tooling.

## UX/UI Details

For the registration form improvements, the user flow will be enhanced with real-time email validation feedback. When a user enters an invalid email format, they will see immediate inline validation before submitting the form. The email input field will show visual states: default (neutral border), invalid (red border with error message), and valid (green border). Error messages will be specific: "Insira um endereco de email valido" for invalid format, "Este email ja esta cadastrado" for duplicate emails, and "A senha deve ter pelo menos 6 caracteres" for password validation.

Loading states will display "Criando conta..." on the submit button with disabled state during API calls. Success state shows confirmation message with the email address and instructions to check inbox. Error states display specific error messages below the submit button with red text color (#ef4444). The form maintains all existing styling including gold primary color (#d39e17), navy background (#0F1E3C), and cream text (#e8e4d8).

For the PaymentContext fix, there are no direct UI changes, but users will experience significantly improved performance with no more freezing or "Maximum update depth" errors. The payment status loading state will properly resolve instead of getting stuck in a loading loop.

For Atlaskit provider errors, the fix is internal with no visible UI changes. The console warnings will be eliminated, providing cleaner debugging output for developers.

Responsive behavior remains consistent across all device sizes with mobile-first approach. Accessibility considerations include proper ARIA labels for error states, keyboard navigation support, and screen reader announcements for validation errors.

## Tasks

### Task 1: Fix PaymentContext Infinite Loop

**Recommended Agent**: react-hooks-specialist

**Files to create/change**:
- hook: client/src/contexts/PaymentContext.tsx

**Implementation**: The PaymentContext has a critical infinite loop caused by circular dependencies. The fetchStatus function (line 31-157) depends on `user` and `session` (line 157), and is then used in the useEffect dependency array (line 181). This causes the effect to re-run whenever fetchStatus changes, but fetchStatus is recreated on every render due to its dependencies changing, creating an endless cycle.

The fix requires restructuring the context to break this dependency cycle:

1. Move the auth state listener subscription outside the fetchStatus dependency
2. Use useRef to store the latest user/session values without triggering re-renders
3. Separate the initial fetch from the auth state change handler
4. Ensure fetchStatus is properly memoized with stable dependencies

The new implementation will use a ref-based approach where the auth state change handler accesses current user/session values via ref, preventing the function from being recreated when these values change. The useEffect will only depend on the stable subscription setup, not on user/session directly.

Error handling must be preserved - all existing error logging, abort controller logic, and fallback to direct Supabase queries must remain functional. The loading state transitions (true -> false) must work correctly without getting stuck.

**Subtasks**:
- **Subtask 1.1**: Refactor PaymentContext to break infinite loop by using useRef to track user/session changes separately from fetchStatus dependencies. Move the supabase.auth.onAuthStateChange subscription to a separate useEffect that doesn't depend on fetchStatus. Use a ref to store the latest user/session values and have the auth state change handler read from this ref instead of depending on user/session props. This eliminates the circular dependency where fetchStatus depends on user/session, and the effect depends on fetchStatus.
- **Subtask 1.2**: Test the refactored PaymentContext by monitoring console logs for "Request aborted" messages and verifying "Maximum update depth exceeded" error no longer occurs. Confirm that payment status loads correctly on initial page load and updates properly when auth state changes (login, logout, token refresh). Verify the loading state properly transitions to false and doesn't get stuck in a loading loop.
- **Subtask 1.3**: Add unit tests for PaymentContext to prevent regression of the infinite loop. Test scenarios: initial mount with authenticated user, initial mount with unauthenticated user, user login after mount, user logout, token refresh event, and rapid auth state changes. Verify useEffect cleanup properly aborts pending requests and unsubscribes from auth state changes.

**Coding Standards**:
- Follow React Context pattern from client/src/contexts/AuthContext.tsx
- Use useRef for storing mutable values that shouldn't trigger re-renders
- Use useCallback with stable dependencies for event handlers
- Cleanup all subscriptions in useEffect return functions
- Log all state changes in development mode with console.log
- Test infinite loop prevention by logging render/ effect cycles
- File: client/src/contexts/PaymentContext.tsx, maintain existing error handling and abort controller logic

### Task 2: Fix Atlaskit AppProvider Feature Gate Error

**Recommended Agent**: react-architect

**Files to create/change**:
- component: client/src/components/providers/AtlaskitProvider.tsx
- lib: client/src/lib/atlaskit-theme.ts

**Implementation**: The Atlaskit AppProvider is throwing a feature gate error: `{msg: 'An error has occurred checking the feature gate. Only the first occurrence of this error is logged.', gateName: 'platform_dst_subtree_theming', error: Error: Client must be initialized before using this method}`.

This error comes from @atlaskit/app-provider@4.1.0 internal feature flag system. The error occurs in AtlaskitProvider.tsx:228 where AppProvider is rendered with defaultColorMode prop.

Possible solutions:
1. **Add feature flag suppression**: Configure the AppProvider to skip feature gate checks or suppress the specific 'platform_dst_subtree_theming' gate
2. **Update initialization order**: Ensure any required Atlaskit clients are initialized before rendering AppProvider
3. **Version upgrade**: Check if @atlaskit/app-provider has a newer version that fixes this issue
4. **Error boundary enhancement**: The existing ThemeErrorBoundary should catch and log this error without breaking the app

Investigation needed:
- Check if Atlaskit requires a theme client to be initialized before AppProvider
- Verify if the error affects functionality or is just a warning
- Check @atlaskit/app-provider documentation for feature gate configuration
- Consider removing AppProvider if it's not actively used for Atlaskit components

The implementation should:
1. First verify if Atlaskit components are actually being used and require AppProvider
2. If not used, consider removing AppProvider wrapper
3. If used, try adding feature gate configuration props to AppProvider
4. Enhance error boundary to specifically handle and suppress this non-critical error
5. Add console filter in development to hide this specific warning if it's benign

**Subtasks**:
- **Subtask 2.1**: Investigate Atlaskit AppProvider usage across the codebase to determine if @atlaskit components are actively being used. Search for imports from @atlaskit packages (button, checkbox, etc.) and verify if any components actually require the AppProvider context. Use grep to find all @atlaskit imports and trace their usage to understand if the provider is necessary.
- **Subtask 2.2**: Check @atlaskit/app-provider documentation and changelog for known issues with 'platform_dst_subtree_theming' feature gate. Look for configuration options to disable feature gates or suppress specific warnings. Review package.json to see current version (4.1.0) and check if updates are available that might fix this issue.
- **Subtask 2.3**: Implement fix based on investigation findings. If Atlaskit components are not actively used, remove the AppProvider wrapper and keep only the custom LegalFinancialThemeContext. If Atlaskit is used, either: add feature gate suppression configuration, upgrade to a version that fixes the issue, or enhance ThemeErrorBoundary to specifically catch and silently handle this error. Verify the fix by checking console logs when the app loads.
- **Subtask 2.4**: Test theme functionality after any changes to ensure Legal Financial theme (navy/gold color palette) still applies correctly. Verify CSS custom properties are set on document root and theme switching (if enabled) works. Confirm no visual regressions in components that might depend on theme context.

**Coding Standards**:
- Follow existing provider pattern in client/src/components/providers/AtlaskitProvider.tsx
- Use React error boundaries to gracefully handle initialization failures
- Check package.json before upgrading dependencies (current: @atlaskit/app-provider@4.1.0)
- Log theme initialization errors with console.error for debugging
- Document any feature flag configurations or workarounds in code comments
- Test theme application in both light and dark modes
- Ensure backward compatibility if removing/changing provider structure

### Task 3: Improve Registration Error Handling

**Recommended Agent**: react-forms-specialist

**Files to create/change**:
- component: client/src/components/auth/RegisterForm.tsx
- component: client/src/contexts/AuthContext.tsx
- util: client/src/lib/validation/email.ts (new file)
- endpoint: POST /api/auth/register

**Implementation**: The registration error handling needs improvement to provide better user feedback. Currently, when a user enters an invalid email format, the server correctly returns a 400 error with "Unable to validate email address: invalid format", but the frontend may not be displaying this error clearly.

The server-side error handling in server/routes/auth.ts (lines 53-76) already correctly handles validation_failed errors (line 57-62) by checking for status 400 and returning a user-friendly message. However, the frontend can be improved with:

1. **Client-side validation**: Add real-time email format validation before the user submits, using regex or a validation library
2. **Better error parsing**: Improve the error message parsing in AuthContext.tsx to handle different error types
3. **Visual feedback**: Add inline validation states to the email input field
4. **Clear error messages**: Ensure all error cases (invalid email, duplicate email, weak password) have clear Portuguese messages

Implementation approach:
- Create a new validation utility at client/src/lib/validation/email.ts with email format validator
- Add onChange validation to RegisterForm email input that shows error in real-time
- Improve AuthContext signUp error handling to parse Supabase error codes and return specific error types
- Update RegisterForm to display validation errors inline below the input field
- Keep the 5xx error handling for actual server failures

Email validation regex should follow RFC 5322 simplified pattern or use a well-tested library approach. Don't overly restrict valid emails, but catch obvious format errors.

**Subtasks**:
- **Subtask 3.1**: Create email validation utility in client/src/lib/validation/email.ts with a validateEmail function that uses a practical regex pattern. The function should return { valid: boolean, message?: string }. Use a pattern like /^[^\s@]+@[^\s@]+\.[^\s@]+$/ which catches most invalid formats without being overly restrictive. Export this function for use in forms.
- **Subtask 3.2**: Add real-time validation to RegisterForm.tsx email input. Add an error state for the email field that updates on onChange. Show error message in red (#ef4444) below the input when validation fails. Change border color to red when invalid. Clear the error when user starts typing again. This provides immediate feedback before the user submits the form.
- **Subtask 3.3**: Improve error handling in AuthContext.tsx signUp function (lines 49-83). Parse the response error message to identify specific error types: invalid format (validation_failed), duplicate email (user_already_exists), weak password, and server errors. Return structured error with user-friendly Portuguese messages for each case. Add logging to track which errors are occurring.
- **Subtask 3.4**: Add zod or similar validation library for comprehensive form validation if not already present. Check package.json - zod@4.1.12 is installed. Create a registrationSchema using zod that validates email format, password length (min 6 characters), and password confirmation match. Use this schema in RegisterForm for consistent validation before submission.
- **Subtask 3.5**: Test all registration error scenarios: invalid email format (test@, test@test, no @ symbol), duplicate email (register same email twice), weak password (less than 6 characters), password mismatch, and server errors. Verify each scenario shows the correct error message in Portuguese. Test with valid email to ensure successful registration flow still works.

**Coding Standards**:
- Follow existing form pattern in client/src/components/auth/RegisterForm.tsx
- Use inline error display with red text color (#ef4444) for consistency
- Maintain Portuguese error messages: "Email invalido", "Este email ja esta cadastrado", etc.
- Use zod@4.1.12 (already in package.json) for schema validation
- Keep existing gold (#d39e17) and navy (#0F1E3C) color scheme
- Test validation with edge cases: international domains, + signs, dots in local part
- Don't break existing success flow - successful registration should work unchanged

### Task 4: Verify Server Restart and Error Logging

**Recommended Agent**: nodejs-specialist

**Files to create/change**:
- endpoint: POST /api/auth/register
- lib: server/routes/auth.ts

**Implementation**: Based on server.log analysis, the registration error "Unable to validate email address: invalid format" is correctly being caught and logged (lines 3-13 of server.log). The server is returning the appropriate 400 status code. However, we need to verify:

1. The server is running the latest code (may need restart after recent changes)
2. Error logging is comprehensive enough for debugging
3. All error paths are properly handled

The server routes/auth.ts already has good error handling (lines 53-76), but we should add more detailed logging to track exactly what's happening during registration attempts.

Add enhanced logging:
- Log incoming registration requests with email (masked for privacy)
- Log validation errors with full error details
- Log successful registrations
- Add request ID or timestamp for tracing

Also verify the server is running from the correct directory (dist/start.js or server/index.ts) and that changes to auth.ts are being picked up.

**Subtasks**:
- **Subtask 4.1**: Add enhanced logging to server/routes/auth.ts register endpoint. Log request start with timestamp, log validation errors with full error object including status and code, log successful user creation with user ID (not email), and log any errors during email sending. Use structured logging with JSON format for easier parsing. Add correlation IDs for tracking requests through the flow.
- **Subtask 4.2**: Verify the server is running the latest code. Check the process running (should be node dist/start.js or server/index.ts). Compare file modification times to ensure the running server has the latest auth.ts code. If needed, restart the server to load updated error handling code. Document the correct restart procedure in comments.
- **Subtask 4.3**: Add request validation middleware to catch malformed requests before they reach Supabase. Validate that email and password are present and properly formatted. Return 400 with clear error message before making Supabase API call. This reduces unnecessary API calls and provides faster feedback for obviously invalid requests.
- **Subtask 4.4**: Test the registration endpoint directly with curl or Postman to verify error responses are correctly formatted. Test with invalid email, valid email, duplicate email, and weak password scenarios. Verify response JSON structure includes success boolean and appropriate error message. Check HTTP status codes are correct (400 for client errors, 500 for server errors).

**Coding Standards**:
- Follow Express.js error handling patterns in server/routes/auth.ts
- Use structured logging with console.error for errors, console.log for info
- Mask sensitive data (emails) in logs, show only first 3 chars + *** + domain
- Return consistent JSON response format: { success: boolean, error?: string, user?: object }
- Set appropriate HTTP status codes: 400 for validation, 409 for conflicts, 500 for server errors
- Document error codes in JSDoc comments
- File: server/routes/auth.ts, maintain existing error handling structure
