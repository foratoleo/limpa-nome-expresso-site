/**
 * Query Performance and Expiration Tests
 *
 * Verifies query performance benchmarks and expiration checking logic.
 * Tests ensure queries execute in <100ms and properly filter expired records.
 *
 * Requirements:
 * - DB-01: Query execution time < 100ms for access checks
 * - DB-04: Queries check expires_at >= NOW() for active access
 * - DB-03: Soft delete pattern (is_active flag) preserves audit trail
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  supabaseAdmin,
  TEST_USER_ID,
  cleanupTestAccess,
} from './conftest';

describe('Query Performance and Expiration', () => {
  describe('Expiration checking (DB-04)', () => {
    it('should exclude expired user_access records', async () => {
      // Create record with expiration in the past
      const expiredDate = new Date(Date.now() - 86400000).toISOString(); // Yesterday

      const { data: inserted, error: insertError } = await supabaseAdmin
        .from('user_access')
        .insert({
          user_id: TEST_USER_ID,
          access_type: 'one_time',
          expires_at: expiredDate,
          is_active: true,
        })
        .select()
        .single();

      expect(insertError).toBeNull();
      expect(inserted).toBeDefined();

      // Query for active access with expires_at >= NOW()
      const { data: activeAccess, error: queryError } = await supabaseAdmin
        .from('user_access')
        .select('*')
        .eq('user_id', TEST_USER_ID)
        .eq('is_active', true)
        .gte('expires_at', new Date().toISOString());

      expect(queryError).toBeNull();
      // Expired record should NOT be in results
      expect(activeAccess).toBeNull();

      // Cleanup
      if (inserted) {
        await cleanupTestAccess('user_access', inserted.id);
      }
    });

    it('should exclude expired user_manual_access records', async () => {
      // Create record with expiration in the past
      const expiredDate = new Date(Date.now() - 86400000).toISOString(); // Yesterday

      const { data: inserted, error: insertError } = await supabaseAdmin
        .from('user_manual_access')
        .insert({
          user_id: TEST_USER_ID,
          granted_by: '00000000-0000-0000-0000-000000000002',
          expires_at: expiredDate,
          is_active: true,
        })
        .select()
        .single();

      expect(insertError).toBeNull();
      expect(inserted).toBeDefined();

      // Query for active access with expires_at IS NULL OR expires_at > NOW()
      const now = new Date().toISOString();
      const { data: activeAccess, error: queryError } = await supabaseAdmin
        .from('user_manual_access')
        .select('*')
        .eq('user_id', TEST_USER_ID)
        .eq('is_active', true)
        .or(`expires_at.is.null,expires_at.gte.${now}`);

      expect(queryError).toBeNull();
      // Expired record should NOT be in results
      expect(activeAccess).toBeNull();

      // Cleanup
      if (inserted) {
        await cleanupTestAccess('user_manual_access', inserted.id);
      }
    });

    it('should include user_access records with NULL expires_at (no expiration)', async () => {
      // Note: user_access schema requires expires_at, so we test with far future date
      const futureDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(); // 1 year

      const { data: inserted, error: insertError } = await supabaseAdmin
        .from('user_access')
        .insert({
          user_id: TEST_USER_ID,
          access_type: 'one_time',
          expires_at: futureDate,
          is_active: true,
        })
        .select()
        .single();

      expect(insertError).toBeNull();
      expect(inserted).toBeDefined();

      // Query for active access
      const { data: activeAccess, error: queryError } = await supabaseAdmin
        .from('user_access')
        .select('*')
        .eq('user_id', TEST_USER_ID)
        .eq('is_active', true)
        .gte('expires_at', new Date().toISOString());

      expect(queryError).toBeNull();
      // Record should be in results
      expect(activeAccess).toBeDefined();
      expect(activeAccess).toHaveLength(1);

      // Cleanup
      if (inserted) {
        await cleanupTestAccess('user_access', inserted.id);
      }
    });

    it('should include user_manual_access records with NULL expires_at', async () => {
      const { data: inserted, error: insertError } = await supabaseAdmin
        .from('user_manual_access')
        .insert({
          user_id: TEST_USER_ID,
          granted_by: '00000000-0000-0000-0000-000000000002',
          expires_at: null,
          is_active: true,
        })
        .select()
        .single();

      expect(insertError).toBeNull();
      expect(inserted).toBeDefined();

      // Query for active access with NULL or future expiration
      const now = new Date().toISOString();
      const { data: activeAccess, error: queryError } = await supabaseAdmin
        .from('user_manual_access')
        .select('*')
        .eq('user_id', TEST_USER_ID)
        .eq('is_active', true)
        .or(`expires_at.is.null,expires_at.gte.${now}`);

      expect(queryError).toBeNull();
      // Record should be in results
      expect(activeAccess).toBeDefined();
      expect(activeAccess).toHaveLength(1);

      // Cleanup
      if (inserted) {
        await cleanupTestAccess('user_manual_access', inserted.id);
      }
    });
  });

  describe('Query performance (DB-01)', () => {
    it('should complete active user_access query in <100ms', async () => {
      // Create test data
      const { data: testRecord } = await supabaseAdmin
        .from('user_access')
        .insert({
          user_id: TEST_USER_ID,
          access_type: 'one_time',
          expires_at: new Date(Date.now() + 86400000).toISOString(),
          is_active: true,
        })
        .select('id')
        .single();

      // Measure query execution time
      const start = Date.now();
      const { data, error } = await supabaseAdmin
        .from('user_access')
        .select('*')
        .eq('user_id', TEST_USER_ID)
        .eq('is_active', true)
        .gte('expires_at', new Date().toISOString())
        .maybeSingle();
      const duration = Date.now() - start;

      // Cleanup
      if (testRecord) {
        await cleanupTestAccess('user_access', testRecord.id);
      }

      expect(error).toBeNull();
      expect(duration).toBeLessThan(100);
    });

    it('should complete active user_manual_access query in <100ms', async () => {
      // Create test data
      const { data: testRecord } = await supabaseAdmin
        .from('user_manual_access')
        .insert({
          user_id: TEST_USER_ID,
          granted_by: '00000000-0000-0000-0000-000000000002',
          is_active: true,
        })
        .select('id')
        .single();

      // Measure query execution time
      const start = Date.now();
      const now = new Date().toISOString();
      const { data, error } = await supabaseAdmin
        .from('user_manual_access')
        .select('*')
        .eq('user_id', TEST_USER_ID)
        .eq('is_active', true)
        .or(`expires_at.is.null,expires_at.gte.${now}`)
        .maybeSingle();
      const duration = Date.now() - start;

      // Cleanup
      if (testRecord) {
        await cleanupTestAccess('user_manual_access', testRecord.id);
      }

      expect(error).toBeNull();
      expect(duration).toBeLessThan(100);
    });

    it('should handle multiple queries consistently under 100ms', async () => {
      // Create test data
      const { data: testRecord1 } = await supabaseAdmin
        .from('user_access')
        .insert({
          user_id: TEST_USER_ID,
          access_type: 'one_time',
          expires_at: new Date(Date.now() + 86400000).toISOString(),
          is_active: true,
        })
        .select('id')
        .single();

      const { data: testRecord2 } = await supabaseAdmin
        .from('user_manual_access')
        .insert({
          user_id: TEST_USER_ID,
          granted_by: '00000000-0000-0000-0000-000000000002',
          is_active: true,
        })
        .select('id')
        .single();

      // Run 5 queries and measure average time
      const times: number[] = [];
      for (let i = 0; i < 5; i++) {
        const start = Date.now();
        await supabaseAdmin
          .from('user_access')
          .select('*')
          .eq('user_id', TEST_USER_ID)
          .eq('is_active', true)
          .gte('expires_at', new Date().toISOString())
          .maybeSingle();
        times.push(Date.now() - start);
      }

      // Cleanup
      if (testRecord1) {
        await cleanupTestAccess('user_access', testRecord1.id);
      }
      if (testRecord2) {
        await cleanupTestAccess('user_manual_access', testRecord2.id);
      }

      const averageTime = times.reduce((a, b) => a + b, 0) / times.length;
      expect(averageTime).toBeLessThan(100);
    });
  });

  describe('Soft delete verification (DB-03)', () => {
    it('should persist revoked access with is_active = false', async () => {
      // Create access record
      const { data: inserted, error: insertError } = await supabaseAdmin
        .from('user_access')
        .insert({
          user_id: TEST_USER_ID,
          access_type: 'one_time',
          expires_at: new Date(Date.now() + 86400000).toISOString(),
          is_active: true,
        })
        .select()
        .single();

      expect(insertError).toBeNull();
      expect(inserted).toBeDefined();

      // Soft delete: set is_active to false
      const { error: updateError } = await supabaseAdmin
        .from('user_access')
        .update({ is_active: false })
        .eq('id', inserted.id);

      expect(updateError).toBeNull();

      // Query for active access - should NOT return the record
      const { data: activeAccess } = await supabaseAdmin
        .from('user_access')
        .select('*')
        .eq('id', inserted.id)
        .eq('is_active', true);

      expect(activeAccess).toBeNull();

      // Query for all records including inactive - should still exist
      const { data: allRecords } = await supabaseAdmin
        .from('user_access')
        .select('*')
        .eq('id', inserted.id);

      expect(allRecords).toBeDefined();
      expect(allRecords).toHaveLength(1);
      expect(allRecords![0].is_active).toBe(false);

      // Cleanup
      await cleanupTestAccess('user_access', inserted.id);
    });

    it('should allow reactivation of revoked access', async () => {
      // Create access record
      const { data: inserted, error: insertError } = await supabaseAdmin
        .from('user_access')
        .insert({
          user_id: TEST_USER_ID,
          access_type: 'one_time',
          expires_at: new Date(Date.now() + 86400000).toISOString(),
          is_active: true,
        })
        .select()
        .single();

      expect(insertError).toBeNull();

      // Revoke access
      await supabaseAdmin
        .from('user_access')
        .update({ is_active: false })
        .eq('id', inserted.id);

      // Reactivate
      const { error: reactivateError } = await supabaseAdmin
        .from('user_access')
        .update({ is_active: true })
        .eq('id', inserted.id);

      expect(reactivateError).toBeNull();

      // Verify it's active again
      const { data: activeAccess } = await supabaseAdmin
        .from('user_access')
        .select('*')
        .eq('id', inserted.id)
        .eq('is_active', true);

      expect(activeAccess).toBeDefined();
      expect(activeAccess).toHaveLength(1);

      // Cleanup
      await cleanupTestAccess('user_access', inserted.id);
    });

    it('should preserve audit trail with is_active flag', async () => {
      // Create and revoke access
      const { data: inserted } = await supabaseAdmin
        .from('user_access')
        .insert({
          user_id: TEST_USER_ID,
          access_type: 'one_time',
          expires_at: new Date(Date.now() + 86400000).toISOString(),
          is_active: true,
        })
        .select()
        .single();

      await supabaseAdmin
        .from('user_access')
        .update({ is_active: false })
        .eq('id', inserted.id);

      // Query historical records (including inactive)
      const { data: history } = await supabaseAdmin
        .from('user_access')
        .select('*')
        .eq('user_id', TEST_USER_ID);

      expect(history).toBeDefined();
      expect(history!.length).toBeGreaterThanOrEqual(1);

      // Should find the revoked record
      const revokedRecord = history!.find(r => r.id === inserted.id);
      expect(revokedRecord).toBeDefined();
      expect(revokedRecord!.is_active).toBe(false);

      // Cleanup
      await cleanupTestAccess('user_access', inserted.id);
    });
  });

  describe('Combined query patterns', () => {
    it('should filter by both is_active and expires_at correctly', async () => {
      const now = Date.now();
      const expired = new Date(now - 86400000).toISOString(); // Yesterday
      const future = new Date(now + 86400000).toISOString(); // Tomorrow

      // Insert expired record
      const { data: expiredRecord } = await supabaseAdmin
        .from('user_access')
        .insert({
          user_id: TEST_USER_ID,
          access_type: 'one_time',
          expires_at: expired,
          is_active: true,
        })
        .select('id')
        .single();

      // Insert active record
      const { data: activeRecord } = await supabaseAdmin
        .from('user_access')
        .insert({
          user_id: TEST_USER_ID,
          access_type: 'subscription',
          expires_at: future,
          is_active: true,
        })
        .select('id')
        .single();

      // Query for active access
      const { data: activeAccess } = await supabaseAdmin
        .from('user_access')
        .select('*')
        .eq('user_id', TEST_USER_ID)
        .eq('is_active', true)
        .gte('expires_at', new Date().toISOString());

      // Should only return the active record
      expect(activeAccess).toBeDefined();
      expect(activeAccess).toHaveLength(1);
      expect(activeAccess![0].id).toBe(activeRecord!.id);

      // Cleanup
      if (expiredRecord) {
        await cleanupTestAccess('user_access', expiredRecord.id);
      }
      if (activeRecord) {
        await cleanupTestAccess('user_access', activeRecord.id);
      }
    });
  });
});
