/**
 * useAdminUsers Hook
 *
 * Custom React hook for fetching the list of all users with access status.
 * Provides loading state, error handling, and refetch functionality.
 *
 * @example
 * ```tsx
 * const { users, loading, error, refetch } = useAdminUsers();
 *
 * if (loading) return <LoadingSpinner />;
 * if (error) return <ErrorMessage>{error}</ErrorMessage>;
 *
 * return <UserListTable users={users} loading={loading} onRefresh={refetch} />;
 * ```
 */

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

// ============================================================================
// TypeScript Types
// ============================================================================

/**
 * User access status types
 */
export type UserStatus = "active" | "pending" | "expired" | "manual" | "free";

/**
 * Enriched user object with access status
 */
export interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  status: UserStatus;
  manual_access: any | null;
  payment_access: any | null;
}

/**
 * Return type for useAdminUsers hook
 */
export interface UseAdminUsersReturn {
  /** Array of enriched users with access status */
  users: AdminUser[];
  /** Loading state */
  loading: boolean;
  /** Error message if request failed */
  error: string | null;
  /** Function to refetch the user list */
  refetch: () => Promise<void>;
}

/**
 * API response format from /api/admin/users
 */
interface UsersResponse {
  users: AdminUser[];
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
 * Custom hook for fetching admin user list.
 *
 * Fetches all users with enriched access status from /api/admin/users.
 * Includes authorization header from Supabase session.
 *
 * @returns Object with users array, loading state, error, and refetch function
 */
export function useAdminUsers(): UseAdminUsersReturn {
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch users from the API
   */
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get session token from Supabase
      const { data: { session } } = await (await import("@supabase/supabase-js"))
        .createClient(
          import.meta.env.VITE_SUPABASE_URL,
          import.meta.env.VITE_SUPABASE_ANON_KEY
        )
        .auth.getSession();

      if (!session?.access_token) {
        throw new Error("No active session found");
      }

      // Fetch users from API
      const response = await fetch("/api/admin/users", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      });

      const data: UsersResponse | ErrorResponse = await response.json();

      if (!response.ok) {
        const errorData = data as ErrorResponse;
        throw new Error(errorData.error || "Failed to fetch users");
      }

      const usersData = data as UsersResponse;
      setUsers(usersData.users || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      console.error("Error fetching admin users:", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refetch function to manually refresh the user list
   */
  const refetch = async () => {
    await fetchUsers();
  };

  // Fetch users on mount and when user changes
  useEffect(() => {
    if (user?.user_metadata?.role === "admin") {
      fetchUsers();
    } else {
      // Clear data if user is not admin
      setUsers([]);
      setLoading(false);
    }
  }, [user]);

  return {
    users,
    loading,
    error,
    refetch,
  };
}

// ============================================================================
// Export Default
// ============================================================================

export default useAdminUsers;
