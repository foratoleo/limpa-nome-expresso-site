import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useAccessStatus } from '@/hooks/useAccessStatus';
import { debugAuthFlow } from '@/lib/debugAuth';

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
  // Delegate to React Query hook
  const { hasAccess, hasManualAccess, accessType, expiresAt, isLoading, initialized, refetch, error } = useAccessStatus();

  const value: PaymentContextType = {
    hasActiveAccess: hasAccess,
    hasManualAccess: hasManualAccess,
    accessType: accessType,
    expiresAt: expiresAt,
    loading: isLoading,
    initialized: initialized,
    refetch: refetch,
  };

  // Log context value changes
  useEffect(() => {
    debugAuthFlow('PaymentContext: Context value updated', {
      hasActiveAccess: hasAccess,
      hasManualAccess: hasManualAccess,
      accessType,
      expiresAt,
      isLoading,
      initialized,
      hasError: !!error,
      errorMessage: error?.message,
    });
  }, [hasAccess, hasManualAccess, accessType, expiresAt, isLoading, initialized, error]);

  // Log errors
  useEffect(() => {
    if (error) {
      debugAuthFlow('PaymentContext: Error fetching access status', {
        errorMessage: error.message,
        errorStack: error.stack,
      });
    }
  }, [error]);

  return (
    <PaymentContext.Provider value={value}>
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
