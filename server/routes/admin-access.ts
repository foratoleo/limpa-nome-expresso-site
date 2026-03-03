import { Router, Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";

export const adminAccessRouter = Router();

// Initialize Supabase admin client with service role key
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

/**
 * Middleware to verify admin role
 */
async function verifyAdmin(req: Request, res: Response, next: Function) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // Check if user has admin role
    const userRole = user.user_metadata?.role;
    if (userRole !== "admin") {
      return res.status(403).json({ error: "Forbidden: Admin access required" });
    }

    // Attach user to request for use in handlers
    (req as any).user = user;
    next();
  } catch (error) {
    console.error("Admin verification error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * List all manual access grants
 * GET /api/admin/access/list
 */
adminAccessRouter.get("/list", verifyAdmin, async (req: Request, res: Response) => {
  try {
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

    const userEmails = new Map<string, string>(
      (users || []).map(u => [u.id, u.email as string]).filter((entry): entry is [string, string] => !!entry[1])
    );
    const adminUser = (req as any).user;

    // Enrich access data with emails
    const enrichedAccesses = accesses?.map(access => ({
      ...access,
      user_email: userEmails.get(access.user_id) || null,
      granter_email: access.granted_by === adminUser.id ? adminUser.email : userEmails.get(access.granted_by) || null,
    })) || [];

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
    const { email, reason, expires_at } = req.body;

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
      return res.status(404).json({ error: "User not found" });
    }

    const adminUser = (req as any).user;

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
 */
adminAccessRouter.delete("/:userId", verifyAdmin, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Set is_active to false instead of deleting
    const { data: access, error: updateError } = await supabaseAdmin
      .from("user_manual_access")
      .update({ is_active: false })
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

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Set is_active to true
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
