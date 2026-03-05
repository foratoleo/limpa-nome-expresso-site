# Implementation Plan: User Welcome Dashboard

**Status:** Planning Complete ✓
**Date:** 2026-03-05
**Route:** `/bem-vindo` (changed from `/dashboard` to preserve existing Dashboard)

---

## Executive Summary

Create a new welcome page at route `/bem-vindo` that serves as the landing page for authenticated users with access. This approach preserves the existing complex Dashboard at `/dashboard` while adding the simple welcome interface specified.

**Key Decision:** NEW route `/bem-vindo` instead of replacing existing `/dashboard`

---

## Task Breakdown

### Task 1: Create WelcomeHome Component
**Effort:** Low | **Priority:** 1 | **Agent:** executor (sonnet)

**File:** NEW `/client/src/pages/WelcomeHome.tsx`

**Requirements:**
- Personalized welcome message with user's name
- Success icon/checkmark visual
- Primary CTA button: "Acessar Guia" → navigates to `/guia`
- Uses `Container` component for layout
- Navy/gold color scheme matching existing design
- NO auto-redirect (manual navigation only)
- Fully responsive (mobile/tablet/desktop)

**Component Structure:**
```tsx
export default function WelcomeHome() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const userName = user?.user_metadata?.full_name
    || user?.email?.split('@')[0]
    || 'Usuário';

  return (
    <Container>
      {/* Success icon */}
      {/* Welcome message with userName */}
      {/* CTA button to /guia */}
    </Container>
  );
}
```

**Acceptance Criteria:**
- [ ] Component renders without errors
- [ ] User's name displays correctly
- [ ] Falls back to email if name missing
- [ ] Falls back to "Usuário" if both missing
- [ ] CTA button navigates to `/guia` on click
- [ ] Layout is responsive on all screen sizes

---

### Task 2: Add /bem-vindo Route
**Effort:** Low | **Priority:** 2 | **Agent:** executor (sonnet)

**File:** MODIFY `/client/src/App.tsx`

**Changes:**
- Add new route definition for `/bem-vindo`
- Wrap with `ProtectedRoute requirePayment={true}`
- Place before existing `/dashboard` route (for route matching order)

**Code Addition:**
```tsx
// Add before /dashboard route
<Route path={"/bem-vindo"}>
  <ProtectedRoute requirePayment={true}>
    <WelcomeHome />
  </ProtectedRoute>
</Route>
```

**Import Addition:**
```tsx
import WelcomeHome from '@/pages/WelcomeHome';
```

**Acceptance Criteria:**
- [ ] Route `/bem-vindo` is accessible
- [ ] ProtectedRoute with `requirePayment={true}` wraps component
- [ ] Unpaid users redirected to `/checkout`
- [ ] Unauthenticated users redirected to `/`

---

### Task 3.1: Update AuthCallback Redirect
**Effort:** Low | **Priority:** 3 | **Agent:** executor (sonnet)

**File:** MODIFY `/client/src/pages/AuthCallback.tsx`

**Change:** Line 36 - Update redirect target from `/welcome` to `/bem-vindo`

**Before:**
```tsx
setLocation("/welcome");
```

**After:**
```tsx
setLocation("/bem-vindo");
```

**Acceptance Criteria:**
- [ ] Magic link users land on `/bem-vindo` after authentication
- [ ] No redirect loop occurs
- [ ] Existing `/welcome` route still accessible (if needed)

---

### Task 3.2: Update Landing Redirect Logic
**Effort:** Low | **Priority:** 4 | **Agent:** executor (sonnet)

**File:** MODIFY `/client/src/pages/Landing.tsx`

**Change:** Lines 28-37 - Update redirect to `/bem-vindo` instead of `/guia`

**Current Logic (lines 28-37):**
```tsx
useEffect(() => {
  if (user && hasAccess && !loading && !paymentLoading) {
    setLocation('/guia');
  }
}, [user, hasAccess, loading, paymentLoading, setLocation]);
```

**Updated Logic:**
```tsx
useEffect(() => {
  if (user && hasAccess && !loading && !paymentLoading) {
    setLocation('/bem-vindo');
  }
}, [user, hasAccess, loading, paymentLoading, setLocation]);
```

**Acceptance Criteria:**
- [ ] Password login users land on `/bem-vindo` after authentication
- [ ] No redirect loop occurs
- [ ] Loading states respected (no premature redirect)

---

### Task 4: (Optional) Add Dashboard Link
**Effort:** Low | **Priority:** 5 | **Agent:** executor-low (haiku)

**File:** MODIFY `/client/src/pages/WelcomeHome.tsx`

**Add:** Secondary link or button to access `/dashboard`

**Rationale:** Advanced users may want direct access to the complex Dashboard with documents, notes, tasks, processes.

**Implementation:**
```tsx
<Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-300">
  Ir para Dashboard Avançado
</Link>
```

**Acceptance Criteria:**
- [ ] Link navigates to `/dashboard`
- [ ] Visual hierarchy shows CTA to `/guia` is primary
- [ ] Link is subtle/secondary (doesn't compete with main CTA)

---

## Implementation Order

**Phase 1: Core Functionality**
1. Task 1 - Create WelcomeHome component
2. Task 2 - Add route configuration

**Phase 2: Integration**
3. Task 3.1 - Update AuthCallback redirect
4. Task 3.2 - Update Landing redirect

**Phase 3: Enhancement (Optional)**
5. Task 4 - Add Dashboard link

---

## File Structure Summary

```
client/src/
├── pages/
│   ├── WelcomeHome.tsx          [NEW - Task 1]
│   ├── AuthCallback.tsx         [MODIFY - Task 3.1, line 36]
│   └── Landing.tsx              [MODIFY - Task 3.2, lines 28-37]
├── App.tsx                       [MODIFY - Task 2, add route]
└── ...
```

---

## Testing Strategy

### Manual Testing Checklist

**Test 1: Access Control - Unauthenticated User**
- [ ] Logout
- [ ] Navigate to `/bem-vindo`
- [ ] Expected: Redirect to `/` (landing page)

**Test 2: Access Control - User Without Payment**
- [ ] Login as unpaid user
- [ ] Navigate to `/bem-vindo`
- [ ] Expected: Redirect to `/checkout`

**Test 3: Magic Link Login Flow**
- [ ] Initiate magic link login
- [ ] Complete authentication via email
- [ ] Expected: Land on `/bem-vindo` (AuthCallback redirect)

**Test 4: Password Login Flow**
- [ ] Login with email/password
- [ ] Close auth modal
- [ ] Expected: Land on `/bem-vindo` (Landing redirect)

**Test 5: Welcome Page Display**
- [ ] Access `/bem-vindo` as authenticated user with access
- [ ] Verify: Welcome message displays
- [ ] Verify: User's name shows correctly
- [ ] Verify: CTA button "Acessar Guia" is visible
- [ ] Verify: No auto-redirect occurs

**Test 6: CTA Navigation**
- [ ] On welcome page, click "Acessar Guia" button
- [ ] Expected: Navigate to `/guia`

**Test 7: Responsive Design**
- [ ] View welcome page on mobile (< 640px)
- [ ] View welcome page on tablet (640px - 1024px)
- [ ] View welcome page on desktop (> 1024px)
- [ ] Expected: Layout adapts correctly, no horizontal scroll

**Test 8: User Name Fallbacks**
- [ ] Test with user having `full_name` metadata
- [ ] Test with user missing `full_name` but having email
- [ ] Test with user missing both
- [ ] Expected: Appropriate fallback for each case

**Test 9: Admin Access**
- [ ] Login as admin user
- [ ] Navigate to `/bem-vindo`
- [ ] Expected: Page loads (admin bypass in ProtectedRoute)

**Test 10: Existing Dashboard Still Works**
- [ ] Login as user with access
- [ ] Navigate to `/dashboard`
- [ ] Expected: Complex Dashboard with tabs still loads

---

## Design Specifications

### Color Palette
```tsx
const COLORS = {
  background: '#12110d',     // Dark background
  navy: '#162847',           // Primary navy
  gold: '#d39e17',           // Primary gold (CTA buttons)
  goldLight: '#e5b020',      // Light gold (hover states)
  textPrimary: '#f1f5f9',    // Primary text
  textSecondary: '#94a3b8',  // Secondary text
};
```

### Typography
- **Heading:** Bold, 2xl size, white color
- **Body:** Regular, base size, light gray color
- **CTA Button:** Semibold, base size, gold background

### Layout
- **Container:** Centered with max-width
- **Spacing:** Vertical rhythm with Tailwind utilities (gap-6, gap-8)
- **Alignment:** Center-aligned content

### Components to Use
- `Container` from `@/components/ui/container`
- `CheckCircle` icon from `lucide-react`
- `ArrowRight` icon from `lucide-react` (CTA button)

---

## Edge Cases & Error Handling

### Case 1: Missing User Metadata
**Scenario:** User exists but `user_metadata` is null
**Handling:** Fallback to email username, then to "Usuário"

### Case 2: Session Expiration
**Scenario:** User's session expires while viewing welcome page
**Handling:** ProtectedRoute redirects to `/` automatically

### Case 3: Payment API Failure
**Scenario:** `/api/payments/status` returns error
**Handling:** ProtectedRoute shows loading state, doesn't render content

### Case 4: Direct URL Access
**Scenario:** User types `/bem-vindo` directly in browser
**Handling:** ProtectedRoute verifies auth + payment, redirects appropriately

### Case 5: Rapid Navigation
**Scenario:** User clicks CTA button multiple times rapidly
**Handling:** Wouter handles navigation, no issues expected

---

## Success Metrics

- [ ] Welcome page loads in < 2 seconds
- [ ] CTA button responds in < 100ms
- [ ] No console errors on page load
- [ ] No console errors on button click
- [ ] All authentication flows redirect correctly
- [ ] Responsive layout works on all devices
- [ ] Existing Dashboard functionality preserved

---

## Rollback Plan

If issues occur:
1. **Revert App.tsx:** Remove `/bem-vindo` route
2. **Revert AuthCallback.tsx:** Change back to `/welcome`
3. **Revert Landing.tsx:** Change back to `/guia`
4. **Delete WelcomeHome.tsx:** Remove new component

All changes are additive or simple string replacements, making rollback straightforward.

---

## Post-Implementation Notes

### Route Summary After Implementation
- `/` - Landing page (public)
- `/bem-vindo` - NEW welcome page for authenticated users with access
- `/welcome` - Existing intermediate page (can be deprecated if unused)
- `/dashboard` - Existing complex client area (unchanged)
- `/guia` - Main content/guide (unchanged)
- `/checkout` - Payment page (unchanged)

### Navigation Flow Summary
**Magic Link Flow:**
```
User clicks login link
→ AuthCallback
→ /bem-vindo (NEW welcome page)
→ User clicks "Acessar Guia"
→ /guia (main content)
```

**Password Login Flow:**
```
User enters credentials in modal
→ AuthModal closes
→ Landing useEffect
→ /bem-vindo (NEW welcome page)
→ User clicks "Acessar Guia"
→ /guia (main content)
```

**Advanced User Flow:**
```
User logs in
→ /bem-vindo (welcome page)
→ User clicks "Ir para Dashboard" (optional link)
→ /dashboard (complex client area)
```

---

**Planning Phase: COMPLETE ✓**
