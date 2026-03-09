import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { CheckCircle } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { usePaymentStatus } from '@/contexts/PaymentContext';
import { trackCheckoutCompleted, ANALYTICS_CONFIG } from '@/lib/analytics';

const COLORS = {
  background: '#12110d',
  navy: '#162847',
  gold: '#d39e17',
  goldLight: '#e5b020',
  textPrimary: '#f1f5f9',
  textSecondary: '#94a3b8',
  green: '#22c55e',
} as const;

/**
 * Parse URL parameters to extract Kiwify payment information
 */
function parseKiwifyParams(): {
  isKiwify: boolean;
  saleId: string | null;
  customerEmail: string | null;
  externalReference: string | null;
} {
  const urlParams = new URLSearchParams(window.location.search);
  const source = urlParams.get('source');

  return {
    isKiwify: source === 'kiwify',
    saleId: urlParams.get('sale_id') || urlParams.get('order_id'),
    customerEmail: urlParams.get('email') || urlParams.get('customer_email'),
    externalReference: urlParams.get('external_reference') || urlParams.get('ref'),
  };
}

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();
  const { hasActiveAccess, refetch, loading: paymentLoading } = usePaymentStatus();
  const [countdown, setCountdown] = useState(5);
  const [canProceed, setCanProceed] = useState(false);
  const [isPolling, setIsPolling] = useState(true);
  const [pollCount, setPollCount] = useState(0);
  const [showRefreshButton, setShowRefreshButton] = useState(false);

  // Kiwify-specific state
  const [kiwifyParams] = useState(() => parseKiwifyParams());

  // Max polling attempts: 15 for Kiwify (webhooks may take longer), 10 for others
  const maxPollAttempts = kiwifyParams.isKiwify ? 15 : 10;
  const pollingTimeoutLabel = kiwifyParams.isKiwify ? '45 segundos' : '30 segundos';

  useEffect(() => {
    // Poll payment status every 3 seconds
    // Kiwify webhooks may take longer to process, so we allow more attempts
    const pollPaymentStatus = async () => {
      if (pollCount >= maxPollAttempts || hasActiveAccess) {
        setIsPolling(false);
        if (pollCount >= maxPollAttempts && !hasActiveAccess) {
          setShowRefreshButton(true);
        }
        return;
      }

      await refetch();
      setPollCount((prev) => prev + 1);
    };

    if (isPolling && !hasActiveAccess) {
      const pollTimer = setTimeout(() => {
        pollPaymentStatus();
      }, 3000);

      return () => clearTimeout(pollTimer);
    }

    if (hasActiveAccess) {
      setIsPolling(false);
      setCanProceed(true);

      // Track successful checkout completion
      // Only track once when payment is first confirmed
      const provider = kiwifyParams.isKiwify ? 'kiwify' : 'mercadopago';
      trackCheckoutCompleted({
        provider,
        product_id: ANALYTICS_CONFIG.productId,
        product_name: ANALYTICS_CONFIG.productName,
        price: ANALYTICS_CONFIG.price,
        currency: ANALYTICS_CONFIG.currency,
        email: kiwifyParams.customerEmail || undefined,
        sale_id: kiwifyParams.saleId || undefined,
        external_reference: kiwifyParams.externalReference || undefined,
      });
    }
  }, [isPolling, hasActiveAccess, pollCount, refetch, maxPollAttempts, kiwifyParams]);

  useEffect(() => {
    // Start polling
    refetch();

    // Countdown timer (only starts when payment is confirmed)
    const countdownTimer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimer);
          if (hasActiveAccess) {
            setLocation('/guia');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownTimer);
  }, [refetch, setLocation, hasActiveAccess]);

  if (paymentLoading || isPolling) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: COLORS.background }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: COLORS.gold }} />
          <p className="mt-4" style={{ color: COLORS.textSecondary }}>
            {isPolling ? 'Verificando pagamento...' : 'Processando pagamento...'}
          </p>
          {isPolling && (
            <>
              <p className="mt-2 text-sm" style={{ color: COLORS.textSecondary }}>
                Tentativa {pollCount + 1} de {maxPollAttempts}
              </p>
              {kiwifyParams.isKiwify && (
                <p className="mt-2 text-xs" style={{ color: COLORS.textSecondary }}>
                  Pagamentos via Kiwify podem levar alguns segundos para serem processados
                </p>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-16" style={{ backgroundColor: COLORS.background }}>
      <Container as="div" maxWidth="md">
        <div
          className="rounded-2xl border p-8 text-center backdrop-blur-[4px]"
          style={{
            backgroundColor: 'rgba(22, 40, 71, 0.6)',
            borderColor: 'rgba(34, 197, 94, 0.3)',
          }}
        >
          {/* Success Icon */}
          <div
            className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)' }}
          >
            <CheckCircle className="w-10 h-10" style={{ color: COLORS.green }} />
          </div>

          <h1 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: COLORS.textPrimary }}>
            Pagamento Confirmado!
          </h1>

          <p className="text-lg mb-6" style={{ color: COLORS.textSecondary }}>
            Obrigado por adquirir o <strong style={{ color: COLORS.gold }}>CPF Blindado</strong>!
            Seu acesso de 12 meses está ativo e você já pode começar.
          </p>

          {/* Kiwify-specific sale details */}
          {kiwifyParams.isKiwify && (kiwifyParams.saleId || kiwifyParams.customerEmail) && (
            <div
              className="rounded-lg p-4 mb-4 text-left"
              style={{
                backgroundColor: 'rgba(22, 40, 71, 0.4)',
                border: '1px solid rgba(211, 158, 23, 0.1)',
              }}
            >
              <p className="text-xs uppercase tracking-wide mb-2" style={{ color: COLORS.gold }}>
                Detalhes do Pagamento
              </p>
              {kiwifyParams.saleId && (
                <p className="text-sm mb-1" style={{ color: COLORS.textSecondary }}>
                  <span style={{ color: COLORS.textPrimary }}>Pedido:</span> {kiwifyParams.saleId}
                </p>
              )}
              {kiwifyParams.customerEmail && (
                <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                  <span style={{ color: COLORS.textPrimary }}>Email:</span> {kiwifyParams.customerEmail}
                </p>
              )}
            </div>
          )}

          <div
            className="rounded-lg p-4 mb-6"
            style={{ backgroundColor: 'rgba(211, 158, 23, 0.1)' }}
          >
            <p className="text-sm" style={{ color: COLORS.textPrimary }}>
              Você será redirecionado para o guia em <strong style={{ color: COLORS.gold }}>{countdown}</strong> segundos...
            </p>
          </div>

          <button
            onClick={() => setLocation('/guia')}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all w-full sm:w-auto"
            style={{
              backgroundColor: COLORS.gold,
              color: '#12110d',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = COLORS.goldLight)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = COLORS.gold)}
          >
            Acessar Guia Agora
          </button>

          {showRefreshButton && (
            <div className="mt-4">
              <p className="text-sm mb-3" style={{ color: COLORS.textSecondary }}>
                O pagamento ainda não foi confirmado. Se você já efetuou o pagamento, aguarde alguns segundos e tente novamente.
                {kiwifyParams.isKiwify && (
                  <span className="block mt-1">
                    Pagamentos via PIX podem levar até 2 minutos para serem confirmados.
                  </span>
                )}
              </p>
              <button
                onClick={() => {
                  setPollCount(0);
                  setIsPolling(true);
                  setShowRefreshButton(false);
                  refetch();
                }}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all w-full sm:w-auto"
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid',
                  borderColor: COLORS.gold,
                  color: COLORS.gold,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(211, 158, 23, 0.1)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                  <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                  <path d="M16 16h5v5" />
                </svg>
                Verificar Novamente
              </button>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
