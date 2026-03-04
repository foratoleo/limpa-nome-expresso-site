# Project Research Summary

**Project:** Limpa Nome Expresso - Authentication and Access Control Refactoring
**Domain:** Authentication/Payment System Refactoring with Admin Panel
**Researched:** 2026-03-04
**Confidence:** HIGH

## Executive Summary

This project is a **refactoring initiative** for an existing React SPA with Supabase authentication and Express API, focusing on fixing critical authentication flow issues and adding admin panel capabilities for manual access management. The research reveals that the current system suffers from race conditions in ProtectedRoute causing redirect loops, infinite re-render issues in PaymentContext, and lacks a centralized access validation mechanism.

The recommended approach is **three-phased**: (1) Fix immediate authentication issues by implementing proper loading states and centralized access validation with React Query, (2) Audit and optimize Supabase RLS policies for performance and security, and (3) Build admin panel with TanStack Table for manual access management. Key risks include RLS policies blocking legitimate access (94%+ performance improvement possible with proper indexing), admin role escalation via user metadata (requires server-side validation), and race conditions between auth state initialization and access checks.

## Key Findings

### Recommended Stack

**Core technologies:**
- **React + TypeScript** — Keep existing stack, stable and well-integrated
- **Supabase Auth + PostgreSQL** — Keep existing, requires RLS policy optimization
- **Express API** — Keep existing, add centralized `/api/payments/status` endpoint
- **@tanstack/react-query (v5+)** — **ADD** - Solves Context loop issues through proven cache patterns, automatic auth-aware refetching
- **@tanstack/react-table (v8.21+)** — **ADD** - Headless table for admin user management, 12KB vs AG Grid's 85KB
- **Zod (v4.1.12)** — Already installed for form validation
- **Existing UI (Radix UI + Tailwind)** — Keep, sufficient for admin panel

**Critical stack additions:**
- React Query replaces manual Context state management to prevent infinite loops
- TanStack Table provides flexible, type-safe table for admin interface
- RLS policy optimization (indexes + SELECT wrapper) provides 99.94% performance improvement

### Expected Features

**Must have (table stakes):**
- **Centralized access validation endpoint** (`/api/payments/status`) — Single source of truth for all access checks
- **ProtectedRoute fix** — Resolves login loop, properly validates access before allowing protected content
- **Admin panel user list** — Table showing all users with access status badges (paid/manual/free)
- **Grant manual access** — Admin can grant access to any user with optional reason field
- **Revoke access** — Admin can remove manual or paid access with confirmation dialog
- **Basic user search** — Filter by name/email to find specific users
- **Access history log** — Record all grant/revoke operations with timestamp and admin user
- **Admin authentication check** — Verify admin role before allowing any admin operations

**Should have (competitive):**
- **Hybrid access model** — Supports both payment-based AND manual admin access (manual access doesn't expire)
- **Access reason tracking** — Records WHY manual access was granted (audit trail)
- **Advanced filtering** — Filter by access type, status, date range
- **Real-time access updates** — No page refresh needed after access changes (React Query handles this)

**Defer (v2+):**
- **Bulk operations** — Multi-select users for batch grant/revoke (complex UI, significant engineering)
- **Scheduled access** — Set expiration dates for manual access (requires schema changes)
- **Admin activity dashboard with charts** — Visual metrics and trends (nice to have, not critical)
- **Email notifications** — Alert users when access granted/revoked (requires email service integration)

### Architecture Approach

**Major components:**
1. **ProtectedRoute** — Route-level access control with proper loading states to prevent redirect loops
2. **PaymentContext** — Refactored to use React Query for access status caching, eliminating manual state management
3. **/api/payments/status** — Single source of truth endpoint combining user_access and user_manual_access tables
4. **AdminPanel** — React components consuming admin APIs with TanStack Table for user management
5. **Supabase RLS Policies** — Optimized with indexes and SELECT wrappers for 94%+ performance improvement

**Key architectural patterns:**
- **Stable Reference Pattern** — Use `useRef` to store user/session values without triggering re-renders
- **Single Source of Truth** — All access checks flow through `/api/payments/status` API endpoint
- **Three-State Loading Pattern** — Track `loading`, `initialized`, and specific operation states separately
- **Soft Delete Pattern** — Set `is_active: false` instead of deleting records for complete audit trail

### Critical Pitfalls

1. **ProtectedRoute Redirect Loop** — Implement `isInitialized` flag separate from `isLoading`, never redirect while loading, use early return patterns in useEffect

2. **React Context Infinite Re-render Loop** — Always memoize context values with `useMemo`, wrap functions in `useCallback`, use refs for frequently-changing values, split contexts by concern

3. **Supabase RLS Policy Blocking Legitimate Access** — Always create policies for both authenticated and specific user access, verify policy with explicit SELECT test, use service role key for admin operations

4. **Race Condition in Access Validation** — Implement initialization flag (don't check access until `isInitialized === true`), use `onAuthStateChange` with `INITIAL_SESSION` event, chain operations: await auth then await payment check

5. **Admin Role Escalation via User Metadata** — Never trust user metadata for authorization (client-writable), store admin role in separate table with RLS policies, validate admin role on server using service role key

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Fix Authentication Foundation

**Rationale:** Current system has critical blocking issues (login loop, race conditions) that prevent users from accessing paid content. Must fix before adding new features.

**Delivers:**
- Centralized `/api/payments/status` endpoint
- Fixed ProtectedRoute with no redirect loops
- React Query integration for access caching
- Proper auth state initialization sequencing

**Addresses:**
- Centralized access validation endpoint (P1)
- ProtectedRoute fix (P1)
- Race condition prevention (P1)

**Avoids:**
- ProtectedRoute redirect loop (Pitfall 1)
- React Context infinite re-render loop (Pitfall 2)
- Race condition in access validation (Pitfall 4)

**Research needed:** `/gsd:research-phase` recommended for MercadoPago webhook integration details and exact schema structure of user_access/user_manual_access tables.

### Phase 2: Optimize Database Security & Performance

**Rationale:** RLS policies may be blocking legitimate access or causing performance issues. Database-level optimization prevents security vulnerabilities and improves query performance by 94%+.

**Delivers:**
- Optimized RLS policies with indexes on user_id and expires_at
- SELECT wrapper optimization for auth.uid() calls
- Explicit deny policies for user updates/deletes
- Service role restrictions for modifications

**Addresses:**
- Supabase RLS policy audit (Phase 2 requirement)
- Database performance optimization

**Uses:**
- Supabase RLS best practices (from STACK.md)

**Avoids:**
- RLS policies blocking legitimate access (Pitfall 3)

**Research needed:** `/gsd:research-phase` recommended for specific Supabase RLS policy patterns for admin vs user access.

### Phase 3: Build Admin Panel

**Rationale:** Once authentication foundation is stable and database security is optimized, build admin interface for manual access management. This order prevents building admin panel on top of broken auth.

**Delivers:**
- Admin panel user list with TanStack Table
- Grant/revoke manual access functionality
- Access history log with audit trail
- Admin authentication middleware

**Implements:**
- Admin panel user list (P1)
- Grant manual access (P1)
- Revoke access (P1)
- Basic user search (P1)
- Access history log (P1)
- Admin authentication check (P1)

**Uses:**
- TanStack Table for UI (from STACK.md)
- Zod for form validation (already installed)
- Existing admin-access routes (server/routes/admin-access.ts)

**Avoids:**
- Admin role escalation via user metadata (Pitfall 5)

**Research needed:** `/gsd:research-phase` recommended for exact admin permission system design (role-based vs attribute-based access control).

### Phase 4: Polish & Testing

**Rationale:** Add UX improvements and comprehensive testing after core functionality works.

**Delivers:**
- Advanced filtering (access type, status, date range)
- Pagination for large datasets
- Export user list (CSV)
- Unit tests for access hooks
- E2E tests for login → access → dashboard flow

**Addresses:**
- Advanced filtering (P2)
- Pagination (P2)
- Export user list (P2)
- Testing coverage for critical flows

**Uses:**
- Vitest + React Testing Library (already installed)
- Playwright for E2E (already installed)
- Optional MSW for API mocking

**Research needed:** Skip research-phase - standard testing patterns, tools already installed.

### Phase Ordering Rationale

- **Phase 1 first**: Cannot build admin panel or optimize database while auth is broken (users can't access system)
- **Phase 2 second**: Database security must be verified before building admin panel that relies on RLS policies
- **Phase 3 third**: Admin panel requires stable auth foundation and secure database policies
- **Phase 4 last**: Polish and testing depend on working core functionality

### Research Flags

**Phases likely needing deeper research during planning:**
- **Phase 1:** MercadoPago webhook integration details, exact schema structure of user_access tables, current authentication flow implementation
- **Phase 2:** Specific Supabase RLS policy patterns for admin vs user access, index verification strategy
- **Phase 3:** Admin permission system design (role-based vs attribute-based), exact admin_users table schema

**Phases with standard patterns (skip research-phase):**
- **Phase 4:** Testing patterns are well-documented, tools already installed (Vitest, Playwright, RTL)

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Official documentation for TanStack libraries, Supabase RLS best practices verified |
| Features | HIGH | Comprehensive feature analysis with competitor comparison, clear prioritization matrix |
| Architecture | HIGH | Existing codebase analyzed, patterns verified with official React docs, anti-patterns documented |
| Pitfalls | HIGH | Pitfalls identified from current codebase issues, verified with 2025-2026 React best practices |

**Overall confidence:** HIGH

### Gaps to Address

- **Exact schema structure:** Need to verify current user_access and user_manual_access table structure (indexes, columns, constraints)
- **Current webhook implementation:** MercadoPago webhook needs review for idempotency and retry logic
- **Admin permission system:** Need to define whether role-based or attribute-based access control is needed
- **Performance baseline:** Need to measure current query times on user_access before optimization
- **Index status:** Are indexes already created on user_access.user_id? Need verification

**How to handle during planning/execution:**
- Phase 1 research should audit existing schema and webhook implementation
- Phase 3 research should define admin permission system requirements
- Performance measurements should be taken before Phase 2 optimizations to quantify improvement

## Sources

### Primary (HIGH confidence)
- TanStack Table Documentation - Official library documentation for headless table implementation
- TanStack Query Documentation - Official library documentation for cache management and server state
- Supabase RLS Documentation - Official Supabase row level security guides
- React Documentation - Official React Context, useEffect, and performance optimization patterns
- Zod Documentation - Official schema validation library documentation

### Secondary (MEDIUM confidence)
- React Context Performance Optimization (November 2025) - 2025 articles verify ref patterns and memoization strategies
- Supabase RLS Performance Best Practices (May 2025) - WebSearch verified, 99.94% improvement with indexes
- TanStack Table vs AG Grid Comparison - Bundle size comparison (12KB vs 85KB)
- Admin Panel UI Patterns - Multiple sources agree on table-based user management approach
- Race Condition Solutions (February 2026) - Recent articles on React useEffect dependency management

### Tertiary (LOW confidence)
- MercadoPago Webhook Testing Patterns - WebSearch only, needs verification with official docs
- Specific version numbers for latest packages - Verify with npm before install
- MSW for API mocking - Recommended but optional, project may use real test database instead

---
*Research completed: 2026-03-04*
*Ready for roadmap: yes*
