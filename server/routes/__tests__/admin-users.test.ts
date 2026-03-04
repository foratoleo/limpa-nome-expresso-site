/**
 * Integration tests for admin-users API route
 *
 * Tests user list API with enriched status field, admin authentication,
 * and status calculation logic.
 */

import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import request from "supertest";
import { Express } from "express";
import { createClient } from "@supabase/supabase-js";
import express from "express";

// Import the router (will be created in Task 6)
// For now, we'll create a placeholder
const adminUsersRouter = express.Router();

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
app.use("/api/admin/users", adminUsersRouter);

// Test user IDs
const TEST_ADMIN_ID = "00000000-0000-0000-0000-000000000001";
const TEST_USER_ID = "00000000-0000-0000-0000-000000000002";
const TEST_MANUAL_USER_ID = "00000000-0000-0000-0000-000000000003";
const TEST_EXPIRED_USER_ID = "00000000-0000-0000-0000-000000000004";

let adminToken: string | null = null;
let userToken: string | null = null;

// ============================================================================
// Setup
// ============================================================================

beforeAll(async () => {
  // Create admin user
  const { error: adminError } = await supabaseAdmin.auth.admin.createUser({
    id: TEST_ADMIN_ID,
    email: "admin-list-test@example.com",
    password: "test-password-123",
    user_metadata: { role: "admin" },
  });

  if (adminError && !adminError.message.includes("already exists")) {
    throw new Error(`Failed to create test admin: ${adminError.message}`);
  }

  // Create regular user
  const { error: userError } = await supabaseAdmin.auth.admin.createUser({
    id: TEST_USER_ID,
    email: "user-list-test@example.com",
    password: "test-password-123",
    user_metadata: { role: "user" },
  });

  if (userError && !userError.message.includes("already exists")) {
    throw new Error(`Failed to create test user: ${userError.message}`);
  }

  // Create user with manual access
  const { error: manualError } = await supabaseAdmin.auth.admin.createUser({
    id: TEST_MANUAL_USER_ID,
    email: "manual-user-test@example.com",
    password: "test-password-123",
    user_metadata: { role: "user" },
  });

  if (manualError && !manualError.message.includes("already exists")) {
    throw new Error(`Failed to create manual user: ${manualError.message}`);
  }

  // Create user with expired access
  const { error: expiredError } = await supabaseAdmin.auth.admin.createUser({
    id: TEST_EXPIRED_USER_ID,
    email: "expired-user-test@example.com",
    password: "test-password-123",
    user_metadata: { role: "user" },
  });

  if (expiredError && !expiredError.message.includes("already exists")) {
    throw new Error(`Failed to create expired user: ${expiredError.message}`);
  }

  // Generate tokens
  const { data: adminSession } = await supabaseAdmin.auth.admin.createSession({
    user_id: TEST_ADMIN_ID,
  });
  adminToken = adminSession?.access_token || null;

  const { data: userSession } = await supabaseAdmin.auth.admin.createSession({
    user_id: TEST_USER_ID,
  });
  userToken = userSession?.access_token || null;
});

beforeEach(async () => {
  // Cleanup test data
  await supabaseAdmin.from("user_manual_access").delete().eq("user_id", TEST_MANUAL_USER_ID);
  await supabaseAdmin.from("user_manual_access").delete().eq("user_id", TEST_EXPIRED_USER_ID);
  await supabaseAdmin.from("user_access").delete().eq("user_id", TEST_USER_ID);
  await supabaseAdmin.from("user_access").delete().eq("user_id", TEST_MANUAL_USER_ID);
  await supabaseAdmin.from("user_access").delete().eq("user_id", TEST_EXPIRED_USER_ID);
});

// ============================================================================
// Authentication Tests
// ============================================================================

describe("GET /api/admin/users - Authentication", () => {
  it("returns 401 without auth token", async () => {
    const response = await request(app as Express)
      .get("/api/admin/users")
      .expect(401);

    expect(response.body).toMatchObject({
      error: "Unauthorized",
    });
  });

  it("returns 403 for non-admin users", async () => {
    const response = await request(app as Express)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${userToken}`)
      .expect(403);

    expect(response.body).toMatchObject({
      error: "Forbidden: Admin access required",
    });
  });

  it("returns list of users for valid admin token", async () => {
    const response = await request(app as Express)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body).toHaveProperty("users");
    expect(Array.isArray(response.body.users)).toBe(true);
  });
});

// ============================================================================
// Status Calculation Tests
// ============================================================================

describe("GET /api/admin/users - Status Calculation", () => {
  it("returns status 'manual' when user has active manual access", async () => {
    // Create manual access
    await supabaseAdmin
      .from("user_manual_access")
      .insert({
        user_id: TEST_MANUAL_USER_ID,
        granted_by: TEST_ADMIN_ID,
        granted_at: new Date().toISOString(),
        is_active: true,
      });

    const response = await request(app as Express)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    const manualUser = response.body.users.find((u: any) => u.id === TEST_MANUAL_USER_ID);
    expect(manualUser?.status).toBe("manual");
  });

  it("returns status 'active' when user has active payment access", async () => {
    // Create payment access
    await supabaseAdmin
      .from("user_access")
      .insert({
        user_id: TEST_USER_ID,
        access_type: "subscription",
        expires_at: new Date(Date.now() + 86400000).toISOString(),
        is_active: true,
      });

    const response = await request(app as Express)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    const user = response.body.users.find((u: any) => u.id === TEST_USER_ID);
    expect(user?.status).toBe("active");
  });

  it("returns status 'expired' when user's access has expired", async () => {
    // Create expired access
    await supabaseAdmin
      .from("user_manual_access")
      .insert({
        user_id: TEST_EXPIRED_USER_ID,
        granted_by: TEST_ADMIN_ID,
        granted_at: new Date(Date.now() - 86400000).toISOString(),
        expires_at: new Date(Date.now() - 3600000).toISOString(), // Expired 1 hour ago
        is_active: true,
      });

    const response = await request(app as Express)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    const expiredUser = response.body.users.find((u: any) => u.id === TEST_EXPIRED_USER_ID);
    expect(expiredUser?.status).toBe("expired");
  });

  it("returns status 'free' when user has no access", async () => {
    const response = await request(app as Express)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    // Find a user with no access
    const freeUser = response.body.users.find((u: any) => u.id === TEST_USER_ID);
    expect(freeUser?.status).toBe("free");
  });
});

// ============================================================================
// Response Format Tests
// ============================================================================

describe("GET /api/admin/users - Response Format", () => {
  it("returns enriched user objects with correct structure", async () => {
    const response = await request(app as Express)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    const user = response.body.users[0];
    expect(user).toMatchObject({
      id: expect.any(String),
      email: expect.any(String),
      created_at: expect.any(String),
      status: expect.any(String),
      manual_access: expect.anything(),
      payment_access: expect.anything(),
    });
  });

  it("includes manual_access object when user has manual access", async () => {
    await supabaseAdmin
      .from("user_manual_access")
      .insert({
        user_id: TEST_MANUAL_USER_ID,
        granted_by: TEST_ADMIN_ID,
        granted_at: new Date().toISOString(),
        is_active: true,
      });

    const response = await request(app as Express)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    const user = response.body.users.find((u: any) => u.id === TEST_MANUAL_USER_ID);
    expect(user?.manual_access).toBeTruthy();
    expect(user?.manual_access).toMatchObject({
      user_id: TEST_MANUAL_USER_ID,
      granted_by: TEST_ADMIN_ID,
      is_active: true,
    });
  });

  it("includes payment_access object when user has payment access", async () => {
    await supabaseAdmin
      .from("user_access")
      .insert({
        user_id: TEST_USER_ID,
        access_type: "subscription",
        expires_at: new Date(Date.now() + 86400000).toISOString(),
        is_active: true,
      });

    const response = await request(app as Express)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    const user = response.body.users.find((u: any) => u.id === TEST_USER_ID);
    expect(user?.payment_access).toBeTruthy();
    expect(user?.payment_access).toMatchObject({
      user_id: TEST_USER_ID,
      access_type: "subscription",
      is_active: true,
    });
  });
});

// ============================================================================
// Status Priority Tests
// ============================================================================

describe("GET /api/admin/users - Status Priority", () => {
  it("prioritizes 'expired' status over other statuses", async () => {
    // User with both expired access and active manual access
    await supabaseAdmin
      .from("user_manual_access")
      .insert({
        user_id: TEST_EXPIRED_USER_ID,
        granted_by: TEST_ADMIN_ID,
        granted_at: new Date().toISOString(),
        expires_at: new Date(Date.now() - 3600000).toISOString(), // Expired
        is_active: true,
      });

    // Also give them active payment access
    await supabaseAdmin
      .from("user_access")
      .insert({
        user_id: TEST_EXPIRED_USER_ID,
        access_type: "subscription",
        expires_at: new Date(Date.now() + 86400000).toISOString(),
        is_active: true,
      });

    const response = await request(app as Express)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    const user = response.body.users.find((u: any) => u.id === TEST_EXPIRED_USER_ID);
    expect(user?.status).toBe("expired");
  });

  it("prioritizes 'manual' status over 'active' status", async () => {
    // User with both manual and payment access
    await supabaseAdmin
      .from("user_manual_access")
      .insert({
        user_id: TEST_MANUAL_USER_ID,
        granted_by: TEST_ADMIN_ID,
        granted_at: new Date().toISOString(),
        is_active: true,
      });

    await supabaseAdmin
      .from("user_access")
      .insert({
        user_id: TEST_MANUAL_USER_ID,
        access_type: "subscription",
        expires_at: new Date(Date.now() + 86400000).toISOString(),
        is_active: true,
      });

    const response = await request(app as Express)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    const user = response.body.users.find((u: any) => u.id === TEST_MANUAL_USER_ID);
    expect(user?.status).toBe("manual");
  });
});
