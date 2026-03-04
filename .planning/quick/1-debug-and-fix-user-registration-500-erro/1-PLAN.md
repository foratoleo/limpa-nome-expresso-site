---
phase: quick
plan: 1
type: execute
wave: 1
depends_on: []
files_modified:
  - server/routes/auth.ts
  - server/lib/emailit.ts
  - .env.example
  - server/tests/registration.test.ts
autonomous: true
requirements:
  - DEBUG-001: Debug and fix user registration 500 error
  - DEBUG-002: Ensure email verification flow works with Supabase
  - DEBUG-003: Validate email template integration

must_haves:
  truths:
    - "User registration completes without 500 errors"
    - "Confirmation email is sent via EmailIt or fallback works"
    - "Supabase user is created with email_confirm: false"
    - "Error messages are clear and actionable for users"
  artifacts:
    - path: "server/routes/auth.ts"
      provides: "Registration endpoint with proper error handling"
      exports: ["POST /api/auth/register"]
    - path: "server/tests/registration.test.ts"
      provides: "Registration flow tests"
      contains: "test suite for registration endpoint"
    - path: ".env.example"
      provides: "Environment variable documentation"
      contains: "EMAILIT_API_KEY, EMAILIT_DEFAULT_FROM"
  key_links:
    - from: "server/routes/auth.ts"
      to: "@supabase/supabase-js"
      via: "supabaseAdmin.auth.admin.createUser"
      pattern: "createClient.*supabaseServiceKey"
    - from: "server/routes/auth.ts"
      to: "server/services/email.service.ts"
      via: "emailService.sendCustomEmail"
      pattern: "emailService\.sendCustomEmail"
---

<objective>
Debug and fix user registration 500 error by validating the complete registration flow including Supabase integration, email service configuration, and error handling.

Purpose: The user registration endpoint is returning 500 errors, preventing new users from creating accounts. This plan diagnoses the root cause and implements fixes while ensuring the email verification flow works correctly.

Output: Working registration endpoint with proper error handling, email verification via Supabase + EmailIt, and comprehensive test coverage.
</objective>

<execution_context>
@/Users/forato-dr/.claude/get-shit-done/workflows/execute-plan.md
@/Users/forato-dr/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@server/routes/auth.ts
@server/services/email.service.ts
@server/lib/emailit.ts
@server/middleware/validation.ts
@client/src/contexts/AuthContext.tsx
@client/src/components/auth/RegisterForm.tsx
@client/public/email-templates/confirm-signup.html
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Add comprehensive logging and error detection to registration endpoint</name>
  <files>server/routes/auth.ts</files>
  <behavior>
    - Test 1: Registration with missing Supabase env vars returns 503 with clear message
    - Test 2: Registration with invalid email format returns 400 before Supabase call
    - Test 3: Registration with duplicate email returns 409
    - Test 4: Successful registration creates user in Supabase with email_confirm: false
    - Test 5: Registration fails gracefully when EmailIt is not configured (logs warning, continues)
  </behavior>
  <action>
    1. Add structured logging at each stage of registration flow:
       - Request received (with masked email)
       - Supabase user creation attempt
       - User created successfully (log userId)
       - Link generation attempt
       - Email template loading
       - Email sending attempt/result
       - Registration complete

    2. Verify error handling catches all Supabase error scenarios:
       - Missing environment variables (VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
       - Invalid email format (caught by validation middleware)
       - Duplicate user (email already registered)
       - Weak password (caught by validation middleware)
       - Network timeouts

    3. Ensure EmailIt failures don't block registration:
       - Log warning when EMAILIT_API_KEY is missing
       - Catch email service errors and continue
       - Return success even if email fails (user created in Supabase)

    4. Update error responses to include actionable error codes:
       - AUTH_SERVICE_UNAVAILABLE (503)
       - VALIDATION_FAILED (400)
       - USER_EXISTS (409)
       - LINK_GENERATION_FAILED (500)
       - INTERNAL_ERROR (500)

    The registration endpoint already has good error handling. Verify all paths work correctly and add any missing logging.
  </action>
  <verify>
    <automated>cd server && npm test -- registration.test.ts</automated>
  </verify>
  <done>Registration endpoint handles all error cases with appropriate status codes and logging</done>
</task>

<task type="auto">
  <name>Task 2: Create registration test suite with edge cases</name>
  <files>server/tests/registration.test.ts</files>
  <action>
    Create comprehensive test suite for registration endpoint using vitest and supabase-js:

    1. Test file structure:
       - Use supabase test client from conftest.ts
       - Mock EmailIt service to avoid external dependencies
       - Clean up test users after each test

    2. Test cases to implement:
       - "should register new user successfully"
       - "should return 400 for invalid email format"
       - "should return 400 for weak password"
       - "should return 409 for duplicate email"
       - "should return 503 when Supabase not configured"
       - "should create user with email_confirm: false"
       - "should generate confirmation link"
       - "should send email via EmailIt when configured"
       - "should succeed when EmailIt fails (graceful degradation)"
       - "should log structured JSON for all operations"

    3. Mock setup:
       - Mock emailService.sendCustomEmail to return success
       - Test both with and without EMAILIT_API_KEY
       - Verify console.log output for structured logging

    4. Use test database:
       - Create test user with random email (+test@example.com)
       - Delete test user after each test
       - Verify user exists in auth.users table

    Run tests with: `cd server && npm test -- registration.test.ts`
  </action>
  <verify>
    <automated>cd server && npm test -- registration.test.ts --run</automated>
  </verify>
  <done>Test suite covers all registration scenarios with 10+ test cases passing</done>
</task>

<task type="auto">
  <name>Task 3: Document environment variables and create troubleshooting guide</name>
  <files>.env.example</files>
  <action>
    1. Update .env.example with all required variables for registration:
       ```
       # Supabase Configuration (Required for registration)
       VITE_SUPABASE_URL=https://your-project.supabase.co
       SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

       # EmailIt Configuration (Optional - registration works without it)
       EMAILIT_API_KEY=your-emailit-api-key
       EMAILIT_DEFAULT_FROM=noreply@yourdomain.com

       # Server Configuration
       PORT=3001
       NODE_ENV=development
       ```

    2. Add inline comments for each variable explaining purpose and where to find it

    3. Create troubleshooting section in .env.example:
       - "Registration returns 503: Check VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set"
       - "Email not sent: Check EMAILIT_API_KEY (optional - registration still works)"
       - "CORS errors: Add your domain to allowedOrigins in server/index.ts"
       - "User already exists: Use Supabase dashboard to check auth.users table"

    4. Verify server starts without errors when all env vars are present

    This documentation helps developers debug registration issues quickly.
  </action>
  <verify>
    <automated>grep -q "VITE_SUPABASE_URL" .env.example && grep -q "EMAILIT_API_KEY" .env.example && grep -q "troubleshooting" .env.example</automated>
  </verify>
  <done>.env.example documents all required environment variables with troubleshooting guide</done>
</task>

</tasks>

<verification>
1. Start server and verify it listens on port 3001
2. Test registration with valid email/password using curl or Postman
3. Verify user appears in Supabase auth.users table
4. Verify confirmation email is received (if EmailIt configured)
5. Run test suite: `cd server && npm test -- registration.test.ts`
6. Check all error scenarios return correct HTTP status codes
</verification>

<success_criteria>
- Registration endpoint completes without 500 errors for valid input
- Test suite passes with 10+ test cases covering all scenarios
- Environment variables documented in .env.example
- Structured logging enables easy debugging of registration issues
- Email verification flow works end-to-end (Supabase + EmailIt)
</success_criteria>

<output>
After completion, create `.planning/quick/1-debug-and-fix-user-registration-500-erro/1-SUMMARY.md`
</output>
