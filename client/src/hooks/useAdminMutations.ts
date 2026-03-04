/**
 * useAdminMutations Hook
 *
 * React Query mutations for admin operations with optimistic updates.
 * Provides instant UI feedback by updating the cache before API response,
 * with automatic rollback on error.
 *
 * @example
 * ```tsx
 * const grantAccess = useGrantAccess();
 * const revokeAccess = useRevokeAccess();
 *
 * // Grant access (shows optimistic update immediately)
 * grantAccess.mutate({ email: 'user@example.com', reason: 'Test' });
 *
 * // Revoke access (updates UI instantly, rolls back on error)
 * revokeAccess.mutate({ userId: '123', email: 'user@example.com' });
 * ```
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import type { AdminUser } from './useAdminUsers';

// ============================================================================
// TypeScript Types
// ============================================================================

/**
 * Input for granting manual access
 */
export interface GrantAccessInput {
  email: string;
  reason?: string;
  expires_at?: string;
}

/**
 * Input for revoking access
 */
export interface RevokeAccessInput {
  userId: string;
  email: string;
}

// ============================================================================
// Grant Access Mutation
// ============================================================================

/**
 * Mutation for granting manual access to users.
 *
 * Features:
 * - Optimistic update: User appears in list immediately
 * - Rollback on error: Removes user if API call fails
 * - Cache invalidation: Refetches list after successful mutation
 * - Toast notifications: Success/error feedback
 */
export function useGrantAccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: GrantAccessInput) => {
      // Get session token
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('No active session found');
      }

      // Call API
      const response = await fetch('/api/admin/access/grant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to grant access');
      }

      return responseData;
    },

    /**
     * Optimistic update: Add temporary user to cache immediately
     */
    onMutate: async (newAccess) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['admin-users'] });

      // Snapshot previous value for rollback
      const previousUsers = queryClient.getQueryData<AdminUser[]>([
        'admin-users',
        'search',
        '',
      ]);

      // Optimistically add user to cache
      queryClient.setQueryData(['admin-users', 'search', ''], (old: AdminUser[] | undefined) => {
        if (!old) return old;

        return [
          {
            // Create temporary access record
            id: 'temp-' + Date.now(),
            user_id: 'temp-user',
            granted_by: 'temp-admin',
            granted_at: new Date().toISOString(),
            expires_at: newAccess.expires_at || null,
            reason: newAccess.reason || null,
            is_active: true,
            user_email: newAccess.email,
            granter_email: null,
          },
          ...old,
        ];
      });

      // Return context with previous value for rollback
      return { previousUsers };
    },

    /**
     * Rollback on error: Restore previous cache state
     */
    onError: (err, newAccess, context) => {
      // Restore previous users
      if (context?.previousUsers) {
        queryClient.setQueryData(['admin-users', 'search', ''], context.previousUsers);
      }

      // Show error toast
      toast.error('Erro ao conceder acesso', {
        description: err instanceof Error ? err.message : 'Tente novamente',
      });
    },

    /**
     * Always refetch after mutation (success or error)
     */
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },

    /**
     * Success toast notification
     */
    onSuccess: () => {
      toast.success('Acesso concedido com sucesso');
    },
  });
}

// ============================================================================
// Revoke Access Mutation
// ============================================================================

/**
 * Mutation for revoking manual access from users.
 *
 * Features:
 * - Optimistic update: User status changes immediately
 * - Rollback on error: Restores active status if API call fails
 * - Cache invalidation: Refetches list after successful mutation
 * - Toast notifications: Success/error feedback
 */
export function useRevokeAccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, email }: RevokeAccessInput) => {
      // Get session token
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('No active session found');
      }

      // Call API
      const response = await fetch(`/api/admin/access/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to revoke access');
      }

      return responseData;
    },

    /**
     * Optimistic update: Set is_active to false immediately
     */
    onMutate: async ({ userId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['admin-users'] });

      // Snapshot previous value for rollback
      const previousUsers = queryClient.getQueryData<AdminUser[]>([
        'admin-users',
        'search',
        '',
      ]);

      // Optimistically update user status
      queryClient.setQueryData(['admin-users', 'search', ''], (old: AdminUser[] | undefined) => {
        if (!old) return old;

        return old.map(user =>
          user.user_id === userId
            ? { ...user, is_active: false }
            : user
        );
      });

      // Return context with previous value for rollback
      return { previousUsers };
    },

    /**
     * Rollback on error: Restore active status
     */
    onError: (err, variables, context) => {
      // Restore previous users
      if (context?.previousUsers) {
        queryClient.setQueryData(['admin-users', 'search', ''], context.previousUsers);
      }

      // Show error toast
      toast.error('Erro ao revogar acesso', {
        description: err instanceof Error ? err.message : 'Tente novamente',
      });
    },

    /**
     * Always refetch after mutation (success or error)
     */
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },

    /**
     * Success toast notification
     */
    onSuccess: () => {
      toast.success('Acesso revogado com sucesso');
    },
  });
}

// ============================================================================
// Export Default
// ============================================================================

export default {
  useGrantAccess,
  useRevokeAccess,
};
