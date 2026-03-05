import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAccessStatus } from '@/hooks/useAccessStatus';
import { supabase } from '@/lib/supabase';
import { API_ENDPOINTS } from '@/lib/stripe-config';

export interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  stripe_price_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

interface SubscriptionState {
  subscription: Subscription | null;
  loading: boolean;
  error: string | null;
}

export function useSubscription() {
  const { user } = useAuth();
  // Use React Query hook directly instead of PaymentContext
  const { hasAccess, hasManualAccess, isLoading: paymentLoading, initialized, refetch } = useAccessStatus();
  const [state, setState] = useState<SubscriptionState>({
    subscription: null,
    loading: true,
    error: null,
  });

  // NOTE: Subscription fetching is now handled by PaymentContext
  // which uses the user_access table instead of the obsolete subscriptions table
  const fetchSubscription = useCallback(async () => {
    // Subscription data is managed by PaymentContext
    // This hook now only exposes the access status
    if (!user) {
      setState({ subscription: null, loading: false, error: null });
      return;
    }
    // No-op - subscription data comes from PaymentContext
    setState({ subscription: null, loading: false, error: null });
  }, [user]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  // Create checkout session
  const createCheckoutSession = useCallback(async (priceId: string): Promise<string | null> => {
    if (!user) {
      return null;
    }

    try {
      const response = await fetch(API_ENDPOINTS.createCheckoutSession, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();
      return url;
    } catch (err) {
      console.error('Error creating checkout session:', err);
      return null;
    }
  }, [user]);

  // Create customer portal session
  const createPortalSession = useCallback(async (): Promise<string | null> => {
    if (!user) {
      return null;
    }

    try {
      const response = await fetch(API_ENDPOINTS.createPortalSession, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to create portal session');
      }

      const { url } = await response.json();
      return url;
    } catch (err) {
      console.error('Error creating portal session:', err);
      return null;
    }
  }, [user]);

  // Check if user has active subscription
  const hasActiveSubscription = state.subscription?.status === 'active';

  if (import.meta.env.DEV) {
    console.log('[useSubscription] State:', {
      hasActiveSubscription,
      hasManualAccess,
      hasAccess,
      paymentLoading
    });
  }

  return {
    subscription: state.subscription,
    loading: paymentLoading,
    error: state.error,
    hasActiveSubscription,
    hasManualAccess,
    hasAccess,
    initialized,
    createCheckoutSession,
    createPortalSession,
    refetch, // From useAccessStatus now
  };
}
