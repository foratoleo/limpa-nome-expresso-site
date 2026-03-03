import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase';

interface PaymentContextType {
  hasActiveAccess: boolean;
  hasManualAccess: boolean;
  accessType: 'subscription' | 'one_time' | 'manual' | null;
  expiresAt: string | null;
  loading: boolean;
  initialized: boolean;
  refetch: () => Promise<void>;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export function PaymentProvider({ children }: { children: ReactNode }) {
  const { user, session } = useAuth();
  const [state, setState] = useState({
    hasActiveAccess: false,
    hasManualAccess: false,
    accessType: null as 'subscription' | 'one_time' | 'manual' | null,
    expiresAt: null as string | null,
    loading: true,
    initialized: false,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  const fetchStatus = useCallback(async () => {
    if (!mountedRef.current) return;

    // Reset loading before aborting to prevent stuck loading state
    if (abortControllerRef.current) {
      if (import.meta.env.DEV) {
        console.log('[PaymentContext] Aborting previous request');
      }
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      // Reset loading state immediately when aborting
      setState(prev => ({ ...prev, loading: false }));
    }

    if (!user || !session) {
      setState({ hasActiveAccess: false, hasManualAccess: false, accessType: null, expiresAt: null, loading: false, initialized: false });
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setState(prev => ({ ...prev, loading: true }));

    try {
      const token = session.access_token;

      // Add timeout to prevent hanging
      const timeoutId = setTimeout(() => {
        if (mountedRef.current) {
          controller.abort();
        }
      }, 10000); // 10 second timeout

      const response = await fetch('/api/payments/status', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('Failed to fetch payment status');
      }

      const data = await response.json();

      if (import.meta.env.DEV) {
        console.log('[PaymentContext] Access check result:', {
          userId: user.id,
          hasActiveAccess: data.hasActiveAccess,
          hasManualAccess: data.hasManualAccess,
          accessType: data.accessType,
          expiresAt: data.expiresAt,
        });
      }

      setState({
        hasActiveAccess: data.hasActiveAccess,
        hasManualAccess: data.hasManualAccess || false,
        accessType: data.accessType,
        expiresAt: data.expiresAt,
        loading: false,
        initialized: true,
      });
    } catch (error: any) {
      if (error.name === 'AbortError') {
        if (import.meta.env.DEV) {
          console.log('[PaymentContext] Request aborted');
        }
        setState(prev => ({ ...prev, loading: false }));
        return;
      }
      console.error('Error fetching payment status:', error);

      // Fallback to direct DB query for both manual and subscription access
      try {
        const [manualAccessResult, subscriptionAccessResult] = await Promise.all([
          supabase
            .from('user_manual_access')
            .select('id, is_active, expires_at')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .or('expires_at.is.null,expires_at.gte.' + new Date().toISOString())
            .maybeSingle(),
          supabase
            .from('user_access')
            .select('id, access_type, expires_at, is_active')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .gte('expires_at', new Date().toISOString())
            .maybeSingle()
        ]);

        const hasAccess = !!manualAccessResult.data || !!subscriptionAccessResult.data;
        const hasManual = !!manualAccessResult.data;
        const accessType = subscriptionAccessResult.data?.access_type || (manualAccessResult.data ? 'manual' : null);
        const expiresAt = subscriptionAccessResult.data?.expires_at || manualAccessResult.data?.expires_at || null;

        setState({
          hasActiveAccess: hasAccess,
          hasManualAccess: hasManual,
          accessType: accessType,
          expiresAt: expiresAt,
          loading: false,
          initialized: true,
        });

        if (import.meta.env.DEV) {
          console.log('[PaymentContext] Fallback result:', {
            hasAccess,
            accessType,
            expiresAt,
            manualAccess: !!manualAccessResult.data,
            subscriptionAccess: !!subscriptionAccessResult.data
          });
        }
      } catch (fallbackError) {
        // Final fallback - deny access
        console.error('Fallback query also failed:', fallbackError);
        setState({ hasActiveAccess: false, hasManualAccess: false, accessType: null, expiresAt: null, loading: false, initialized: true });
      }
    }
  }, [user, session]);

  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (import.meta.env.DEV) {
        console.log('[PaymentContext] Auth state changed:', event, session?.user?.email);
      }

      // Fetch payment status on these events
      if (event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        if (import.meta.env.DEV) {
          console.log('[PaymentContext] Triggering fetchStatus due to:', event);
        }
        fetchStatus();
      }
    });

    // Cleanup subscription on unmount
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [fetchStatus]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <PaymentContext.Provider value={{ ...state, refetch: fetchStatus }}>
      {children}
    </PaymentContext.Provider>
  );
}

export function usePaymentStatus() {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePaymentStatus must be used within PaymentProvider');
  }
  return context;
}
