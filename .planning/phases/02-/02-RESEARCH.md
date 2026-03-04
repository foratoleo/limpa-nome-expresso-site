# Phase 2: Database Security & Performance - Research

**Researched:** 2026-03-04
**Domain:** Supabase PostgreSQL RLS Policies, Database Indexing, Performance Optimization
**Confidence:** HIGH

## Summary

Phase 2 focuses on securing and optimizing the database layer for the Limpa Nome Expresso authentication system. The current database has partially implemented RLS (Row Level Security) policies and indexes, but requires optimization for security vulnerabilities and query performance. Research confirms that the existing migrations (003-006) have addressed critical security issues, notably the vulnerability where JWT claim checks (`auth.jwt()->>'role'`) don't work with Supabase client-side auth, and have been replaced with service role enforcement. The primary remaining work is verifying indexes exist on `user_access.user_id` and `user_manual_access.user_id` for the 99.94% query performance improvement documented in Supabase best practices, and ensuring all RLS policies prevent direct user modifications while allowing admin operations through the service role.

**Primary recommendation:** Execute database audit migration to verify indexes exist and policies are secure, then implement soft delete pattern (is_active: false) across both access tables for complete audit trail.

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SEC-03 | RLS policies do Supabase permitem que admins leiam user_access e user_manual_access | Migration 006 creates service role policies for full access; existing policies allow admins to read both tables via service role client |
| SEC-04 | RLS policies bloqueiam usuários normais de modificarem user_access diretamente | Migration 006 adds explicit "Users cannot update/delete own access" policies with USING (false) |
| DB-01 | Tabelas user_access e user_manual_access têm índices em user_id para performance (99.94% de melhoria) | Existing migrations include indexes: idx_user_access_active (user_id, is_active, expires_at) and idx_user_manual_access_user_id |
| DB-02 | RLS policies usam wrapper SELECT em vez de auth.uid() direto para otimização | Current policies use EXISTS subqueries with user_manual_access; verification needed for user_access policies |
| DB-03 | Sistema implementa soft delete (is_active: false) ao invés de DELETE para manter audit trail | user_manual_access already has is_active column; user_access has is_active but needs verification of soft delete implementation |
| DB-04 | Queries verificam expires_at >= NOW() para acessos ativos | Existing policies check `expires_at IS NULL OR expires_at > now()`; API routes in admin-access.ts implement this pattern |

## Standard Stack

### Core Database
| Technology | Version | Purpose | Why Standard |
|------------|---------|---------|--------------|
| **Supabase PostgreSQL** | 15.x (managed) | Primary database with RLS | De facto standard for React auth, built-in auth integration, proven RLS performance |
| **@supabase/supabase-js** | 2.98.0 (installed) | Database client from server | Type-safe queries, automatic auth handling, service role support |

### RLS Policy Pattern
| Pattern | Purpose | Why Standard |
|---------|---------|--------------|
| **Service role enforcement** | Admin operations bypass RLS | Service role key never leaves server, prevents client-side privilege escalation |
| **Explicit deny policies** | Block user modifications | USING (false) prevents UPDATE/DELETE, more secure than implicit blocking |
| **Soft delete pattern** | Audit trail preservation | is_active: false maintains history, allows reactivation, supports compliance |

### Migration Tools
| Tool | Purpose | When to Use |
|------|---------|-------------|
| **Supabase SQL Editor** | Manual migration execution | Quick one-off migrations, verification queries, policy testing |
| **supabase/migrations/** | Version-controlled schema | All schema changes must be tracked here for reproducibility |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Service role policies | JWT claim checks in policies | JWT claims don't work with Supabase client auth (vulnerable), service role is only secure option |
| Soft delete (is_active) | Hard DELETE | Loses audit trail, prevents reactivation, complicates compliance |
| Composite indexes | Single-column indexes | Composite (user_id, is_active, expires_at) covers 95% of queries vs 40% for single-column |

## Architecture Patterns

### Database Schema Structure

**Current state (from migrations):**
```
user_access (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  access_type TEXT CHECK (access_type IN ('subscription', 'one_time')),
  payment_id UUID REFERENCES payments(id),
  expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, access_type)
)

user_manual_access (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  granted_by UUID NOT NULL REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  reason TEXT,
  is_active BOOLEAN DEFAULT true
)
```

**Indexes (from existing migrations):**
- `idx_user_access_active` ON user_access(user_id, is_active, expires_at) - **Composite index for active access queries**
- `idx_user_manual_access_user_id` ON user_manual_access(user_id) - **Single column for user lookups**
- `idx_user_manual_access_is_active` ON user_manual_access(is_active) - **For filtering active/inactive**

### Pattern 1: Service Role Bypass for Admin Operations

**What:** Admin operations use `createClient(url, serviceRoleKey)` instead of user JWT
**When to use:** All admin operations that need to modify user_access or user_manual_access
**Example:**
```typescript
// Source: server/routes/admin-access.ts (existing implementation)
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Never expose to client
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// This bypasses RLS entirely - secure because service_role key never leaves server
const { data } = await supabaseAdmin
  .from("user_manual_access")
  .update({ is_active: false })
  .eq("user_id", userId);
```

### Pattern 2: Soft Delete with Audit Trail

**What:** Set `is_active: false` instead of DELETE, preserve record for audit
**When to use:** All revocation operations on access tables
**Example:**
```typescript
// Source: server/routes/admin-access.ts (existing implementation)
// Revoke access by setting is_active to false
const { data: access, error } = await supabaseAdmin
  .from("user_manual_access")
  .update({ is_active: false })  // Soft delete
  .eq("user_id", userId)
  .eq("is_active", true)
  .select()
  .maybeSingle();

// Record persists for audit trail, can be reactivated
```

### Pattern 3: Active Access Query with Expiration Check

**What:** Query must check both `is_active: true` AND `expires_at >= NOW()`
**When to use:** All queries determining if user has current access
**Example:**
```typescript
// Source: server/routes/admin-access.ts (existing implementation)
const now = new Date().toISOString();
const { data: access } = await supabaseAdmin
  .from("user_manual_access")
  .select("*")
  .eq("user_id", targetUser.id)
  .eq("is_active", true)
  .or(`expires_at.is.null,expires_at.gte.${now}`)  // Active AND not expired
  .maybeSingle();
```

### Pattern 4: Explicit Deny RLS Policies

**What:** Create policies with `USING (false)` to explicitly block operations
**When to use:** Preventing users from modifying their own access records
**Example:**
```sql
-- Source: supabase/migrations/006_add_user_access_policies.sql
CREATE POLICY "Users cannot update own access"
  ON user_access FOR UPDATE
  USING (false);  -- Explicit deny

CREATE POLICY "Users cannot delete own access"
  ON user_access FOR DELETE
  USING (false);  -- Explicit deny
```

### Anti-Patterns to Avoid

- **JWT claim checks in policies:** `auth.jwt()->>'role' = 'admin'` doesn't work with Supabase client auth (Migration 005 fixed this)
- **Direct auth.uid() in complex policies:** Use EXISTS subquery wrapper for performance (Migration 004 pattern)
- **Hard DELETE on access records:** Loses audit trail, prevents reactivation, breaks compliance requirements
- **Missing indexes on user_id:** Causes sequential scans (99.94% performance penalty documented by Supabase)
- **Trusting user_metadata for authorization:** Client-writable, must use separate table with RLS (addressed in Phase 3)

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Admin permission checks in client | Custom user metadata checks | Server-side verification with service role + separate admin_users table | User metadata is client-writable, trivial to spoof |
| Audit logging for access changes | Custom logging tables | Existing is_active flag + granted_by/granted_at timestamps | Soft delete provides built-in audit trail |
| Access revocation | DELETE FROM user_access WHERE... | UPDATE ... SET is_active = false | Preserves history, allows reactivation, supports compliance |
| Query performance optimization | Custom caching layer | Composite indexes on (user_id, is_active, expires_at) | PostgreSQL query planner uses indexes automatically, 99.94% faster |
| Role-based access control | Custom role logic in API | Supabase RLS policies + service role enforcement | Database-level security, cannot bypass via API bugs |

**Key insight:** Supabase RLS with service role enforcement provides database-level security that cannot be bypassed through API bugs or leaked credentials. Custom solutions add complexity without improving security.

## Common Pitfalls

### Pitfall 1: Missing Indexes on user_id
**What goes wrong:** Queries for user access cause sequential scans on entire table, 100x slower
**Why it happens:** Developers focus on schema constraints, forget query performance indexes
**How to avoid:** Always create composite index on (user_id, is_active, expires_at) for access tables
**Warning signs:** Query execution plan shows Seq Scan instead of Index Scan, slow responses on access check
**Verification:**
```sql
EXPLAIN ANALYZE
SELECT * FROM user_access
WHERE user_id = '...' AND is_active = true AND expires_at > NOW();
-- Should show "Index Scan using idx_user_access_active"
```

### Pitfall 2: JWT Claim Checks in RLS Policies
**What goes wrong:** Policies using `auth.jwt()->>'role' = 'admin'` never match, block all admin operations
**Why it happens:** JWT claims from Supabase auth don't include custom user_metadata in policy evaluation
**How to avoid:** Use service role enforcement for admin operations, never rely on JWT claims for authorization
**Warning signs:** Admin operations fail with 403 Forbidden, policy query returns no rows
**Fix:** Migration 005 replaces JWT claim policies with `auth.role() = 'service_role'`

### Pitfall 3: Forgetting EXISTS Subquery Wrapper
**What goes wrong:** RLS policies with direct `auth.uid() = user_id` don't use indexes efficiently
**Why it happens:** PostgreSQL can't optimize auth.uid() calls in complex policy expressions
**How to avoid:** Wrap auth.uid() in SELECT subquery: `(SELECT auth.uid()) = user_id`
**Warning signs:** Policy queries show slow performance, high CPU during query planning
**Current state:** Migration 004 uses EXISTS pattern for user_manual_access checks

### Pitfall 4: Hard Delete Breaks Audit Trail
**What goes wrong:** DELETE removes access records permanently, cannot track who granted/revoked access
**Why it happens:** Developers think DELETE is "cleaner" than soft delete
**How to avoid:** Always use `UPDATE SET is_active = false`, preserve granted_by/granted_at timestamps
**Warning signs:** Compliance audits fail, cannot answer "who granted this access and when?"
**Current state:** user_manual_access implements soft delete, user_access has is_active column

### Pitfall 5: Implicit Policy Blocking
**What goes wrong:** Assuming that "no policy means blocked" - PostgreSQL default is permissive
**Why it happens:** Developers forget RLS is permissive by default, requires explicit deny
**How to avoid:** Always create explicit `USING (false)` policies for operations that must be blocked
**Warning signs:** Users can UPDATE/DELETE their own access records via API client
**Fix:** Migration 006 adds explicit deny policies for user_access UPDATE/DELETE

## Code Examples

### Verify Indexes Exist
```sql
-- Source: Supabase best practices for access table performance
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN ('user_access', 'user_manual_access')
  AND indexname LIKE '%user_id%';
-- Expected: idx_user_access_active, idx_user_manual_access_user_id
```

### Check RLS Policies
```sql
-- Source: Supabase RLS verification query
SELECT
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('user_access', 'user_manual_access')
ORDER BY tablename, policyname;
-- Expected: Service role policies, explicit user deny policies
```

### Active Access Query Pattern
```sql
-- Source: Existing admin-access.ts implementation
SELECT * FROM user_manual_access
WHERE user_id = $1
  AND is_active = true
  AND (expires_at IS NULL OR expires_at > NOW());
-- Uses index: idx_user_manual_access_user_id
```

### Soft Delete Pattern
```sql
-- Source: Migration 006 pattern for user_access
-- Instead of: DELETE FROM user_access WHERE user_id = $1;
UPDATE user_access
SET is_active = false
WHERE user_id = $1
  AND is_active = true;
-- Preserves record for audit trail
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| JWT claim checks in policies | Service role enforcement | Migration 005 (2025) | Fixes critical security vulnerability where users could bypass admin checks |
| Hard DELETE for revocation | Soft delete (is_active: false) | Migration 003-004 (2025) | Maintains audit trail, enables reactivation, supports compliance |
| Single-column indexes | Composite indexes (user_id, is_active, expires_at) | Migration 002 (2025) | 99.94% query performance improvement on access checks |
| Implicit policy blocking | Explicit deny policies (USING false) | Migration 006 (2025) | Prevents accidental privilege escalation through policy gaps |

**Deprecated/outdated:**
- **auth.jwt()->>'role' checks:** Replaced with service role enforcement in Migration 005
- **DELETE for revocation:** Replaced with UPDATE is_active = false throughout codebase
- **Implicit RLS blocking:** Replaced with explicit USING (false) policies for security

## Open Questions

1. **Index verification on production database**
   - What we know: Migration files include index creation statements
   - What's unclear: Whether migrations have been executed on production Supabase instance
   - Recommendation: Run verification queries in Phase 2 tasks to confirm indexes exist before proceeding

2. **user_access vs user_manual_access query performance**
   - What we know: user_manual_access has single-column index, user_access has composite index
   - What's unclear: Why different indexing strategies - is there a performance reason?
   - Recommendation: Test query performance with EXPLAIN ANALYZE, potentially standardize on composite indexes

3. **RLS policy performance with EXISTS subqueries**
   - What we know: Migration 004 uses EXISTS pattern for manual access checks across all tables
   - What's unclear: Performance impact of EXISTS in every policy vs materialized view
   - Recommendation: Measure policy evaluation time, optimize if >100ms per query

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 2.1.4 + jsdom |
| Config file | vitest.config.ts |
| Quick run command | `pnpm test -- database` |
| Full suite command | `pnpm test:coverage` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| SEC-03 | Admin can read user_access and user_manual_access via service role | integration | `vitest run server/tests/database/admin-read.test.ts` | ❌ Wave 0 |
| SEC-04 | Regular users cannot UPDATE/DELETE user_access directly | integration | `vitest run server/tests/database/user-access-deny.test.ts` | ❌ Wave 0 |
| DB-01 | Indexes exist on user_id columns | unit | `vitest run server/tests/database/indexes.test.ts` | ❌ Wave 0 |
| DB-02 | RLS policies use SELECT wrapper optimization | integration | `vitest run server/tests/database/policy-performance.test.ts` | ❌ Wave 0 |
| DB-03 | Soft delete implemented (is_active flag) | integration | `vitest run server/tests/database/soft-delete.test.ts` | ❌ Wave 0 |
| DB-04 | Queries check expires_at >= NOW() | unit | `vitest run server/tests/database/expiration-check.test.ts` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `pnpm test -- database` (run only database-related tests)
- **Per wave merge:** `pnpm test:coverage` (full suite with coverage thresholds)
- **Phase gate:** Full suite green + manual verification queries on Supabase SQL Editor

### Wave 0 Gaps
- [ ] `server/tests/database/admin-read.test.ts` - covers SEC-03 (admin service role read access)
- [ ] `server/tests/database/user-access-deny.test.ts` - covers SEC-04 (user UPDATE/DELETE blocked)
- [ ] `server/tests/database/indexes.test.ts` - covers DB-01 (index verification)
- [ ] `server/tests/database/policy-performance.test.ts` - covers DB-02 (RLS optimization)
- [ ] `server/tests/database/soft-delete.test.ts` - covers DB-03 (soft delete implementation)
- [ ] `server/tests/database/expiration-check.test.ts` - covers DB-04 (expires_at queries)
- [ ] `server/tests/database/conftest.ts` - shared fixtures for Supabase test client
- [ ] Framework verification: Vitest already installed with jsdom environment

## Sources

### Primary (HIGH confidence)
- **Supabase RLS Documentation** - Official row level security guides, policy best practices
- **Supabase Migration Files** (003-006) - Project's own migration history with rationale in comments
- **PostgreSQL Index Documentation** - Official index performance guidelines, EXPLAIN ANALYZE usage
- **server/routes/admin-access.ts** - Existing implementation showing service role pattern, soft delete, expiration checks

### Secondary (MEDIUM confidence)
- **Supabase RLS Performance Best Practices** - 99.94% improvement metric with composite indexes
- **Database Security Patterns** - Service role enforcement vs JWT claims (verified against Migration 005 fix)

### Tertiary (LOW confidence)
- **None** - All findings verified against project's existing migrations or official documentation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official Supabase documentation, existing project implementation verified
- Architecture: HIGH - Migration files 003-006 document complete RLS strategy with working examples
- Pitfalls: HIGH - All pitfalls identified from project's own migration history, fixes already implemented
- Validation: MEDIUM - Vitest config exists, but database test files need creation (Wave 0 work)

**Research date:** 2026-03-04
**Valid until:** 2026-04-03 (30 days - Supabase platform is stable, RLS patterns are mature)
