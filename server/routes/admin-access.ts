import { Router, Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { verifyAdmin, type AuthenticatedRequest } from "../middleware/admin-auth";
import { logAdminAction } from "../lib/audit-logger";

export const adminAccessRouter = Router();

// ============================================================================
// Type Definitions
// ============================================================================

type UserStatus = "active" | "pending" | "expired" | "manual" | "free";

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate user status based on access record
 * @param access - User manual access record
 * @returns Calculated status string
 */
function calculateUserStatus(access: any): UserStatus {
  const now = new Date();
  const expiresAt = access.expires_at ? new Date(access.expires_at) : null;

  // Check if access is revoked
  if (access.revoked_at) {
    return "expired";
  }

  // Check if access is inactive
  if (!access.is_active) {
    return "expired";
  }

  // Check if access has expired
  if (expiresAt && expiresAt < now) {
    return "expired";
  }

  // Active manual access
  return "manual";
}

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
// Zod Validation Schemas
// ============================================================================

/**
 * Validation schema for granting manual access
 */
export const grantAccessSchema = z.object({
  email: z.string().email("Email inválido"),
  reason: z.string().optional(),
  expires_at: z.string().datetime().nullable().optional(),
});

/**
 * Validation schema for revoking access
 */
export const revokeAccessSchema = z.object({
  reason: z.string().optional(),
});

/**
 * List all manual access grants with optional search
 * GET /api/admin/access/list?search=query
 *
 * Query parameters:
 * - search: Optional search term to filter users by email or name
 */
adminAccessRouter.get("/list", verifyAdmin, async (req: Request, res: Response) => {
  try {
    // Extract search parameter from query string
    const { search } = req.query;

    // Get all manual access records
    const { data: accesses, error } = await supabaseAdmin
      .from("user_manual_access")
      .select("*")
      .order("granted_at", { ascending: false });

    if (error) {
      console.error("Error fetching manual access list:", error);
      return res.status(500).json({ error: "Failed to fetch access list" });
    }

    // Get all users to fetch emails
    const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers();

    if (usersError) {
      console.error("Error fetching users:", usersError);
      return res.status(500).json({ error: "Failed to fetch users" });
    }

    // Build user email map for enrichment
    const userEmails = new Map<string, string>(
      (users || []).map(u => [u.id, u.email as string]).filter((entry): entry is [string, string] => !!entry[1])
    );

    // Get admin user for granter email resolution
    const adminUser = (req as any).user;

    // Enrich access data with emails and calculated status
    let enrichedAccesses = accesses?.map(access => ({
      ...access,
      user_email: userEmails.get(access.user_id) || null,
      granter_email: access.granted_by === adminUser.id ? adminUser.email : userEmails.get(access.granted_by) || null,
      status: calculateUserStatus(access),
    })) || [];

    // Apply search filter if provided
    if (search && typeof search === 'string' && search.trim()) {
      const searchLower = search.toLowerCase().trim();

      // Filter by email or user metadata name
      enrichedAccesses = enrichedAccesses.filter(access => {
        // Check email match
        if (access.user_email?.toLowerCase().includes(searchLower)) {
          return true;
        }

        // Check user metadata name match (requires fetching full user objects)
        const user = (users || []).find(u => u.id === access.user_id);
        const userName = user?.user_metadata?.name;
        if (userName && typeof userName === 'string' && userName.toLowerCase().includes(searchLower)) {
          return true;
        }

        return false;
      });
    }

    return res.status(200).json({ accesses: enrichedAccesses });
  } catch (error) {
    console.error("Error in GET /list:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: "Internal server error", details: errorMessage });
  }
});

/**
 * Grant manual access to a user
 * POST /api/admin/access/grant
 * Body: { email: string, reason?: string, expires_at?: string }
 */
adminAccessRouter.post("/grant", verifyAdmin, async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validationResult = grantAccessSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: validationResult.error.errors,
      });
    }

    const { email, reason, expires_at } = validationResult.data;
    const adminUser = (req as AuthenticatedRequest).user!;

    // Find user by email
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      console.error("Error listing users:", listError);
      return res.status(500).json({ error: "Failed to lookup user" });
    }

    const targetUser = users?.find((u: any) => u.email === email);

    if (!targetUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if user already has active access
    const { data: existingAccess } = await supabaseAdmin
      .from("user_manual_access")
      .select("*")
      .eq("user_id", targetUser.id)
      .eq("is_active", true)
      .maybeSingle();

    if (existingAccess) {
      return res.status(409).json({ error: "User already has active manual access" });
    }

    // Grant access
    const { data: access, error: insertError } = await supabaseAdmin
      .from("user_manual_access")
      .insert({
        user_id: targetUser.id,
        granted_by: adminUser.id,
        granted_at: new Date().toISOString(),
        reason: reason || null,
        expires_at: expires_at || null,
        is_active: true,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error granting access:", insertError);
      return res.status(500).json({ error: "Failed to grant access" });
    }

    // Log audit entry
    try {
      await logAdminAction({
        action: "grant_manual_access",
        targetUserId: targetUser.id,
        adminUserId: adminUser.id,
        metadata: {
          email: targetUser.email,
          reason: reason || null,
          expires_at: expires_at || null,
        },
      });
    } catch (auditError) {
      // Log failure shouldn't block the operation
      console.error("Failed to log audit entry:", auditError);
    }

    return res.status(201).json({
      success: true,
      message: "Access granted successfully",
      access,
    });
  } catch (error) {
    console.error("Error in POST /grant:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: "Internal server error", details: errorMessage });
  }
});

/**
 * Revoke manual access from a user
 * DELETE /api/admin/access/:userId
 * Body (optional): { reason: string }
 */
adminAccessRouter.delete("/:userId", verifyAdmin, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const adminUser = (req as AuthenticatedRequest).user!;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Validate optional request body
    let revokeReason: string | undefined;
    if (req.body && Object.keys(req.body).length > 0) {
      const validationResult = revokeAccessSchema.safeParse(req.body);
      if (validationResult.success) {
        revokeReason = validationResult.data.reason;
      }
    }

    // Soft delete with audit fields
    const { data: access, error: updateError } = await supabaseAdmin
      .from("user_manual_access")
      .update({
        is_active: false,
        revoked_at: new Date().toISOString(),
        revoked_by: adminUser.id,
        revoke_reason: revokeReason || null,
      })
      .eq("user_id", userId)
      .eq("is_active", true)
      .select()
      .maybeSingle();

    if (updateError) {
      console.error("Error revoking access:", updateError);
      return res.status(500).json({ error: "Failed to revoke access" });
    }

    if (!access) {
      return res.status(404).json({ error: "No active access found for this user" });
    }

    // Log audit entry
    try {
      await logAdminAction({
        action: "revoke_manual_access",
        targetUserId: userId,
        adminUserId: adminUser.id,
        metadata: {
          reason: revokeReason || "No reason provided",
          access_id: access.id,
        },
      });
    } catch (auditError) {
      console.error("Failed to log audit entry:", auditError);
    }

    return res.status(200).json({
      success: true,
      message: "Access revoked successfully",
      access,
    });
  } catch (error) {
    console.error("Error in DELETE /:userId:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: "Internal server error", details: errorMessage });
  }
});

/**
 * Reactivate manual access for a user
 * POST /api/admin/access/:userId/reactivate
 */
adminAccessRouter.post("/:userId/reactivate", verifyAdmin, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const adminUser = (req as AuthenticatedRequest).user!;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Set is_active to true (preserves original granted_by and granted_at)
    const { data: access, error: updateError } = await supabaseAdmin
      .from("user_manual_access")
      .update({ is_active: true })
      .eq("user_id", userId)
      .select()
      .maybeSingle();

    if (updateError) {
      console.error("Error reactivating access:", updateError);
      return res.status(500).json({ error: "Failed to reactivate access" });
    }

    if (!access) {
      return res.status(404).json({ error: "No access found for this user" });
    }

    // Log audit entry
    try {
      await logAdminAction({
        action: "reactivate_manual_access",
        targetUserId: userId,
        adminUserId: adminUser.id,
        metadata: {
          access_id: access.id,
          original_granted_by: access.granted_by,
          original_granted_at: access.granted_at,
        },
      });
    } catch (auditError) {
      console.error("Failed to log audit entry:", auditError);
    }

    return res.status(200).json({
      success: true,
      message: "Access reactivated successfully",
      access,
    });
  } catch (error) {
    console.error("Error in POST /:userId/reactivate:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: "Internal server error", details: errorMessage });
  }
});

/**
 * Check if an email has manual access
 * GET /api/admin/access/check/:email
 */
adminAccessRouter.get("/check/:email", async (req: Request, res: Response) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Find user by email
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      console.error("Error listing users:", listError);
      return res.status(500).json({ error: "Failed to lookup user" });
    }

    const targetUser = users?.find((u: any) => u.email === email);

    if (!targetUser) {
      return res.status(200).json({
        hasAccess: false,
        access: null,
      });
    }

    // Check for active access
    const now = new Date().toISOString();
    const { data: access, error } = await supabaseAdmin
      .from("user_manual_access")
      .select("*")
      .eq("user_id", targetUser.id)
      .eq("is_active", true)
      .or(`expires_at.is.null,expires_at.gte.${now}`)
      .maybeSingle();

    if (error) {
      console.error("Error checking access:", error);
      return res.status(500).json({ error: "Failed to check access" });
    }

    return res.status(200).json({
      hasAccess: !!access,
      access: access || null,
    });
  } catch (error) {
    console.error("Error in GET /check/:email:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: "Internal server error", details: errorMessage });
  }
});
