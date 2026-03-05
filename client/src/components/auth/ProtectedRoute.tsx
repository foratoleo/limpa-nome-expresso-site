import { ReactNode, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";

interface ProtectedRouteProps {
  children: ReactNode;
  requirePayment?: boolean;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requirePayment = true, requireAdmin = false }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const { hasAccess, loading: paymentLoading, hasManualAccess, initialized } = useSubscription();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('[ProtectedRoute] Check:', {
        user: user?.email,
        loading,
        paymentLoading,
        requirePayment,
        requireAdmin,
        hasAccess,
        hasManualAccess,
        userRole: user?.user_metadata?.role
      });
    }

    if (loading || (requirePayment && !initialized)) {
      if (import.meta.env.DEV) {
        console.log('[ProtectedRoute] Still loading - waiting...', {
          loading,
          paymentLoading,
          initialized,
          userExists: !!user
        });
      }
      return;
    }

    if (!user) {
      setLocation("/");
      return;
    }

    // Admin bypass - admins always have access
    if (user?.user_metadata?.role === 'admin') {
      if (import.meta.env.DEV) {
        console.log('[ProtectedRoute] Admin bypass - access granted');
      }
      return;
    }

    // Only check payment access if NOT loading
    if (requirePayment && !paymentLoading && !hasAccess) {
      if (import.meta.env.DEV) {
        console.log('[ProtectedRoute] Redirecting to /checkout - no access', {
          hasAccess,
          hasManualAccess
        });
      }
      setLocation("/checkout");
      return;
    }

    if (requireAdmin && user.user_metadata?.role !== 'admin') {
      setLocation("/");
      return;
    }
  }, [user, loading, requirePayment, requireAdmin, hasAccess, hasManualAccess, paymentLoading, initialized, setLocation]);

  if (loading || (requirePayment && !initialized)) {
    const reason = loading ? 'Auth loading' : 'Payment not initialized';
    console.log('[ProtectedRoute] Still waiting:', {
      loading,
      initialized,
      requirePayment,
      paymentLoading,
      reason,
      userEmail: user?.email
    });

    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#12110d" }}>
        <div className="text-center">
          <div
            className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: "#d39e17", borderTopColor: "transparent" }}
          />
          <p style={{ color: "#94a3b8" }}>Verificando autenticacao...</p>
          {import.meta.env.DEV && (
            <p style={{ color: "#64748b", fontSize: "0.75rem", marginTop: "0.5rem" }}>
              {reason}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Admin bypass - admins always have access
  if (user?.user_metadata?.role === 'admin') {
    if (import.meta.env.DEV) {
      console.log('[ProtectedRoute] Admin bypass (render) - access granted');
    }
    return <>{children}</>;
  }

  if (!user || (requirePayment && !hasAccess) || (requireAdmin && user.user_metadata?.role !== 'admin')) {
    return null;
  }

  return <>{children}</>;
}
