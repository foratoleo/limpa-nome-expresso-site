import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export interface AccessStatusResponse {
  hasActiveAccess: boolean;
  hasManualAccess: boolean;
  accessType: 'subscription' | 'one_time' | 'manual' | null;
  expiresAt: string | null;
  manualAccessExpiresAt: string | null;
}

async function fetchAccessStatus(sessionAccessToken: string): Promise<AccessStatusResponse> {
  const response = await fetch('/api/payments/status', {
    headers: {
      Authorization: `Bearer ${sessionAccessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch access status: ${response.status}`);
  }

  return response.json();
}

export function useAccessStatus() {
  const { user, session } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id ?? null;
  const sessionToken = session?.access_token ?? null;

  // Invalidate cache when user signs out or session changes
  useEffect(() => {
    if (!userId) {
      queryClient.removeQueries({ queryKey: ['accessStatus'] });
    }
  }, [userId, queryClient]);

  const query = useQuery({
    queryKey: ['accessStatus', userId],
    queryFn: () => fetchAccessStatus(sessionToken!),
    enabled: !!userId && !!sessionToken, // Only fetch when authenticated
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return {
    hasAccess: query.data?.hasActiveAccess ?? false,
    hasManualAccess: query.data?.hasManualAccess ?? false,
    accessType: query.data?.accessType ?? null,
    expiresAt: query.data?.expiresAt ?? null,
    isLoading: query.isLoading,
    error: query.error,
    initialized: !query.isLoading && userId !== null, // True after first fetch
    refetch: query.refetch,
  };
}
