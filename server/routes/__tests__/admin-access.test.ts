/**
 * Integration tests for admin-access API routes
 *
 * Tests admin authentication middleware, grant/revoke operations,
 * soft delete pattern, and audit trail logging.
 */

import { describe, it, expect, beforeAll, afterEach, beforeEach } from "vitest";
import request from "supertest";
import { Express } from "express";
import { createClient } from "@supabase/supabase-js";
import { adminAccessRouter } from "../admin-access";
import express from "express";

// ============================================================================
// Test Setup
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

// Create test Express app
const app = express();
app.use(express.json());
app.use("/api/admin/access", adminAccessRouter);

// Test user IDs
const TEST_ADMIN_ID = "00000000-0000-0000-0000-000000000001";
const TEST_USER_ID = "00000000-0000-0000-0000-000000000002";

let adminToken: string | null = null;
let userToken: string | null = null;

// ============================================================================
// Setup and Teardown
// ============================================================================

beforeAll(async () => {
  // Create admin user with admin role
  const { data: adminUser, error: adminError } = await supabaseAdmin.auth.admin.createUser({
    id: TEST_ADMIN_ID,
    email: "admin-test@example.com",
    password: "test-password-123",
    user_metadata: { role: "admin" },
  });

  if (adminError && !adminError.message.includes("already exists")) {
    throw new Error(`Failed to create test admin: ${adminError.message}`);
  }

  // Create regular user
  const { data: regularUser, error: userError } = await supabaseAdmin.auth.admin.createUser({
    id: TEST_USER_ID,
    email: "user-test@example.com",
    password: "test-password-123",
    user_metadata: { role: "user" },
  });

  if (userError && !userError.message.includes("already exists")) {
    throw new Error(`Failed to create test user: ${userError.message}`);
  }

  // Generate admin token
  const { data: adminSession } = await supabaseAdmin.auth.admin.createSession({
    user_id: TEST_ADMIN_ID,
  });
  adminToken = adminSession?.access_token || null;

  // Generate user token
  const { data: userSession } = await supabaseAdmin.auth.admin.createSession({
    user_id: TEST_USER_ID,
  });
  userToken = userSession?.access_token || null;
});

beforeEach(async () => {
  // Cleanup any existing test data
  await supabaseAdmin
    .from("user_manual_access")
    .delete()
    .eq("user_id", TEST_USER_ID);
});

afterEach(async () => {
  // Cleanup after each test
  await supabaseAdmin
    .from("user_manual_access")
    .delete()
    .eq("user_id", TEST_USER_ID);
});

// ============================================================================
// Admin Authentication Middleware Tests
// ============================================================================

describe("verifyAdmin middleware", () => {
  it("blocks requests without Bearer token", async () => {
    const response = await request(app as Express)
      .get("/api/admin/access/list")
      .expect(401);

    expect(response.body).toEqual({
      error: "Unauthorized",
    });
  });

  it("blocks non-admin users with 403", async () => {
    const response = await request(app as Express)
      .get("/api/admin/access/list")
      .set("Authorization", `Bearer ${userToken}`)
      .expect(403);

    expect(response.body).toEqual({
      error: "Forbidden: Admin access required",
    });
  });

  it("allows requests with valid admin token", async () => {
    const response = await request(app as Express)
      .get("/api/admin/access/list")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body).toHaveProperty("accesses");
    expect(Array.isArray(response.body.accesses)).toBe(true);
  });
});

// ============================================================================
// Grant Access Tests
// ============================================================================

describe("POST /grant", () => {
  it("creates user_manual_access record with correct fields", async () => {
    const response = await request(app as Express)
      .post("/api/admin/access/grant")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        email: "user-test@example.com",
        reason: "Test manual access",
        expires_at: new Date(Date.now() + 86400000).toISOString(),
      })
      .expect(201);

    expect(response.body).toMatchObject({
      success: true,
      message: "Access granted successfully",
    });
    expect(response.body.access).toMatchObject({
      user_id: TEST_USER_ID,
      granted_by: TEST_ADMIN_ID,
      reason: "Test manual access",
      is_active: true,
    });
  });

  it("returns 409 if user already has active manual access", async () => {
    // Create first access
    await request(app as Express)
      .post("/api/admin/access/grant")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        email: "user-test@example.com",
        reason: "First access",
      });

    // Try to create second access
    const response = await request(app as Express)
      .post("/api/admin/access/grant")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        email: "user-test@example.com",
        reason: "Second access",
      })
      .expect(409);

    expect(response.body).toMatchObject({
      error: "User already has active manual access",
    });
  });

  it("accepts optional reason and expires_at fields", async () => {
    const response = await request(app as Express)
      .post("/api/admin/access/grant")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        email: "user-test@example.com",
      })
      .expect(201);

    expect(response.body.access).toMatchObject({
      reason: null,
      expires_at: null,
    });
  });
});

// ============================================================================
// Revoke Access Tests
// ============================================================================

describe("DELETE /:userId", () => {
  it("sets is_active to false (soft delete)", async () => {
    // First grant access
    await request(app as Express)
      .post("/api/admin/access/grant")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        email: "user-test@example.com",
        reason: "Test access",
      });

    // Then revoke it
    const revokeResponse = await request(app as Express)
      .delete(`/api/admin/access/${TEST_USER_ID}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(revokeResponse.body).toMatchObject({
      success: true,
      message: "Access revoked successfully",
    });

    // Verify soft delete in database
    const { data: access } = await supabaseAdmin
      .from("user_manual_access")
      .select("*")
      .eq("user_id", TEST_USER_ID)
      .single();

    expect(access?.is_active).toBe(false);
  });

  it("sets revoked_at, revoked_by, revoke_reason fields", async () => {
    // Grant access first
    await request(app as Express)
      .post("/api/admin/access/grant")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        email: "user-test@example.com",
      });

    // Revoke with reason
    const revokeReason = "User requested removal";
    const revokeResponse = await request(app as Express)
      .delete(`/api/admin/access/${TEST_USER_ID}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ reason: revokeReason })
      .expect(200);

    // Verify audit fields in database
    const { data: access } = await supabaseAdmin
      .from("user_manual_access")
      .select("*")
      .eq("user_id", TEST_USER_ID)
      .single();

    expect(access?.revoked_by).toBe(TEST_ADMIN_ID);
    expect(access?.revoke_reason).toBe(revokeReason);
    expect(access?.revoked_at).toBeDefined();
  });

  it("returns 404 if no active access found", async () => {
    const response = await request(app as Express)
      .delete(`/api/admin/access/${TEST_USER_ID}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(404);

    expect(response.body).toMatchObject({
      error: "No active access found for this user",
    });
  });

  it("creates audit log entry for revoke operation", async () => {
    // Grant access first
    await request(app as Express)
      .post("/api/admin/access/grant")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        email: "user-test@example.com",
      });

    // Revoke access
    await request(app as Express)
      .delete(`/api/admin/access/${TEST_USER_ID}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ reason: "Test revoke" });

    // Check audit log (if admin_audit_log table exists)
    const { data: auditLogs, error } = await supabaseAdmin
      .from("admin_audit_log")
      .select("*")
      .eq("action", "revoke_manual_access")
      .eq("target_user_id", TEST_USER_ID)
      .maybeSingle();

    // If audit log table exists, verify entry
    if (!error) {
      expect(auditLogs).toMatchObject({
        action: "revoke_manual_access",
        target_user_id: TEST_USER_ID,
        admin_user_id: TEST_ADMIN_ID,
      });
    }
  });
});

// ============================================================================
// List Access Tests
// ============================================================================

describe("GET /list", () => {
  it("returns all manual access records", async () => {
    // Grant some access
    await request(app as Express)
      .post("/api/admin/access/grant")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        email: "user-test@example.com",
        reason: "Test access",
      });

    const response = await request(app as Express)
      .get("/api/admin/access/list")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body).toHaveProperty("accesses");
    expect(Array.isArray(response.body.accesses)).toBe(true);
    expect(response.body.accesses.length).toBeGreaterThan(0);
  });
});

// ============================================================================
// Reactivate Access Tests
// ============================================================================

describe("POST /:userId/reactivate", () => {
  it("sets is_active back to true", async () => {
    // Grant and then revoke access
    await request(app as Express)
      .post("/api/admin/access/grant")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ email: "user-test@example.com" });

    await request(app as Express)
      .delete(`/api/admin/access/${TEST_USER_ID}`)
      .set("Authorization", `Bearer ${adminToken}`);

    // Reactivate
    const response = await request(app as Express)
      .post(`/api/admin/access/${TEST_USER_ID}/reactivate`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body).toMatchObject({
      success: true,
      message: "Access reactivated successfully",
    });

    // Verify in database
    const { data: access } = await supabaseAdmin
      .from("user_manual_access")
      .select("*")
      .eq("user_id", TEST_USER_ID)
      .single();

    expect(access?.is_active).toBe(true);
  });

  it("preserves original granted_by and granted_at fields", async () => {
    // Grant access
    await request(app as Express)
      .post("/api/admin/access/grant")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ email: "user-test@example.com" });

    const { data: originalAccess } = await supabaseAdmin
      .from("user_manual_access")
      .select("*")
      .eq("user_id", TEST_USER_ID)
      .single();

    const originalGrantedBy = originalAccess?.granted_by;
    const originalGrantedAt = originalAccess?.granted_at;

    // Revoke and reactivate
    await request(app as Express)
      .delete(`/api/admin/access/${TEST_USER_ID}`)
      .set("Authorization", `Bearer ${adminToken}`);

    await request(app as Express)
      .post(`/api/admin/access/${TEST_USER_ID}/reactivate`)
      .set("Authorization", `Bearer ${adminToken}`);

    // Verify original fields preserved
    const { data: reactivatedAccess } = await supabaseAdmin
      .from("user_manual_access")
      .select("*")
      .eq("user_id", TEST_USER_ID)
      .single();

    expect(reactivatedAccess?.granted_by).toBe(originalGrantedBy);
    expect(reactivatedAccess?.granted_at).toBe(originalGrantedAt);
  });
});
