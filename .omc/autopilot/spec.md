# Specification: User Dashboard (Welcome Page)

**Project:** Limpa Nome Expresso
**Date:** 2026-03-05
**Status:** Expansion Complete

---

## 1. Overview

Create a dashboard/welcome page that serves as the permanent home for authenticated users who have access to the system. Users without access should be redirected to `/checkout`.

**Key Decision:** This page coexists with `/welcome` (temporary redirect) and serves as a permanent user home.

---

## 2. Functional Requirements

### FR1: Route Definition
- Route: `/dashboard`
- Accessible only to authenticated users
- Requires payment access verification

### FR2: Content Display
- Personalized welcome message with user's name
- Call-to-action button to navigate to `/guia`
- Clean, modern layout matching existing design system

### FR3: Access Control
- **Authenticated users WITH access:** See dashboard
- **Authenticated users WITHOUT access:** Redirect to `/checkout`
- **Non-authenticated users:** Redirect to `/` (landing page)
- **Admin users:** Can access (bypass enabled)

### FR4: Loading States
- Show spinner during authentication verification
- Show spinner during payment status check
- Never render content without confirmed access

### FR5: Navigation
- Primary CTA button: "Acessar Guia" → navigates to `/guia`
- Manual navigation only (no auto-redirect)

---

## 3. Non-Functional Requirements

### NFR1: Performance
- Initial render: < 2 seconds
- Interaction response: < 100ms (button click)

### NFR2: UX
- Responsive design (mobile, tablet, desktop)
- Accessible (WCAG AA compliance)
- Portuguese language (PT-BR)

### NFR3: Security
- Uses existing `ProtectedRoute` component
- Leverages Supabase authentication
- Server-side payment verification via `/api/payments/status`

### NFR4: Maintainability
- Reuses existing components (`Container`, styling)
- Follows established patterns in codebase
- TypeScript strict mode

---

## 4. Technical Architecture

### 4.1 Tech Stack
- **Frontend:** React 18 with TypeScript
- **Routing:** Wouter (existing)
- **State:** Context API (AuthContext, PaymentContext)
- **Styling:** Tailwind CSS + existing design system
- **Auth:** Supabase Auth (existing)
- **Icons:** Lucide React

### 4.2 Component Structure

```
Dashboard.tsx (NEW)
├── Container (existing)
├── Welcome header
│   ├── Icon (checkmark/success)
│   ├── Title (personalized)
│   └── Subtitle
└── CTA Button
    └── Navigate to /guia
```

### 4.3 Data Flow

```
User navigates to /dashboard
    ↓
ProtectedRoute checks authentication
    ↓
useAccessStatus fetches payment status
    ↓
[if hasAccess] → Render Dashboard
[if !hasAccess] → Redirect to /checkout
[if !user] → Redirect to /
```

### 4.4 File Structure

```
client/src/
├── pages/
│   └── Dashboard.tsx          [NEW - Main component]
├── components/
│   └── auth/
│       └── ProtectedRoute.tsx  [EXISTING - No changes needed]
├── contexts/
│   ├── AuthContext.tsx        [EXISTING - Used for user data]
│   └── PaymentContext.tsx     [EXISTING - Used for access status]
├── hooks/
│   └── useAccessStatus.ts     [EXISTING - Payment verification]
└── App.tsx                     [MODIFY - Add /dashboard route]
```

---

## 5. Dependencies

### 5.1 Existing Components
- `ProtectedRoute` from `@/components/auth/ProtectedRoute`
- `Container` from `@/components/ui/container` (if exists)

### 5.2 Existing Hooks
- `useAuth()` from `@/contexts/AuthContext`
- `useAccessStatus()` from `@/hooks/useAccessStatus`

### 5.3 New Dependencies
- None required (uses existing)

---

## 6. API Interfaces

### 6.1 Existing APIs Used
- `GET /api/payments/status` - Verify user access
- Supabase Auth - User session

### 6.2 No New APIs Required

---

## 7. Design Specifications

### 7.1 Color Palette (Existing)
- Primary Navy: `#162847` (backgrounds)
- Primary Gold: `#d39e17` (accents, buttons)
- Text Light: `#94a3b8` (subtitles)
- Text White: `#ffffff` (headings)

### 7.2 Typography
- Heading: Bold, large size
- Body: Regular, medium size
- CTA Button: Semibold, clearly visible

### 7.3 Layout
- Centered content with `Container`
- Vertical spacing using Tailwind utilities
- Responsive breakpoints (sm, md, lg)

---

## 8. User Flow

### 8.1 Happy Path: User with Access
```
1. User logs in successfully
2. Redirected to /welcome (auto-redirect to /guia)
3. User can manually navigate to /dashboard
4. Dashboard displays personalized welcome
5. User clicks "Acessar Guia" button
6. Navigated to /guia (main content)
```

### 8.2 Alternative Path: User without Payment
```
1. User logs in successfully
2. Attempts to access /dashboard
3. ProtectedRoute detects no payment access
4. Redirected to /checkout
```

### 8.3 Edge Case: Direct URL Access
```
1. User types /dashboard in browser
2. If authenticated + hasAccess → Show dashboard
3. If authenticated + !hasAccess → Redirect to /checkout
4. If !authenticated → Redirect to /
```

---

## 9. Acceptance Criteria

| ID | Criteria | Measurement |
|----|----------|-------------|
| AC1 | Route `/dashboard` accessible | Navigation to `/dashboard` works |
| AC2 | Shows personalized welcome | User's name displayed on page |
| AC3 | CTA button navigates to `/guia` | Click changes route to `/guia` |
| AC4 | Unpaid users redirected to `/checkout` | `hasAccess=false` triggers redirect |
| AC5 | Unauthenticated users redirected to `/` | No `user` triggers redirect to home |
| AC6 | Loading state shown | Spinner during `loading=true` |
| AC7 | Responsive design | Works on mobile/tablet/desktop |
| AC8 | Admins can access | Admin bypass allows access |

---

## 10. Out of Scope

- User profile editing
- Payment history display
- Subscription management
- Analytics/tracking
- Email notifications
- Admin-specific features
- Multi-language support (PT-BR only)
- Progress tracking

---

## 11. Implementation Notes

### 11.1 ProtectedRoute Configuration
```typescript
<Route path="/dashboard">
  <ProtectedRoute requirePayment={true}>
    <Dashboard />
  </ProtectedRoute>
</Route>
```

**Note:** `requirePayment={true}` ensures only paid users can access.

### 11.2 User Data Access
```typescript
const { user } = useAuth();
const userName = user?.user_metadata?.full_name || user?.email || 'Usuário';
```

### 11.3 Navigation
```typescript
import { useNavigate } from 'wouter'; // or useLocation hook
const [, setLocation] = useLocation();
const handleNavigate = () => setLocation('/guia');
```

---

## 12. Testing Strategy

### 12.1 Unit Tests (Optional)
- Component rendering
- User name display
- Navigation function call

### 12.2 Integration Tests (Manual)
- Login → Access dashboard
- Navigate to /guia via button
- Access without payment → /checkout redirect
- Direct URL access scenarios

### 12.3 Edge Cases
- Session expiration during viewing
- Payment API failure
- Missing user metadata

---

## 13. Success Metrics

- Dashboard loads successfully for authenticated users with access
- Unpaid users correctly redirected to checkout
- CTA button navigates to /guia
- No console errors
- Responsive layout works on all devices

---

**Expansion Phase: COMPLETE ✓**
