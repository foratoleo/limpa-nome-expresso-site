/**
 * Test Configuration and Fixtures for Database Tests
 *
 * Provides Supabase admin client and helper functions for database testing.
 * Tests verify indexes, RLS policies, query performance, and expiration logic.
 */

import { createClient } from '@supabase/supabase-js';

// ============================================================================
// Environment Setup
// ============================================================================

export const supabaseUrl = process.env.VITE_SUPABASE_URL!;
export const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Validate environment variables
if (!supabaseUrl) {
  throw new Error(
    'VITE_SUPABASE_URL environment variable is required. ' +
    'Set it in .env.test or export it before running tests.'
  );
}

if (!supabaseServiceKey) {
  throw new Error(
    'SUPABASE_SERVICE_ROLE_KEY environment variable is required. ' +
    'Set it in .env.test or export it before running tests. ' +
    'Get it from: https://supabase.com/dashboard/project/_/settings/api'
  );
}

// ============================================================================
// Supabase Admin Client (Service Role)
// ============================================================================

/**
 * Supabase client with service role privileges.
 * Bypasses RLS policies for admin operations in tests.
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// ============================================================================
// Test Data Fixtures
// ============================================================================

/**
 * Test user ID for database operations.
 * Uses a fixed UUID for consistent test data cleanup.
 */
export const TEST_USER_ID = '00000000-0000-0000-0000-000000000001';

/**
 * Helper to create a temporary test user access record.
 * Remember to cleanup after test.
 */
export async function createTestUserAccess(overrides: Partial<{
  user_id: string;
  access_type: 'subscription' | 'one_time';
  payment_id: string | null;
  expires_at: string;
  is_active: boolean;
}> = {}) {
  const { data, error } = await supabaseAdmin
    .from('user_access')
    .insert({
      user_id: overrides.user_id || TEST_USER_ID,
      access_type: overrides.access_type || 'one_time',
      payment_id: overrides.payment_id || null,
      expires_at: overrides.expires_at || new Date(Date.now() + 86400000).toISOString(),
      is_active: overrides.is_active !== undefined ? overrides.is_active : true,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create test user_access: ${error.message}`);
  }

  return data;
}

/**
 * Helper to create a temporary test manual access record.
 * Remember to cleanup after test.
 */
export async function createTestManualAccess(overrides: Partial<{
  user_id: string;
  granted_by: string;
  expires_at: string | null;
  reason: string;
  is_active: boolean;
}> = {}) {
  const { data, error } = await supabaseAdmin
    .from('user_manual_access')
    .insert({
      user_id: overrides.user_id || TEST_USER_ID,
      granted_by: overrides.granted_by || '00000000-0000-0000-0000-000000000002',
      expires_at: overrides.expires_at !== undefined ? overrides.expires_at : null,
      reason: overrides.reason || 'Test access',
      is_active: overrides.is_active !== undefined ? overrides.is_active : true,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create test user_manual_access: ${error.message}`);
  }

  return data;
}

/**
 * Helper to cleanup test data by ID.
 */
export async function cleanupTestAccess(table: 'user_access' | 'user_manual_access', id: string) {
  const { error } = await supabaseAdmin
    .from(table)
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to cleanup test ${table}: ${error.message}`);
  }
}

/**
 * Helper to cleanup all test data for a user.
 */
export async function cleanupAllTestData(userId: string = TEST_USER_ID) {
  await supabaseAdmin.from('user_access').delete().eq('user_id', userId);
  await supabaseAdmin.from('user_manual_access').delete().eq('user_id', userId);
}

// ============================================================================
// Database Query Helpers
// ============================================================================

/**
 * Query pg_indexes to get index definitions for a table.
 */
export async function getIndexDefinition(tableName: string): Promise<Array<{
  indexname: string;
  indexdef: string;
}>> {
  const { data, error } = await supabaseAdmin.rpc('query_indexes', { table_name: tableName });

  // Fallback: Direct query if RPC not available
  if (error) {
    const { data: indexes, error: queryError } = await supabaseAdmin
      .rpc('exec_sql', {
        sql: `
          SELECT indexname, indexdef
          FROM pg_indexes
          WHERE tablename = '${tableName}'
          ORDER BY indexname
        `
      });

    if (queryError) {
      throw new Error(`Failed to query indexes for ${tableName}: ${queryError.message}`);
    }

    return indexes || [];
  }

  return data || [];
}

/**
 * Query pg_policies to get RLS policies for a table.
 */
export async function getPolicies(tableName: string): Promise<Array<{
  policyname: string;
  permissive: boolean;
  roles: string;
  cmd: string;
}>> {
  const { data, error } = await supabaseAdmin
    .rpc('exec_sql', {
      sql: `
        SELECT
          policyname,
          permissive,
          roles,
          cmd
        FROM pg_policies
        WHERE tablename = '${tableName}'
        ORDER BY policyname
      `
    });

  if (error) {
    throw new Error(`Failed to query policies for ${tableName}: ${error.message}`);
  }

  return data || [];
}

/**
 * Run EXPLAIN ANALYZE on a query and return the execution plan.
 */
export async function explainQuery(sql: string): Promise<string> {
  const { data, error } = await supabaseAdmin
    .rpc('exec_sql', {
      sql: `EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT) ${sql}`
    });

  if (error) {
    throw new Error(`Failed to explain query: ${error.message}`);
  }

  // Return the execution plan as a string
  return data?.map((row: any) => row['QUERY PLAN']).join('\n') || '';
}

/**
 * Execute a SQL query and return the results.
 */
export async function executeQuery<T = any>(sql: string): Promise<T[]> {
  const { data, error } = await supabaseAdmin.rpc('exec_sql', { sql });

  if (error) {
    throw new Error(`Failed to execute query: ${error.message}`);
  }

  return data || [];
}

// ============================================================================
// Test Lifecycle Helpers
// ============================================================================

/**
 * Setup function to run before all database tests.
 * Ensures database is accessible and tables exist.
 */
export async function setupDatabaseTests() {
  try {
    // Test basic connection
    const { error } = await supabaseAdmin
      .from('user_access')
      .select('id')
      .limit(1);

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Database connection failed: ${error.message}`);
    }

    console.log('✅ Database connection verified');
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    throw error;
  }
}

/**
 * Teardown function to run after all database tests.
 * Cleans up any remaining test data.
 */
export async function teardownDatabaseTests() {
  try {
    await cleanupAllTestData();
    console.log('✅ Test data cleaned up');
  } catch (error) {
    console.error('❌ Test cleanup failed:', error);
  }
}
