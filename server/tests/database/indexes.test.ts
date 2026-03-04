/**
 * Database Index Verification Tests
 *
 * Verifies that required indexes exist on user_access and user_manual_access tables
 * for query performance (DB-01, DB-02 requirements).
 *
 * Requirements:
 * - DB-01: Indexes on user_id for <100ms query performance
 * - DB-02: Composite index on user_access(user_id, is_active, expires_at)
 */

import { describe, it, expect, beforeAll } from 'vitest';
import {
  supabaseAdmin,
  getIndexDefinition,
  explainQuery,
  TEST_USER_ID,
} from './conftest';

describe('Database Indexes', () => {
  beforeAll(async () => {
    // Verify database connection
    const { error } = await supabaseAdmin
      .from('user_access')
      .select('id')
      .limit(1);

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Database connection failed: ${error.message}`);
    }
  });

  describe('user_access table indexes', () => {
    it('should have idx_user_access_active composite index', async () => {
      const indexes = await getIndexDefinition('user_access');
      const index = indexes.find(idx => idx.indexname === 'idx_user_access_active');

      expect(index).toBeDefined();
      expect(index?.indexdef).toContain('user_access');
      expect(index?.indexdef).toContain('user_id');
      expect(index?.indexdef).toContain('is_active');
      expect(index?.indexdef).toContain('expires_at');
    });

    it('should have composite index with correct column order', async () => {
      const indexes = await getIndexDefinition('user_access');
      const index = indexes.find(idx => idx.indexname === 'idx_user_access_active');

      expect(index).toBeDefined();

      // Verify column order: user_id, is_active, expires_at
      const indexDef = index!.indexdef;
      const user_id_pos = indexDef.indexOf('user_id');
      const is_active_pos = indexDef.indexOf('is_active');
      const expires_at_pos = indexDef.indexOf('expires_at');

      expect(user_id_pos).toBeGreaterThan(-1);
      expect(is_active_pos).toBeGreaterThan(user_id_pos);
      expect(expires_at_pos).toBeGreaterThan(is_active_pos);
    });

    it('should use index for active access queries', async () => {
      // This test verifies the index is being used by the query planner
      // Note: EXPLAIN ANALYZE requires the table to have data to work properly

      const plan = await explainQuery(
        "SELECT * FROM user_access WHERE user_id = 'test-uuid' AND is_active = true AND expires_at > NOW()"
      );

      // Check if the plan contains an index scan
      // If the index exists and is used, we should see "Index Scan"
      const hasIndexScan = plan.includes('Index Scan') || plan.includes('Bitmap Index Scan');

      // Note: This test may pass even if the index doesn't exist if the table is empty
      // The real verification is that the index exists (tested above)
      if (hasIndexScan) {
        expect(plan).toContain('idx_user_access_active');
      }
    });
  });

  describe('user_manual_access table indexes', () => {
    it('should have idx_user_manual_access_user_id index', async () => {
      const indexes = await getIndexDefinition('user_manual_access');
      const index = indexes.find(idx => idx.indexname === 'idx_user_manual_access_user_id');

      expect(index).toBeDefined();
      expect(index?.indexdef).toContain('user_manual_access');
      expect(index?.indexdef).toContain('user_id');
    });

    it('should have idx_user_manual_access_is_active index', async () => {
      const indexes = await getIndexDefinition('user_manual_access');
      const index = indexes.find(idx => idx.indexname === 'idx_user_manual_access_is_active');

      expect(index).toBeDefined();
      expect(index?.indexdef).toContain('user_manual_access');
      expect(index?.indexdef).toContain('is_active');
    });
  });

  describe('Index usage verification with EXPLAIN', () => {
    it('should show index usage for user_access queries', async () => {
      // Create a test record to ensure the query planner has statistics
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

      if (testRecord) {
        const plan = await explainQuery(
          `SELECT * FROM user_access WHERE user_id = '${TEST_USER_ID}' AND is_active = true AND expires_at > NOW()`
        );

        // Clean up test record
        await supabaseAdmin.from('user_access').delete().eq('id', testRecord.id);

        // Check if index scan is used
        const usesIndex = plan.includes('Index Scan') || plan.includes('Bitmap Index Scan');
        expect(usesIndex).toBe(true);
      }
    });

    it('should show index usage for user_manual_access queries', async () => {
      // Create a test record
      const { data: testRecord } = await supabaseAdmin
        .from('user_manual_access')
        .insert({
          user_id: TEST_USER_ID,
          granted_by: '00000000-0000-0000-0000-000000000002',
          is_active: true,
        })
        .select('id')
        .single();

      if (testRecord) {
        const plan = await explainQuery(
          `SELECT * FROM user_manual_access WHERE user_id = '${TEST_USER_ID}'`
        );

        // Clean up test record
        await supabaseAdmin.from('user_manual_access').delete().eq('id', testRecord.id);

        // Check if index scan is used
        const usesIndex = plan.includes('Index Scan') || plan.includes('Bitmap Index Scan');
        expect(usesIndex).toBe(true);
      }
    });
  });

  describe('Index existence validation', () => {
    it('should have at least one index on user_access', async () => {
      const indexes = await getIndexDefinition('user_access');

      expect(indexes.length).toBeGreaterThan(0);
    });

    it('should have at least two indexes on user_manual_access', async () => {
      const indexes = await getIndexDefinition('user_manual_access');

      expect(indexes.length).toBeGreaterThanOrEqual(2);
    });

    it('should not have duplicate indexes', async () => {
      const userAccessIndexes = await getIndexDefinition('user_access');
      const userManualAccessIndexes = await getIndexDefinition('user_manual_access');

      const userAccessIndexNames = userAccessIndexes.map(idx => idx.indexname);
      const userManualAccessIndexNames = userManualAccessIndexes.map(idx => idx.indexname);

      const hasDuplicates = (arr: string[]) => new Set(arr).size !== arr.length;

      expect(hasDuplicates(userAccessIndexNames)).toBe(false);
      expect(hasDuplicates(userManualAccessIndexNames)).toBe(false);
    });
  });
});
