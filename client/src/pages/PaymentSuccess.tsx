import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { CheckCircle } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { refetch } = useSubscription();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Refetch subscription to get latest status
    refetch();

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setLocation('/guia');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [refetch, setLocation]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#12110d' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#d39e17' }} />
          <p className="mt-4" style={{ color: '#94a3b8' }}>Processando pagamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#12110d' }}>
      <Container as="div" maxWidth="md">
        <div
          className="rounded-2xl border p-8 text-center backdrop-blur-[4px]"
          style={{
            backgroundColor: 'rgba(22, 40, 71, 0.6)',
            borderColor: 'rgba(34, 197, 94, 0.3)',
          }}
        >
          <CheckCircle className="w-16 h-16 mx-auto mb-6" style={{ color: '#22c55e' }} />

          <h1 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: '#f1f5f9' }}>
            Pagamento Confirmado!
          </h1>

          <p className="text-lg mb-6" style={{ color: '#94a3b8' }}>
            Obrigado por assinar o <strong style={{ color: '#d39e17' }}>Limpa Nome Expresso</strong>!
            Sua assinatura está ativa e você já pode acessar todo o conteúdo.
          </p>

          <div
            className="rounded-lg p-4 mb-6"
            style={{ backgroundColor: 'rgba(211, 158, 23, 0.1)' }}
          >
            <p className="text-sm" style={{ color: '#cbd5e1' }}>
              Você será redirecionado para o guia em <strong style={{ color: '#d39e17' }}>{countdown}</strong> segundos...
            </p>
          </div>

          <button
            onClick={() => setLocation('/guia')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all"
            style={{
              backgroundColor: '#d39e17',
              color: '#12110d',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e5b020')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#d39e17')}
          >
            Ir para o Guia
          </button>
        </div>
      </Container>
    </div>
  );
}
