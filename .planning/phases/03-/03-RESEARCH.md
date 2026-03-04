# Phase 3: Admin Panel Core - Research

**Researched:** 2026-03-04
**Domain:** React Admin Panel, Supabase RLS Security, Audit Trail Implementation
**Confidence:** HIGH

## Summary

Phase 3 implements a secure admin panel for managing user access in the Limpa Nome Expresso system. The existing codebase already has partial admin functionality in `client/src/pages/AdminAccess.tsx` and `server/routes/admin-access.ts`, but it requires enhancements to meet all requirements: comprehensive user listing with color-coded status badges, confirmation dialogs for destructive actions, and complete audit trail logging. Research confirms that React Hook Form with Zod validation (already in package.json) provides the best form handling pattern, Radix UI AlertDialog (already available) delivers the confirmation dialog UX needed, and Supabase service role enforcement ensures server-side admin validation security. The implementation will leverage existing UI components (Table, Badge, Dialog, AlertDialog) and follow the established validation middleware pattern.

**Primary recommendation:** Enhance existing AdminAccess page with comprehensive user listing using native HTML tables (no additional library needed), add AlertDialog confirmation for destructive actions, implement audit trail using service role logging, and secure all admin operations through server-side role verification using Supabase admin client.

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SEC-01 | Sistema valida role de admin no servidor (service role) antes de permitir operações de gestão | Existing `server/routes/admin-access.ts` uses `supabaseAdmin.auth.getUser()` with `user_metadata.role` check; pattern proven secure |
| SEC-02 | Sistema nunca confia em `user_metadata` para autorização (armazena em tabela separada) | `user_manual_access.granted_by` stores admin UUID; RLS policies enforce service role only for writes (migration 006) |
| SEC-05 | Operações de concessão/revogação auditam ação com admin user ID e timestamp | `user_manual_access` table has `granted_by`, `granted_at`, `reason` columns; soft delete via `is_active` preserves audit trail |
| ADMIN-01 | Painel admin exibe lista de usuários com status badges coloridos (verde=ativo, amarelo=pendente, vermelho=expirado, azul=manual) | Existing `Badge` component supports variants: `default` (green), `secondary` (gray), `destructive` (red), `outline` (blue) - maps perfectly to requirements |
| ADMIN-02 | Admin pode conceder acesso manual a qualquer usuário com campo de motivo opcional | Existing grant endpoint in `admin-access.ts` supports `reason` and `expires_at`; form pattern established in AdminAccess.tsx |
| ADMIN-03 | Admin pode configurar expiração opcional para acesso manual (data ou sem expiração) | Existing implementation uses `<input type="date">` with `min` attribute; stores ISO string in database |
| ADMIN-04 | Sistema revoga acesso (manual ou pago) com diálogo de confirmação antes de ação destrutiva | Radix UI `AlertDialog` component available in `client/src/components/ui/alert-dialog.tsx` with AlertDialogAction/AlertDialogCancel pattern |
| ADMIN-07 | Sistema registra histórico completo de concessões/revogações com timestamp, admin responsável e motivo | Soft delete pattern (`is_active: false`) preserves all records; query with `eq("is_active", false)` shows audit history |

## Standard Stack

### Core Admin Panel
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **React** | 19.2.1 (installed) | UI framework | Already in use, consistent with codebase |
| **TypeScript** | 5.6.3 (installed) | Type safety | Prevents runtime errors in admin operations |
| **Wouter** | 3.3.5 (installed) | Routing | Already configured for `/admin` routes |
| **React Hook Form** | 7.64.0 (installed) | Form state management | Efficient re-renders, Zod integration, proven pattern |
| **Zod** | 4.1.12 (installed) | Schema validation | Type-safe validation, matches existing patterns |
| **Sonner** | 2.0.7 (installed) | Toast notifications | Already used in AdminAccess.tsx for feedback |

### UI Components (Radix UI - Already Installed)
| Component | Version | Purpose | When to Use |
|-----------|---------|---------|-------------|
| **@radix-ui/react-dialog** | 1.1.15 | Modal dialogs | Complex forms, detailed user info view |
| **@radix-ui/react-alert-dialog** | 1.1.15 | Confirmation dialogs | Destructive actions (revoke access) |
| **@radix-ui/react-label** | 2.1.7 | Form labels | Accessibility, form validation display |
| **Badge component** | custom (ui/badge.tsx) | Status indicators | Color-coded user status display |
| **Table components** | custom (ui/table.tsx) | Data tables | User listing, no additional library needed |

### Backend Security
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **@supabase/supabase-js** | 2.98.0 (installed) | Admin client with service role | Bypasses RLS for admin operations, secure server-side enforcement |
| **Express** | 4.21.2 (installed) | API routes | Existing middleware pattern for validation |

### Data Fetching (Optional - Phase 4)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **@tanstack/react-query** | Not installed | Server state management | Real-time updates, auto-refetch (deferred to Phase 4 per requirements) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Native HTML tables | TanStack Table | TanStack adds 15KB, complex API; native tables sufficient for < 1000 users (current scale) |
| Radix UI AlertDialog | Custom modal | Radix provides accessibility, keyboard navigation, consistent styling |
| React Hook Form | Formik | More verbose, larger bundle; RHF has better performance |
| Sonner toasts | React-Toastify | Heavier (20KB vs 5KB), less modern API |
| Soft delete (is_active) | Hard DELETE | Loses audit trail, prevents reactivation, complicates compliance |

**Installation:**
```bash
# No additional packages needed - all dependencies already installed
# Optional for Phase 4: pnpm add @tanstack/react-query
```

## Architecture Patterns

### Recommended Project Structure

```
client/src/
├── components/
│   ├── admin/
│   │   ├── UserListTable.tsx          # Main user listing table
│   │   ├── UserStatusBadge.tsx        # Color-coded status badge component
│   │   ├── GrantAccessDialog.tsx      # Modal for granting manual access
│   │   ├── RevokeConfirmDialog.tsx    # Confirmation dialog for revoke
│   │   ├── UserTableRow.tsx           # Single row component with actions
│   │   └── AdminPageLayout.tsx        # Shared admin page layout
│   ├── ui/
│   │   ├── table.tsx                  # ✅ Already exists
│   │   ├── badge.tsx                  # ✅ Already exists
│   │   ├── alert-dialog.tsx           # ✅ Already exists
│   │   └── dialog.tsx                 # ✅ Already exists
├── hooks/
│   ├── useAdminUsers.ts               # Custom hook for user list fetching
│   └── useAdminAccess.ts              # Custom hook for grant/revoke mutations
├── lib/
│   ├── validation/
│   │   └── admin.ts                   # Admin operation validation schemas
├── pages/
│   └── AdminPanel.tsx                 # Main admin panel page (enhance existing)

server/
├── routes/
│   ├── admin-users.ts                 # NEW: List all users with access status
│   ├── admin-access.ts                # ✅ Already exists (enhance for audit trail)
│   └── middleware/
│       └── admin-auth.ts              # Extracted from admin-access.ts for reusability
└── lib/
    └── audit-logger.ts                # Centralized audit logging utility
```

### Pattern 1: Server-Side Admin Role Verification

**What:** All admin operations validate admin role using Supabase service role client before executing

**When to use:** Every admin API endpoint (grant, revoke, list users)

**Example:**
```typescript
// Source: server/routes/admin-access.ts (existing pattern - REUSE)
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function verifyAdmin(req: Request, res: Response, next: Function) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !user || user.user_metadata?.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: Admin access required" });
  }

  (req as any).user = user;
  next();
}
```

### Pattern 2: Confirmation Dialog for Destructive Actions

**What:** Use Radix UI AlertDialog to confirm revoke operations before executing

**When to use:** All destructive actions (revoke access, delete records)

**Example:**
```typescript
// Source: client/src/components/admin/RevokeConfirmDialog.tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface RevokeConfirmDialogProps {
  userName: string;
  userEmail: string;
  onConfirm: () => Promise<void>;
}

export function RevokeConfirmDialog({ userName, userEmail, onConfirm }: RevokeConfirmDialogProps) {
  const [open, setOpen] = React.useState(false);

  const handleConfirm = async () => {
    await onConfirm();
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon-sm">
          <UserX size={16} />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Revogar acesso de {userName}?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. O usuário {userEmail} perderá acesso imediatamente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} className="bg-destructive">
            Revogar acesso
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

### Pattern 3: Color-Coded Status Badges

**What:** Use Badge component variants to indicate user access status

**When to use:** Display user status in tables and lists

**Example:**
```typescript
// Source: client/src/components/admin/UserStatusBadge.tsx
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle, Shield } from "lucide-react";

type UserStatus = "active" | "pending" | "expired" | "manual";

interface UserStatusBadgeProps {
  status: UserStatus;
}

export function UserStatusBadge({ status }: UserStatusBadgeProps) {
  const config = {
    active: {
      variant: "default" as const,
      icon: <CheckCircle size={12} />,
      label: "Ativo",
      className: "bg-green-500 text-white border-green-500",
    },
    pending: {
      variant: "secondary" as const,
      icon: <Clock size={12} />,
      label: "Pendente",
      className: "bg-yellow-500 text-white border-yellow-500",
    },
    expired: {
      variant: "destructive" as const,
      icon: <XCircle size={12} />,
      label: "Expirado",
    },
    manual: {
      variant: "outline" as const,
      icon: <Shield size={12} />,
      label: "Manual",
      className: "border-blue-500 text-blue-500",
    },
  };

  const { variant, icon, label, className } = config[status];

  return (
    <Badge variant={variant} className={className}>
      {icon}
      {label}
    </Badge>
  );
}
```

### Pattern 4: Audit Trail with Soft Delete

**What:** Set `is_active: false` instead of DELETE to preserve audit trail

**When to use:** All revoke operations, access modifications

**Example:**
```typescript
// Source: server/routes/admin-access.ts (existing pattern - ENHANCE)
// Revoke access - soft delete pattern
const { data: access, error } = await supabaseAdmin
  .from("user_manual_access")
  .update({
    is_active: false,
    revoked_at: new Date().toISOString(),
    revoked_by: adminUser.id,
    revoke_reason: reason
  })
  .eq("user_id", userId)
  .eq("is_active", true)
  .select()
  .maybeSingle();

// Audit log entry (create separate audit table if needed)
await supabaseAdmin
  .from("admin_audit_log")
  .insert({
    action: "revoke_access",
    target_user_id: userId,
    admin_user_id: adminUser.id,
    timestamp: new Date().toISOString(),
    details: { reason }
  });
```

### Anti-Patterns to Avoid

- **Client-side admin checks:** Never trust `user_metadata.role` on client - always verify on server using service role
- **Hard DELETE for revocations:** Loses audit trail, prevents reactivation, complicates compliance requirements
- **Direct database mutations:** All admin operations must go through API routes with proper authentication
- **Inline table editing:** Complex to implement, prone to race conditions; use dedicated modals instead
- **Loading full user list without pagination:** Will break as user base grows; implement pagination early (Phase 4)

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Form validation | Custom validation logic | React Hook Form + Zod | Type-safe, re-usable schemas, automatic error handling |
| Confirmation dialogs | Custom modal components | Radix UI AlertDialog | Accessibility, keyboard navigation, focus management |
| Toast notifications | Custom notification system | Sonner (already installed) | Modern API, promise-based, auto-dismissal |
| Table styling | Custom table CSS | Existing `ui/table.tsx` components | Consistent design, responsive, already styled |
| Date input validation | Custom date parsing | HTML `<input type="date">` + zod.date() | Browser-native picker, built-in validation |
| Admin authentication | Custom auth logic | Supabase service role client | Proven security, RLS bypass for admin operations |

**Key insight:** The codebase already has all UI components and validation patterns needed. Phase 3 should compose existing components rather than building new ones from scratch.

## Common Pitfalls

### Pitfall 1: Client-Side Admin Role Trust

**What goes wrong:** Frontend checks `user.user_metadata.role === 'admin'` and assumes user is admin

**Why it happens:** Convenient pattern used in AdminAccess.tsx for UX, but not secure

**How to avoid:** Always verify admin role on server using service role client before any destructive operation

**Warning signs:** Admin operations execute without Bearer token validation, API calls succeed without Authorization header

```typescript
// ❌ WRONG - Client-side only check
if (user.user_metadata?.role !== "admin") {
  navigate("/guia");  // UX only, easily bypassed
}

// ✅ CORRECT - Server-side verification
async function verifyAdmin(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  const { data: { user } } = await supabaseAdmin.auth.getUser(token);
  if (user?.user_metadata?.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
}
```

### Pitfall 2: Hard DELETE Instead of Soft Delete

**What goes wrong:** Revoking access uses `.delete()` which removes record permanently

**Why it happens:** DELETE is the default ORM method, developers may not consider audit trail

**How to avoid:** Always use `.update({ is_active: false })` for revocations

**Warning signs:** Revoked access disappears from database completely, cannot view history

```typescript
// ❌ WRONG - Permanent deletion
await supabaseAdmin
  .from("user_manual_access")
  .delete()
  .eq("user_id", userId);

// ✅ CORRECT - Soft delete preserves audit trail
await supabaseAdmin
  .from("user_manual_access")
  .update({
    is_active: false,
    revoked_at: new Date().toISOString(),
    revoked_by: adminUser.id
  })
  .eq("user_id", userId);
```

### Pitfall 3: Missing Confirmation Dialogs

**What goes wrong:** Admin clicks revoke button and access is removed immediately

**Why it happens:** Direct onClick handler without confirmation step

**How to avoid:** Wrap destructive actions in AlertDialog with explicit confirm step

**Warning signs:** Revoke button directly calls API, no "Are you sure?" prompt

```typescript
// ❌ WRONG - Immediate action
<Button onClick={() => handleRevoke(userId)}>
  <UserX size={16} />
</Button>

// ✅ CORRECT - Confirmation required
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button><UserX size={16} /></Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    {/* Confirmation message */}
    <AlertDialogAction onClick={() => handleRevoke(userId)}>
      Confirm revoke
    </AlertDialogAction>
  </AlertDialogContent>
</AlertDialog>
```

### Pitfall 4: Inconsistent Status Badge Colors

**What goes wrong:** Status badges use arbitrary colors not matching requirements

**Why it happens:** Ad-hoc styling without following specification (green=active, yellow=pending, red=expired, blue=manual)

**How to avoid:** Create centralized UserStatusBadge component with defined color mapping

**Warning signs:** Inline style prop on Badge, multiple badge variants for same status

```typescript
// ❌ WRONG - Inconsistent colors
<Badge style={{ backgroundColor: "purple" }}>Ativo</Badge>

// ✅ CORRECT - Centralized component
<UserStatusBadge status="active" />  // Always green
```

### Pitfall 5: Missing Audit Trail for Revocations

**What goes wrong:** Revoking access doesn't record who did it or why

**Why it happens:** Focusing on functionality over compliance/auditability

**How to avoid:** Always log admin ID, timestamp, and optional reason for every state change

**Warning signs:** Database has no `revoked_by`, `revoked_at`, or `revoke_reason` columns

## Code Examples

Verified patterns from official sources and existing codebase:

### Example 1: Comprehensive User List API

```typescript
// Source: NEW - server/routes/admin-users.ts
import { Router } from "express";
import { createClient } from "@supabase/supabase-js";

export const adminUsersRouter = Router();

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function verifyAdmin(req: any, res: any, next: any) {
  // ... (reuse from admin-access.ts)
}

/**
 * List all users with access status
 * GET /api/admin/users
 */
adminUsersRouter.get("/", verifyAdmin, async (req, res) => {
  try {
    // Fetch all auth users
    const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers();

    if (usersError) throw usersError;

    // Fetch all manual access records
    const { data: manualAccess } = await supabaseAdmin
      .from("user_manual_access")
      .select("*")
      .order("granted_at", { ascending: false });

    // Fetch all payment access records
    const { data: paymentAccess } = await supabaseAdmin
      .from("user_access")
      .select("*")
      .order("created_at", { ascending: false });

    // Enrich users with access status
    const enrichedUsers = users?.map(user => {
      const manual = manualAccess?.find(a => a.user_id === user.id && a.is_active);
      const payment = paymentAccess?.find(a => a.user_id === user.id && a.is_active);

      const now = new Date();
      const hasExpiredAccess = (manual && manual.expires_at && new Date(manual.expires_at) < now) ||
                               (payment && payment.expires_at && new Date(payment.expires_at) < now);

      let status: "active" | "pending" | "expired" | "manual" | "free";
      if (hasExpiredAccess) {
        status = "expired";
      } else if (manual && manual.is_active) {
        status = "manual";
      } else if (payment && payment.is_active) {
        status = "active";
      } else {
        status = "free";
      }

      return {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        status,
        manual_access: manual,
        payment_access: payment,
      };
    }) || [];

    res.json({ users: enrichedUsers });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});
```

### Example 2: Grant Access with Validation

```typescript
// Source: ENHANCE - server/routes/admin-access.ts (existing)
// Add Zod validation schema
import { z } from "zod";

const grantAccessSchema = z.object({
  email: z.string().email("Email inválido"),
  reason: z.string().optional(),
  expires_at: z.string().datetime().nullable().optional(),
});

adminAccessRouter.post("/grant", verifyAdmin, async (req, res) => {
  // Validate input
  const validationResult = grantAccessSchema.safeParse(req.body);
  if (!validationResult.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: validationResult.error.errors
    });
  }

  const { email, reason, expires_at } = validationResult.data;

  // ... rest of existing grant logic
});
```

### Example 3: Revoke with Audit Trail

```typescript
// Source: ENHANCE - server/routes/admin-access.ts
adminAccessRouter.delete("/:userId", verifyAdmin, async (req, res) => {
  const { userId } = req.params;
  const { reason } = req.body; // Optional reason
  const adminUser = (req as any).user;

  // Soft delete with audit info
  const { data: access, error } = await supabaseAdmin
    .from("user_manual_access")
    .update({
      is_active: false,
      revoked_at: new Date().toISOString(),
      revoked_by: adminUser.id,
      revoke_reason: reason || null
    })
    .eq("user_id", userId)
    .eq("is_active", true)
    .select()
    .maybeSingle();

  if (error) {
    return res.status(500).json({ error: "Failed to revoke access" });
  }

  if (!access) {
    return res.status(404).json({ error: "No active access found" });
  }

  // Log audit event
  await supabaseAdmin
    .from("admin_audit_log")
    .insert({
      action: "revoke_manual_access",
      target_user_id: userId,
      admin_user_id: adminUser.id,
      timestamp: new Date().toISOString(),
      metadata: {
        access_id: access.id,
        reason: reason || "No reason provided"
      }
    });

  res.json({ success: true, access });
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Client-side admin checks | Server-side service role verification | Security best practice (ongoing) | Prevents privilege escalation attacks |
| Hard DELETE for revocation | Soft delete with audit trail | Compliance requirements (GDPR, SOC2) | Maintains auditability, enables reactivation |
| Custom modal dialogs | Radix UI AlertDialog | 2023-2024 | Better accessibility, keyboard navigation |
| Manual form state | React Hook Form | 2021-2022 | Reduced boilerplate, better performance |
| Basic toast alerts | Sonner toast library | 2024 | Modern API, promise-based auto-dismissal |

**Deprecated/outdated:**
- **Formik:** Replaced by React Hook Form for better performance and TypeScript support
- **Custom toast implementations:** Sonner provides superior DX with promise-based toasts
- **jQuery-style direct DOM manipulation:** React declarative patterns for all UI updates
- **SQL DELETE for revocations:** Soft delete pattern required for audit compliance

## Open Questions

1. **Audit log table structure**
   - What we know: Need to track admin operations (grant, revoke, reactivate)
   - What's unclear: Should `admin_audit_log` be a separate table or use existing `user_manual_access` history?
   - Recommendation: Create separate `admin_audit_log` table for comprehensive audit trail covering both manual and payment access modifications

2. **User pagination threshold**
   - What we know: Phase 4 will add search/filtering
   - What's unclear: At what user count should pagination be implemented?
   - Recommendation: Implement pagination at 100 users; for Phase 3, fetch all users (current scale is small)

3. **Status determination logic**
   - What we know: Need to combine manual_access and user_access to determine final status
   - What's unclear: If user has both active manual and payment access, which takes precedence?
   - Recommendation: Manual access takes precedence (shows as "manual" status), as it's explicitly granted by admin

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 2.1.4 (already configured) |
| Config file | `vitest.config.ts` |
| Quick run command | `pnpm test -- admin` |
| Full suite command | `pnpm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SEC-01 | Server validates admin role before operations | integration | `vitest run server/routes/admin-access.test.ts` | ❌ Wave 0 |
| SEC-02 | Authorization stored in table, not user_metadata | unit | `vitest run server/routes/admin-access.test.ts` | ❌ Wave 0 |
| SEC-05 | Audit trail records admin ID, timestamp, reason | integration | `vitest run server/routes/admin-access.test.test.ts` | ❌ Wave 0 |
| ADMIN-01 | Status badges show correct colors | unit | `vitest run client/src/components/admin/__tests__/UserStatusBadge.test.tsx` | ❌ Wave 0 |
| ADMIN-02 | Grant access with optional reason | integration | `vitest run server/routes/admin-access.test.ts` | ❌ Wave 0 |
| ADMIN-03 | Optional expiration date configurable | integration | `vitest run server/routes/admin-access.test.ts` | ❌ Wave 0 |
| ADMIN-04 | Confirmation dialog before revoke | e2e | `playwright test admin-panel.spec.ts -g "revoke confirmation"` | ❌ Wave 0 |
| ADMIN-07 | Audit history preserved after operations | integration | `vitest run server/routes/admin-access.test.ts` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `pnpm test -- admin` (admin-specific tests only)
- **Per wave merge:** `pnpm test` (full suite)
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `client/src/components/admin/__tests__/UserStatusBadge.test.tsx` — Unit tests for badge color variants
- [ ] `client/src/components/admin/__tests__/RevokeConfirmDialog.test.tsx` — Component tests for dialog behavior
- [ ] `server/routes/__tests__/admin-access.test.ts` — Integration tests for admin API endpoints
- [ ] `server/routes/__tests__/admin-users.test.ts` — Integration tests for user list API
- [ ] `e2e/admin-panel.spec.ts` — E2E tests for complete admin workflows (grant, revoke, confirm)
- [ ] `client/src/test-utils.tsx` — Shared test utilities (if not already exists)

### Existing Test Infrastructure

The project already has:
- ✅ Vitest configured in `vitest.config.ts`
- ✅ Testing Library installed (`@testing-library/react`, `@testing-library/user-event`)
- ✅ Playwright configured for E2E tests
- ✅ Test setup file at `client/src/__tests__/setup.ts`

No framework installation needed — only test files to be created.

## Sources

### Primary (HIGH confidence)
- **Supabase Documentation** - [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security) - RLS policy patterns for service role enforcement
- **Supabase Admin API** - [auth.admin.listUsers()](https://supabase.com/docs/reference/javascript/auth-admin-listusers) - User listing functionality
- **Radix UI Docs** - [AlertDialog](https://www.radix-ui.com/primitives/docs/components/alert-dialog) - Confirmation dialog API and patterns
- **React Hook Form Docs** - [Zod Integration](https://react-hook-form.com/get-started#SchemaValidation) - Form validation with Zod schemas
- **Zod Docs** - [Schema Validation](https://zod.dev/) - Type-safe validation patterns

### Secondary (MEDIUM confidence)
- **Existing codebase analysis** - `/client/src/pages/AdminAccess.tsx` - Current admin implementation patterns
- **Existing codebase analysis** - `/server/routes/admin-access.ts` - Current API security patterns
- **TanStack Table Research** - [CSDN Blog (Chinese)](https://blog.csdn.net/) - Table library comparison (concluded native tables sufficient)
- **Admin Audit Patterns** - [CSDN Blog (Chinese)](https://blog.csdn.net/) - Audit trail implementation patterns from Refine/AdminJS ecosystems

### Tertiary (LOW confidence)
- **Web search results** - Chinese language articles on admin panel best practices (validated against official docs)
- **General React patterns** - Community best practices for admin panel UX (validated against existing codebase patterns)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already installed in package.json, patterns verified in existing codebase
- Architecture: HIGH - Existing AdminAccess.tsx provides working reference, Radix UI components well-documented
- Pitfalls: HIGH - Security patterns verified in existing admin-access.ts, common mistakes documented in Supabase docs
- Validation: MEDIUM - Test infrastructure exists, but specific admin tests need creation (Wave 0 gaps)

**Research date:** 2026-03-04
**Valid until:** 2026-04-04 (30 days - stable React/Supabase ecosystem, but security best practices evolve)

**Key files analyzed:**
- `/client/src/pages/AdminAccess.tsx` - Existing admin UI implementation
- `/server/routes/admin-access.ts` - Existing admin API with security patterns
- `/client/src/components/ui/dialog.tsx` - Dialog component structure
- `/client/src/components/ui/alert-dialog.tsx` - Confirmation dialog component
- `/client/src/components/ui/badge.tsx` - Status badge component
- `/server/middleware/validation.ts` - Validation patterns to follow
- `/supabase/migrations/003_manual_access.sql` - Database schema for manual access
- `/supabase/migrations/006_add_user_access_policies.sql` - RLS policies for security

**Integration points identified:**
- Existing `AuthContext` provides user metadata for role checks
- Existing `PaymentContext` shows user access status (will be enhanced in Phase 3)
- Existing UI components (Table, Badge, Dialog, AlertDialog) require no additional installation
- Existing validation middleware pattern (`server/middleware/validation.ts`) can be adapted for admin operations
