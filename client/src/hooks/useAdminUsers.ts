/**
 * useAdminUsers Hook (React Query Version)
 *
 * Custom React hook for fetching the list of users with manual access.
 * Uses React Query for automatic caching, refetching, and loading states.
 *
 * @example
 * ```tsx
 * const { data: users = [], isLoading, error } = useAdminUsers(searchTerm);
 *
 * if (isLoading) return <LoadingSpinner />;
 * if (error) return <ErrorMessage>{error.message}</ErrorMessage>;
 *
 * return <UserListTable users={users} />;
 * ```
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { UserManualAccess } from '@/types/supabase';

// ============================================================================
// TypeScript Types
// ============================================================================

/**
 * Enriched user object with email information
 */
export interface AdminUser extends UserManualAccess {
  user_email: string | null;
  granter_email: string | null;
}

/**
 * API response format from /api/admin/access/list
 */
interface AccessListResponse {
  accesses: AdminUser[];
}

/**
 * API error response format
 */
interface ErrorResponse {
  error: string;
  details?: string;
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Custom hook for fetching admin user list with React Query.
 *
 * Features:
 * - Automatic caching with 5-minute stale time
 * - Search parameter support for server-side filtering
 * - Automatic refetching on window focus (disabled by default)
 * - Loading and error states handled by React Query
 * - Query key includes search term for proper cache invalidation
 *
 * @param search - Optional search term to filter users by email or name
 * @returns React Query result with users array
 */
export function useAdminUsers(search?: string) {
  return useQuery({
    queryKey: ['admin-users', 'search', search || ''],
    queryFn: async () => {
      // Get session token from Supabase
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('No active session found');
      }

      // Build search parameter if provided
      const searchParam = search ? `?search=${encodeURIComponent(search)}` : '';

      // Fetch users from API
      const response = await fetch(`/api/admin/access/list${searchParam}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const data: AccessListResponse | ErrorResponse = await response.json();

      if (!response.ok) {
        const errorData = data as ErrorResponse;
        throw new Error(errorData.error || 'Failed to fetch users');
      }

      const accessesData = data as AccessListResponse;
      return accessesData.accesses as AdminUser[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes - matches queryClient defaults
  });
}

// ============================================================================
// Export Default
// ============================================================================

export default useAdminUsers;
