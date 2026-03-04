/**
 * Admin Users API Route
 *
 * Provides endpoints for listing all users with enriched access status.
 * Calculates status based on manual access and payment access records.
 *
 * Status priority:
 * 1. expired - If user has expired access (manual or payment)
 * 2. manual - If user has active manual access
 * 3. active - If user has active payment access
 * 4. free - No access
 *
 * Endpoints:
 * - GET /api/admin/users - List all users with status
 */

import { Router, Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import { verifyAdmin, type AuthenticatedRequest } from "../middleware/admin-auth";

// ============================================================================
// Supabase Admin Client
// ============================================================================

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// ============================================================================
// Router Setup
// ============================================================================

export const adminUsersRouter = Router();

// ============================================================================
// TypeScript Types
// ============================================================================

/**
 * User access status types
 */
type UserStatus = "active" | "pending" | "expired" | "manual" | "free";

/**
 * Enriched user object with access status
 */
interface EnrichedUser {
  id: string;
  email: string;
  created_at: string;
  status: UserStatus;
  manual_access: any | null;
  payment_access: any | null;
}

/**
 * API response format
 */
interface UsersResponse {
  users: EnrichedUser[];
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate user access status based on manual and payment access records
 *
 * Priority order:
 * 1. expired - Has expired access (manual or payment)
 * 2. manual - Has active manual access
 * 3. active - Has active payment access
 * 4. free - No access
 *
 * @param manualAccess - Manual access record (if any)
 * @param paymentAccess - Payment access record (if any)
 * @returns User status
 */
function calculateUserStatus(
  manualAccess: any,
  paymentAccess: any
): UserStatus {
  const now = new Date();

  // Check for expired access
  const hasExpiredManualAccess =
    manualAccess &&
    manualAccess.is_active &&
    manualAccess.expires_at &&
    new Date(manualAccess.expires_at) < now;

  const hasExpiredPaymentAccess =
    paymentAccess &&
    paymentAccess.is_active &&
    paymentAccess.expires_at &&
    new Date(paymentAccess.expires_at) < now;

  if (hasExpiredManualAccess || hasExpiredPaymentAccess) {
    return "expired";
  }

  // Check for active manual access
  if (manualAccess && manualAccess.is_active) {
    return "manual";
  }

  // Check for active payment access
  if (paymentAccess && paymentAccess.is_active) {
    return "active";
  }

  // No access
  return "free";
}

// ============================================================================
// Routes
// ============================================================================

/**
 * List all users with access status
 *
 * GET /api/admin/users
 *
 * Returns:
 * - 401 if no Authorization header
 * - 403 if user is not admin
 * - 200 with array of enriched users
 *
 * Response format:
 * {
 *   "users": [
 *     {
 *       "id": "uuid",
 *       "email": "user@example.com",
 *       "created_at": "2024-01-01T00:00:00Z",
 *       "status": "active" | "manual" | "expired" | "free",
 *       "manual_access": { ... } | null,
 *       "payment_access": { ... } | null
 *     }
 *   ]
 * }
 */
adminUsersRouter.get(
  "/",
  verifyAdmin,
  async (req: Request, res: Response) => {
    try {
      // Fetch all auth users
      const { data: { users }, error: usersError } =
        await supabaseAdmin.auth.admin.listUsers();

      if (usersError) {
        console.error("Error fetching users:", usersError);
        return res.status(500).json({ error: "Failed to fetch users" });
      }

      // Fetch all manual access records
      const { data: manualAccessData, error: manualAccessError } =
        await supabaseAdmin
          .from("user_manual_access")
          .select("*")
          .order("granted_at", { ascending: false });

      if (manualAccessError) {
        console.error("Error fetching manual access:", manualAccessError);
        return res
          .status(500)
          .json({ error: "Failed to fetch manual access data" });
      }

      // Fetch all payment access records
      const { data: paymentAccessData, error: paymentAccessError } =
        await supabaseAdmin
          .from("user_access")
          .select("*")
          .order("created_at", { ascending: false });

      if (paymentAccessError) {
        console.error("Error fetching payment access:", paymentAccessError);
        return res
          .status(500)
          .json({ error: "Failed to fetch payment access data" });
      }

      // Create maps for efficient lookup
      const manualAccessMap = new Map(
        (manualAccessData || []).map((access: any) => [
          access.user_id,
          access,
        ])
      );

      const paymentAccessMap = new Map(
        (paymentAccessData || []).map((access: any) => [
          access.user_id,
          access,
        ])
      );

      // Enrich users with access status
      const enrichedUsers: EnrichedUser[] = (users || []).map((user: any) => {
        const manualAccess = manualAccessMap.get(user.id) || null;
        const paymentAccess = paymentAccessMap.get(user.id) || null;

        const status = calculateUserStatus(manualAccess, paymentAccess);

        return {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          status,
          manual_access: manualAccess,
          payment_access: paymentAccess,
        };
      });

      const response: UsersResponse = { users: enrichedUsers };
      return res.status(200).json(response);
    } catch (error) {
      console.error("Error in GET /api/admin/users:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return res.status(500).json({
        error: "Internal server error",
        details: errorMessage,
      });
    }
  }
);

// ============================================================================
// Export Default
// ============================================================================

export default adminUsersRouter;
