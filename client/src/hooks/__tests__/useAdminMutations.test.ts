/**
 * useAdminMutations Hook Tests
 *
 * Tests for React Query mutations with optimistic updates.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useGrantAccess, useRevokeAccess } from '../useAdminMutations';
import { supabase } from '@/lib/supabase';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
  },
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock fetch
global.fetch = vi.fn() as any;

describe('useAdminMutations', () => {
  let queryClient: QueryClient;
  let wrapper: React.FC<{ children: React.ReactNode }>;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    // Mock successful auth session
    (supabase.auth.getSession as any).mockResolvedValue({
      data: { session: { access_token: 'test-token' } },
    });

    vi.clearAllMocks();
  });

  describe('useGrantAccess', () => {
    it('should show optimistic update immediately', async () => {
      // Setup initial data
      queryClient.setQueryData(['admin-users', 'search', ''], []);

      const { result } = renderHook(() => useGrantAccess(), { wrapper });

      const mockResponse = {
        ok: true,
        json: async () => ({ success: true, access: { id: '123' } }),
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      // Trigger mutation
      result.current.mutate({
        email: 'test@example.com',
        reason: 'Test access',
      });

      // Check optimistic update
      await waitFor(() => {
        const users = queryClient.getQueryData(['admin-users', 'search', '']) as any[];
        expect(users).toHaveLength(1);
        expect(users[0].user_email).toBe('test@example.com');
      });
    });

    it('should rollback on error', async () => {
      const previousUsers = [{ id: '1', user_email: 'existing@example.com' }];
      queryClient.setQueryData(['admin-users', 'search', ''], previousUsers);

      const { result } = renderHook(() => useGrantAccess(), { wrapper });

      (global.fetch as any).mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'User not found' }),
      });

      result.current.mutate({ email: 'new@example.com' });

      await waitFor(() => {
        const users = queryClient.getQueryData(['admin-users', 'search', '']) as any[];
        // Should rollback to previous state
        expect(users).toEqual(previousUsers);
      });
    });

    it('should invalidate queries on success', async () => {
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

      queryClient.setQueryData(['admin-users', 'search', ''], []);

      const { result } = renderHook(() => useGrantAccess(), { wrapper });

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      result.current.mutate({ email: 'test@example.com' });

      await waitFor(() => {
        expect(invalidateQueriesSpy).toHaveBeenCalledWith({
          queryKey: ['admin-users'],
        });
      });
    });
  });

  describe('useRevokeAccess', () => {
    it('should show optimistic update for revoke', async () => {
      const initialUsers = [
        { id: '1', user_id: 'user-1', user_email: 'user1@example.com', is_active: true },
        { id: '2', user_id: 'user-2', user_email: 'user2@example.com', is_active: true },
      ];

      queryClient.setQueryData(['admin-users', 'search', ''], initialUsers);

      const { result } = renderHook(() => useRevokeAccess(), { wrapper });

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      result.current.mutate({ userId: 'user-1', email: 'user1@example.com' });

      await waitFor(() => {
        const users = queryClient.getQueryData(['admin-users', 'search', '']) as any[];
        const revokedUser = users.find((u: any) => u.user_id === 'user-1');
        expect(revokedUser?.is_active).toBe(false);
      });
    });

    it('should rollback revoke on error', async () => {
      const initialUsers = [
        { id: '1', user_id: 'user-1', user_email: 'user1@example.com', is_active: true },
      ];

      queryClient.setQueryData(['admin-users', 'search', ''], initialUsers);

      const { result } = renderHook(() => useRevokeAccess(), { wrapper });

      (global.fetch as any).mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Failed to revoke' }),
      });

      result.current.mutate({ userId: 'user-1', email: 'user1@example.com' });

      await waitFor(() => {
        const users = queryClient.getQueryData(['admin-users', 'search', '']) as any[];
        const user = users.find((u: any) => u.user_id === 'user-1');
        // Should rollback to active
        expect(user?.is_active).toBe(true);
      });
    });
  });
});
