# Roadmap: Limpa Nome Expresso - Refatoração Autenticação e Pagamentos

**Milestone:** v1.1 - Correção do Sistema de Acesso
**Created:** 2026-03-04
**Granularity:** Standard

## Phases

- [ ] **Phase 1: Authentication Foundation** - Fix login loops, implement centralized access validation
- [x] **Phase 2: Database Security & Performance** - Optimize RLS policies and add indexes (completed 2026-03-04)
- [ ] **Phase 3: Admin Panel Core** - Build user management with grant/revoke access
- [ ] **Phase 4: Admin Panel Polish** - Advanced filtering, search and real-time updates

## Phase Details

### Phase 1: Authentication Foundation

**Goal:** Users can log in and access paid content without redirect loops or race conditions

**Depends on:** Nothing (first phase)

**Requirements:** AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, INT-01, INT-02, INT-03, INT-04, UX-02, UX-03

**Success Criteria** (what must be TRUE):
1. User can log in and be redirected to correct page (dashboard if paid, checkout if not) without redirect loops
2. User with valid access (paid or manual) can access protected content without being redirected back to login
3. System shows loading states during access validation instead of premature redirects
4. MercadoPago webhook updates user_access correctly after payment confirmation
5. Access validation returns consistent results (no race conditions between AuthContext and PaymentContext)

**Plans:** 1 plan
- [ ] 01-01-PLAN.md — Replace PaymentContext with React Query to eliminate race conditions and redirect loops

---

### Phase 2: Database Security & Performance

**Goal:** Database queries are secure, performant, and enforce proper access control

**Depends on:** Phase 1

**Requirements:** SEC-03, SEC-04, DB-01, DB-02, DB-03, DB-04

**Success Criteria** (what must be TRUE):
1. Admin can read user_access and user_manual_access tables via Supabase client
2. Regular users cannot modify user_access or user_manual_access directly (RLS blocks writes)
3. Database queries complete in under 100ms for user access checks (indexes on user_id)
4. Expired access (expires_at < NOW()) is correctly excluded from active access queries
5. Revoked access records persist in database with is_active: false (soft delete)

**Plans:** 2/2 plans complete
- [ ] 02-01-PLAN.md — Create user_access table with indexes and RLS policies
- [ ] 02-02-PLAN.md — Create comprehensive database test suite

---

### Phase 3: Admin Panel Core

**Goal:** Admins can manage user access through a web interface

**Depends on:** Phase 1, Phase 2

**Requirements:** SEC-01, SEC-02, SEC-05, ADMIN-01, ADMIN-02, ADMIN-03, ADMIN-04, ADMIN-07

**Success Criteria** (what must be TRUE):
1. Admin can view list of all users with color-coded status badges (green=active, yellow=pending, red=expired, blue=manual)
2. Admin can grant manual access to any user with optional reason and expiration date
3. Admin can revoke access (manual or paid) with confirmation dialog before destructive action
4. System records every grant/revoke operation with timestamp, admin user ID, and reason
5. Admin operations validate admin role on server (service role) before allowing changes

**Plans:** 1 plan
- [ ] 03-01-PLAN.md — Build comprehensive admin panel with user listing, status badges, grant/revoke access, and audit trail

---

### Phase 4: Admin Panel Polish

**Goal:** Admin panel provides efficient user management with search and filtering

**Depends on:** Phase 3

**Requirements:** ADMIN-05, ADMIN-06, UX-01, UX-04

**Success Criteria** (what must be TRUE):
1. Admin can search for users by name or email to find specific accounts
2. Admin can filter user list by access type (paid/manual/free) and status (active/pending/expired)
3. Admin panel updates user status in real-time without page refresh after granting/revoking access
4. Admin operations show optimistic feedback with rollback if operation fails

**Plans:** 1 plan

- [ ] 04-01-PLAN.md — Add search, filters, and real-time updates with React Query

---

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Authentication Foundation | 0/1 | Planning | - |
| 2. Database Security & Performance | 2/2 | Complete   | 2026-03-04 |
| 3. Admin Panel Core | 0/1 | Planning | - |
| 4. Admin Panel Polish | 0/1 | Not started | - |

---

## Coverage Summary

**Total v1.1 Requirements:** 25
**Mapped to Phases:** 25 (100%)
**Unmapped:** 0

### Requirement Mapping

| Phase | Requirements | Count |
|-------|--------------|-------|
| 1 | AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, INT-01, INT-02, INT-03, INT-04, UX-02, UX-03 | 11 |
| 2 | SEC-03, SEC-04, DB-01, DB-02, DB-03, DB-04 | 6 |
| 3 | SEC-01, SEC-02, SEC-05, ADMIN-01, ADMIN-02, ADMIN-03, ADMIN-04, ADMIN-07 | 8 |
| 4 | ADMIN-05, ADMIN-06, UX-01, UX-04 | 4 |

---

*Roadmap created: 2026-03-04*
*Last updated: 2026-03-04 - Phase 4 plan created*
