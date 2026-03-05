import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { debugAuthFlow } from '@/lib/debugAuth';

export interface AccessStatusResponse {
  hasActiveAccess: boolean;
  hasManualAccess: boolean;
  accessType: 'subscription' | 'one_time' | 'manual' | null;
  expiresAt: string | null;
  manualAccessExpiresAt: string | null;
}

async function fetchAccessStatus(sessionAccessToken: string): Promise<AccessStatusResponse> {
  debugAuthFlow('useAccessStatus: Fetching access status', {
    hasToken: !!sessionAccessToken,
    tokenPrefix: sessionAccessToken?.substring(0, 10) + '...',
  });

  const response = await fetch('/api/payments/status', {
    headers: {
      Authorization: `Bearer ${sessionAccessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    debugAuthFlow('useAccessStatus: Fetch failed', {
      status: response.status,
      statusText: response.statusText,
    });
    throw new Error(`Failed to fetch access status: ${response.status}`);
  }

  const data = await response.json();

  debugAuthFlow('useAccessStatus: Fetch successful', {
    hasActiveAccess: data.hasActiveAccess,
    hasManualAccess: data.hasManualAccess,
    accessType: data.accessType,
    expiresAt: data.expiresAt,
  });

  return data;
}

export function useAccessStatus() {
  const { user, session } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id ?? null;
  const sessionToken = session?.access_token ?? null;

  // Invalidate cache when user signs out or session changes
  useEffect(() => {
    if (!userId) {
      debugAuthFlow('useAccessStatus: User cleared - removing queries', {});
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

  // Log query state changes
  useEffect(() => {
    debugAuthFlow('useAccessStatus: Query state changed', {
      userId,
      isLoading: query.isLoading,
      isError: query.isError,
      error: query.error?.message,
      hasData: !!query.data,
      hasAccess: query.data?.hasActiveAccess ?? false,
      hasManualAccess: query.data?.hasManualAccess ?? false,
      accessType: query.data?.accessType,
    });
  }, [query.isLoading, query.isError, query.error, query.data, userId]);

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
