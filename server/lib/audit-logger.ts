/**
 * Audit Logging Utility
 *
 * Centralized audit trail logging for all admin operations.
 * Records every admin action with timestamp, admin user ID,
 * target user, and optional metadata.
 *
 * Audit trail is essential for:
 * - Compliance (GDPR, SOC2, etc.)
 * - Security investigations
 * - Operational debugging
 * - Accountability
 */

import { createClient } from "@supabase/supabase-js";

// ============================================================================
// Supabase Admin Client (Service Role)
// ============================================================================

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase environment variables for audit logger");
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
 * Admin action types for audit logging
 */
export type AdminAction =
  | "grant_manual_access"
  | "revoke_manual_access"
  | "reactivate_manual_access"
  | "revoke_payment_access"
  | "reactivate_payment_access"
  | "view_user_list"
  | "export_user_data";

/**
 * Audit log entry structure
 */
export interface AuditLogEntry {
  id: string;
  action: AdminAction;
  target_user_id: string | null;
  admin_user_id: string;
  timestamp: string;
  metadata: Record<string, any>;
}

/**
 * Parameters for logging an admin action
 */
export interface LogAdminActionParams {
  action: AdminAction;
  targetUserId?: string | null;
  adminUserId: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// Main Export Function
// ============================================================================

/**
 * Log an admin action to the admin_audit_log table.
 *
 * @param params - Audit log parameters
 * @returns The created audit log entry
 * @throws Error if database insert fails
 *
 * @example
 * ```typescript
 * import { logAdminAction } from "../lib/audit-logger";
 *
 * await logAdminAction({
 *   action: "grant_manual_access",
 *   targetUserId: "user-uuid",
 *   adminUserId: "admin-uuid",
 *   metadata: {
 *     reason: "VIP customer support",
 *     expires_at: "2024-12-31T23:59:59Z"
 *   }
 * });
 * ```
 */
export async function logAdminAction(params: LogAdminActionParams): Promise<AuditLogEntry> {
  const { action, targetUserId = null, adminUserId, metadata = {} } = params;

  try {
    // Insert audit log entry
    const { data, error } = await supabaseAdmin
      .from("admin_audit_log")
      .insert({
        action,
        target_user_id: targetUserId,
        admin_user_id: adminUserId,
        timestamp: new Date().toISOString(),
        metadata,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to log admin action: ${error.message}`);
    }

    if (!data) {
      throw new Error("Failed to create audit log entry: No data returned");
    }

    return data as AuditLogEntry;
  } catch (error) {
    // Log error but don't throw - audit failures shouldn't break admin operations
    console.error("Audit logging error:", error);

    // Re-throw if caller needs to handle the error
    throw error;
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Query audit logs for a specific target user
 *
 * @param targetUserId - User ID to query logs for
 * @param limit - Maximum number of logs to return (default: 100)
 * @returns Array of audit log entries
 */
export async function getAuditLogsForUser(
  targetUserId: string,
  limit: number = 100
): Promise<AuditLogEntry[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("admin_audit_log")
      .select("*")
      .eq("target_user_id", targetUserId)
      .order("timestamp", { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to query audit logs: ${error.message}`);
    }

    return (data || []) as AuditLogEntry[];
  } catch (error) {
    console.error("Error querying audit logs:", error);
    throw error;
  }
}

/**
 * Query audit logs for a specific admin user
 *
 * @param adminUserId - Admin user ID to query logs for
 * @param limit - Maximum number of logs to return (default: 100)
 * @returns Array of audit log entries
 */
export async function getAuditLogsByAdmin(
  adminUserId: string,
  limit: number = 100
): Promise<AuditLogEntry[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("admin_audit_log")
      .select("*")
      .eq("admin_user_id", adminUserId)
      .order("timestamp", { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to query audit logs: ${error.message}`);
    }

    return (data || []) as AuditLogEntry[];
  } catch (error) {
    console.error("Error querying audit logs:", error);
    throw error;
  }
}

/**
 * Query recent audit logs across all users
 *
 * @param limit - Maximum number of logs to return (default: 50)
 * @returns Array of audit log entries
 */
export async function getRecentAuditLogs(limit: number = 50): Promise<AuditLogEntry[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("admin_audit_log")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to query recent audit logs: ${error.message}`);
    }

    return (data || []) as AuditLogEntry[];
  } catch (error) {
    console.error("Error querying recent audit logs:", error);
    throw error;
  }
}

// ============================================================================
// Export Default
// ============================================================================

export default logAdminAction;
