/**
 * Admin Authentication Middleware
 *
 * Verifies admin role for protected admin routes.
 * Uses Supabase service role client to validate JWT tokens
 * and check user_metadata.role === "admin".
 *
 * This middleware should be used on all admin-only endpoints
 * to prevent unauthorized access.
 */

import { Request, Response, NextFunction } from "express";
import { createClient } from "@supabase/supabase-js";

// ============================================================================
// Supabase Admin Client (Service Role)
// ============================================================================

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase environment variables for admin middleware");
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// ============================================================================
// TypeScript Types
// ============================================================================

/**
 * Extended Request type with authenticated user attached
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    user_metadata: {
      role?: string;
      [key: string]: any;
    };
  };
}

// ============================================================================
// Middleware Function
// ============================================================================

/**
 * Middleware to verify admin role before allowing access to protected routes.
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 *
 * @returns 401 if no token or invalid token
 * @returns 403 if token valid but user not admin
 * @returns 500 if unexpected error occurs
 *
 * @example
 * ```typescript
 * import { verifyAdmin } from "../middleware/admin-auth";
 *
 * adminRouter.get("/users", verifyAdmin, async (req, res) => {
 *   const adminUser = (req as AuthenticatedRequest).user;
 *   // ... handle request
 * });
 * ```
 */
export async function verifyAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Check for Authorization header with Bearer token
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ error: "Unauthorized: Missing or invalid Authorization header" });
      return;
    }

    // Extract token from header
    const token = authHeader.replace("Bearer ", "");

    // Validate token with Supabase
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
      return;
    }

    // Check if user has admin role in user_metadata
    const userRole = user.user_metadata?.role;

    if (userRole !== "admin") {
      res.status(403).json({
        error: "Forbidden: Admin access required",
        details: `User role is '${userRole || 'undefined'}', expected 'admin'`,
      });
      return;
    }

    // Attach authenticated user to request for use in handlers
    (req as AuthenticatedRequest).user = user;

    // Proceed to next middleware/route handler
    next();
  } catch (error) {
    // Log error for debugging
    console.error("Admin verification error:", error);

    // Return generic error message
    res.status(500).json({
      error: "Internal server error",
      details: "An error occurred while verifying admin privileges",
    });
  }
}

// ============================================================================
// Export Default
// ============================================================================

export default verifyAdmin;
