import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// ============================================================================
// TypeScript Types
// ============================================================================

export type UserStatus = "active" | "pending" | "expired" | "manual" | "free";

export interface AdminManualAccess {
  id: string;
  user_id: string;
  granted_by: string;
  granted_at: string;
  expires_at: string | null;
  reason: string | null;
  is_active: boolean;
  granter_email?: string | null;
}

export interface AdminPaymentAccess {
  id: string;
  user_id: string;
  access_type: "subscription" | "one_time";
  payment_id: string | null;
  expires_at: string;
  is_active: boolean;
  created_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  display_name: string | null;
  created_at: string | null;
  activated_at: string | null;
  status: UserStatus;
  has_access: boolean;
  manual_access: AdminManualAccess | null;
  payment_access: AdminPaymentAccess | null;
  role: string | null;
}

interface AccessListResponse {
  users: AdminUser[];
}

interface ErrorResponse {
  error: string;
  details?: string;
}
export function useAdminUsers(search?: string) {
  return useQuery({
    queryKey: ['admin-users', 'search', search || ''],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('No active session found');
      }

      const searchParam = search ? `?search=${encodeURIComponent(search)}` : '';

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

      const usersData = data as AccessListResponse;
      return usersData.users as AdminUser[];
    },
    staleTime: 1000 * 60 * 5,
  });
}

export default useAdminUsers;
