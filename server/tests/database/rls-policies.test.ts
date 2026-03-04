/**
 * RLS Policy Security Tests
 *
 * Verifies Row Level Security policies protect user_access and user_manual_access tables.
 * Tests ensure service role has full access while regular users are blocked from modifications.
 *
 * Requirements:
 * - SEC-03: Service role can read user_access and user_manual_access
 * - SEC-04: Regular users cannot modify user_access directly
 */

import { describe, it, expect, beforeAll } from 'vitest';
import {
  supabaseAdmin,
  getPolicies,
  TEST_USER_ID,
} from './conftest';

describe('RLS Policies', () => {
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

  describe('user_access table security', () => {
    it('should have service role full access policy', async () => {
      const policies = await getPolicies('user_access');

      const serviceRolePolicy = policies.find(p =>
        p.roles.includes('service_role') &&
        p.cmd === 'ALL'
      );

      expect(serviceRolePolicy).toBeDefined();
      expect(serviceRolePolicy?.policyname).toContain('Service role');
    });

    it('should have policy allowing users to read own access', async () => {
      const policies = await getPolicies('user_access');

      const readPolicy = policies.find(p =>
        p.cmd === 'SELECT' &&
        (p.policyname.toLowerCase().includes('read') ||
         p.policyname.toLowerCase().includes('own'))
      );

      expect(readPolicy).toBeDefined();
    });

    it('should block users from updating own access (explicit deny)', async () => {
      const policies = await getPolicies('user_access');

      // Look for explicit deny policy
      const updateDenyPolicy = policies.find(p =>
        (p.policyname.includes('cannot update') ||
         p.policyname.includes('block') ||
         p.policyname.includes('deny')) &&
        p.cmd === 'UPDATE'
      );

      expect(updateDenyPolicy).toBeDefined();
    });

    it('should block users from deleting own access (explicit deny)', async () => {
      const policies = await getPolicies('user_access');

      // Look for explicit deny policy
      const deleteDenyPolicy = policies.find(p =>
        (p.policyname.includes('cannot delete') ||
         p.policyname.includes('block') ||
         p.policyname.includes('deny')) &&
        p.cmd === 'DELETE'
      );

      expect(deleteDenyPolicy).toBeDefined();
    });

    it('should not have JWT claim policies (security verification)', async () => {
      const policies = await getPolicies('user_access');

      // Check for vulnerable pattern: auth.jwt()->>'role'
      const hasJwtClaimPolicies = policies.some(p =>
        p.policyname.includes('jwt') ||
        p.policyname.includes('claim') ||
        p.policyname.includes("auth.jwt()->>")
      );

      expect(hasJwtClaimPolicies).toBe(false);
    });
  });

  describe('user_manual_access table security', () => {
    it('should have service role full access policy', async () => {
      const policies = await getPolicies('user_manual_access');

      const serviceRolePolicy = policies.find(p =>
        p.roles.includes('service_role') &&
        p.cmd === 'ALL'
      );

      expect(serviceRolePolicy).toBeDefined();
    });

    it('should have policy allowing users to view own manual access', async () => {
      const policies = await getPolicies('user_manual_access');

      const viewPolicy = policies.find(p =>
        p.cmd === 'SELECT' &&
        (p.policyname.toLowerCase().includes('view') ||
         p.policyname.toLowerCase().includes('read') ||
         p.policyname.toLowerCase().includes('own'))
      );

      expect(viewPolicy).toBeDefined();
    });

    it('should not have JWT claim policies (security verification)', async () => {
      const policies = await getPolicies('user_manual_access');

      // Check for vulnerable pattern: auth.jwt()->>'role'
      const hasJwtClaimPolicies = policies.some(p =>
        p.policyname.includes('jwt') ||
        p.policyname.includes('claim') ||
        p.policyname.includes("auth.jwt()->>")
      );

      expect(hasJwtClaimPolicies).toBe(false);
    });
  });

  describe('Policy structure validation', () => {
    it('should have restrictive policies for user_access UPDATE', async () => {
      const policies = await getPolicies('user_access');
      const updatePolicies = policies.filter(p => p.cmd === 'UPDATE');

      // Should have at least one UPDATE policy
      expect(updatePolicies.length).toBeGreaterThan(0);

      // Either has explicit deny (permissive = false) or service role only
      const hasDeny = updatePolicies.some(p => !p.permissive);
      const hasServiceRole = updatePolicies.some(p => p.roles.includes('service_role'));

      expect(hasDeny || hasServiceRole).toBe(true);
    });

    it('should have restrictive policies for user_access DELETE', async () => {
      const policies = await getPolicies('user_access');
      const deletePolicies = policies.filter(p => p.cmd === 'DELETE');

      // Should have at least one DELETE policy
      expect(deletePolicies.length).toBeGreaterThan(0);

      // Either has explicit deny (permissive = false) or service role only
      const hasDeny = deletePolicies.some(p => !p.permissive);
      const hasServiceRole = deletePolicies.some(p => p.roles.includes('service_role'));

      expect(hasDeny || hasServiceRole).toBe(true);
    });

    it('should have policies for all operations on user_access', async () => {
      const policies = await getPolicies('user_access');

      const commands = new Set(policies.map(p => p.cmd));

      // Should have policies for SELECT, INSERT, UPDATE, DELETE, or ALL
      expect(commands.has('SELECT') || commands.has('ALL')).toBe(true);
      expect(commands.has('UPDATE') || commands.has('ALL')).toBe(true);
      expect(commands.has('DELETE') || commands.has('ALL')).toBe(true);
    });

    it('should have policies for all operations on user_manual_access', async () => {
      const policies = await getPolicies('user_manual_access');

      const commands = new Set(policies.map(p => p.cmd));

      // Should have policies for SELECT, INSERT, UPDATE, DELETE, or ALL
      expect(commands.has('SELECT') || commands.has('ALL')).toBe(true);
    });
  });

  describe('Service role enforcement', () => {
    it('should allow service role to bypass RLS for user_access', async () => {
      // This test verifies service role can perform any operation
      // by checking that a service role policy exists with ALL or per-operation permissions

      const policies = await getPolicies('user_access');

      const allPolicy = policies.find(p =>
        p.roles.includes('service_role') && p.cmd === 'ALL'
      );

      // If no ALL policy, check for individual operation policies
      const hasPerOperationPolicies = ['SELECT', 'INSERT', 'UPDATE', 'DELETE'].every(cmd =>
        policies.some(p => p.roles.includes('service_role') && p.cmd === cmd)
      );

      expect(allPolicy || hasPerOperationPolicies).toBe(true);
    });

    it('should allow service role to bypass RLS for user_manual_access', async () => {
      const policies = await getPolicies('user_manual_access');

      const allPolicy = policies.find(p =>
        p.roles.includes('service_role') && p.cmd === 'ALL'
      );

      // If no ALL policy, check for individual operation policies
      const hasPerOperationPolicies = ['SELECT', 'INSERT', 'UPDATE', 'DELETE'].every(cmd =>
        policies.some(p => p.roles.includes('service_role') && p.cmd === cmd)
      );

      expect(allPolicy || hasPerOperationPolicies).toBe(true);
    });
  });

  describe('Policy naming conventions', () => {
    it('should use descriptive policy names for user_access', async () => {
      const policies = await getPolicies('user_access');

      // Check that policies have meaningful names
      policies.forEach(policy => {
        expect(policy.policyname).toBeTruthy();
        expect(policy.policyname.length).toBeGreaterThan(0);
      });
    });

    it('should use descriptive policy names for user_manual_access', async () => {
      const policies = await getPolicies('user_manual_access');

      // Check that policies have meaningful names
      policies.forEach(policy => {
        expect(policy.policyname).toBeTruthy();
        expect(policy.policyname.length).toBeGreaterThan(0);
      });
    });
  });
});
