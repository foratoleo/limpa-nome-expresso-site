import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface PaymentContextType {
  hasActiveAccess: boolean;
  accessType: 'subscription' | 'one_time' | null;
  expiresAt: string | null;
  loading: boolean;
  refetch: () => Promise<void>;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export function PaymentProvider({ children }: { children: ReactNode }) {
  const { user, session } = useAuth();
  const [state, setState] = useState({
    hasActiveAccess: false,
    accessType: null as 'subscription' | 'one_time' | null,
    expiresAt: null as string | null,
    loading: true,
  });

  const fetchStatus = useCallback(async () => {
    if (!user || !session) {
      setState({ hasActiveAccess: false, accessType: null, expiresAt: null, loading: false });
      return;
    }

    try {
      const token = session.access_token;
      const response = await fetch('/api/payments/status', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch payment status');
      }

      const data = await response.json();
      setState({
        hasActiveAccess: data.hasActiveAccess,
        accessType: data.accessType,
        expiresAt: data.expiresAt,
        loading: false,
      });
    } catch (error) {
      console.error('Error fetching payment status:', error);
      setState({ hasActiveAccess: false, accessType: null, expiresAt: null, loading: false });
    }
  }, [user, session]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

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
