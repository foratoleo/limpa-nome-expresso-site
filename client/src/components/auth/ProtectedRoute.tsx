import { ReactNode, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { usePaymentStatus } from "@/contexts/PaymentContext";

interface ProtectedRouteProps {
  children: ReactNode;
  requirePayment?: boolean;
}

export function ProtectedRoute({ children, requirePayment = true }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const { hasActiveAccess, loading: paymentLoading } = usePaymentStatus();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (loading || (requirePayment && paymentLoading)) {
      return;
    }

    if (!user) {
      setLocation("/");
      return;
    }

    if (requirePayment && !hasActiveAccess) {
      setLocation("/checkout");
      return;
    }
  }, [user, loading, requirePayment, hasActiveAccess, paymentLoading, setLocation]);

  if (loading || (requirePayment && paymentLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#12110d" }}>
        <div className="text-center">
          <div
            className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: "#d39e17", borderTopColor: "transparent" }}
          />
          <p style={{ color: "#94a3b8" }}>Verificando autenticacao...</p>
        </div>
      </div>
    );
  }

  if (!user || (requirePayment && !hasActiveAccess)) {
    return null;
  }

  return <>{children}</>;
}
