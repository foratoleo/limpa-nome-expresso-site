/**
 * React Query Client Configuration
 *
 * Centralized QueryClient instance with optimized caching for admin operations.
 * Reused across the application for consistent caching behavior.
 */

import { QueryClient } from '@tanstack/react-query';

/**
 * QueryClient instance with configured defaults
 *
 * Configuration rationale:
 * - staleTime: 5 minutes - Data remains fresh for 5 minutes, reducing unnecessary refetches
 * - gcTime: 10 minutes - Cache is kept for 10 minutes after becoming inactive
 * - refetchOnWindowFocus: false - Prevents unnecessary refetches when user returns to tab
 * - retry: 1 - Single retry on failure to balance reliability with performance
 *
 * For admin operations:
 * - User lists cache for 5 minutes (reduces API calls during filter changes)
 * - Mutations trigger automatic cache invalidation
 * - Optimistic updates provide instant UI feedback
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10,   // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      retry: 1,
    },
    mutations: {
      retry: 1,
    },
  },
});

/**
 * Query keys used throughout the admin panel
 *
 * Centralizing query keys makes cache management and invalidation easier.
 */
export const queryKeys = {
  adminUsers: (search: string = '') => ['admin-users', 'search', search] as const,
  userAccess: (userId: string) => ['user-access', userId] as const,
  paymentStatus: (userId: string) => ['payment-status', userId] as const,
} as const;
