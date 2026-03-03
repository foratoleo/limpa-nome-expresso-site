import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePaymentStatus } from '@/contexts/PaymentContext';
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
  const { hasActiveAccess, hasManualAccess, loading: paymentLoading, initialized } = usePaymentStatus();
  const [state, setState] = useState<SubscriptionState>({
    subscription: null,
    loading: true,
    error: null,
  });

  // Fetch subscription from database
  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setState({ subscription: null, loading: false, error: null });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setState({ subscription: data || null, loading: false, error: null });
    } catch (err) {
      setState({
        subscription: null,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to fetch subscription',
      });
    }
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

  // Check if user has access (from PaymentContext - single source of truth)
  const hasAccess = hasActiveAccess;

  if (import.meta.env.DEV) {
    console.log('[useSubscription] State:', {
      hasActiveSubscription,
      hasManualAccess,
      hasActiveAccess,
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
    refetch: fetchSubscription,
  };
}
