import { useLocation } from 'wouter';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Container } from '@/components/ui/container';

const COLORS = {
  background: '#12110d',
  navy: '#162847',
  gold: '#d39e17',
  goldLight: '#e5b020',
  textPrimary: '#f1f5f9',
  textSecondary: '#94a3b8',
  red: '#ef4444',
  redLight: '#fca5a5',
} as const;

export default function PaymentFailed() {
  const [, setLocation] = useLocation();

  return (
    <div
      className="min-h-screen flex items-center justify-center py-16"
      style={{ backgroundColor: COLORS.background }}
    >
      <Container as="div" maxWidth="md">
        <div
          className="rounded-2xl border p-8 text-center backdrop-blur-[4px]"
          style={{
            backgroundColor: 'rgba(22, 40, 71, 0.6)',
            borderColor: 'rgba(239, 68, 68, 0.3)',
          }}
        >
          {/* Error Icon */}
          <div
            className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)' }}
          >
            <AlertTriangle className="w-8 h-8" style={{ color: COLORS.red }} />
          </div>

          {/* Heading */}
          <h1
            className="text-2xl md:text-3xl font-bold mb-4"
            style={{ color: COLORS.textPrimary }}
          >
            Pagamento não concluído
          </h1>

          {/* Message */}
          <p className="text-lg mb-6" style={{ color: COLORS.textSecondary }}>
            Não conseguimos processar seu pagamento. Isso pode acontecer por
            diversos motivos, como pagamento recusado, cancelado ou expirado.
          </p>

          {/* Tips Section */}
          <div
            className="rounded-lg p-4 mb-6 text-left"
            style={{
              backgroundColor: 'rgba(22, 40, 71, 0.4)',
              border: '1px solid rgba(211, 158, 23, 0.1)',
            }}
          >
            <p
              className="text-sm font-semibold mb-3"
              style={{ color: COLORS.textPrimary }}
            >
              Antes de tentar novamente, verifique:
            </p>
            <ul className="space-y-2 text-sm" style={{ color: COLORS.textSecondary }}>
              <li className="flex items-start gap-2">
                <span style={{ color: COLORS.gold }}>•</span>
                <span>Se os dados do cartão estão corretos</span>
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: COLORS.gold }}>•</span>
                <span>Se há saldo disponível ou limite suficiente</span>
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: COLORS.gold }}>•</span>
                <span>Se o pagamento não foi cancelado pelo banco</span>
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: COLORS.gold }}>•</span>
                <span>Se a sessão não expirou (tempo limite de 30 min)</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setLocation('/checkout')}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all"
              style={{
                backgroundColor: COLORS.gold,
                color: '#12110d',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = COLORS.goldLight)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = COLORS.gold)
              }
            >
              <RefreshCw className="w-4 h-4" />
              Tentar Novamente
            </button>

            <button
              onClick={() => window.location.href = 'https://wa.me/5511999999999'}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all"
              style={{
                backgroundColor: 'transparent',
                color: COLORS.textPrimary,
                border: '1px solid rgba(211, 158, 23, 0.3)',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = 'rgba(211, 158, 23, 0.1)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = 'transparent')
              }
            >
              Falar com Suporte
            </button>
          </div>

          {/* Support Info */}
          <div className="mt-6 pt-6 border-t" style={{ borderColor: 'rgba(211, 158, 23, 0.1)' }}>
            <p className="text-sm" style={{ color: COLORS.textSecondary }}>
              Se o problema persistir, entre em contato com nosso suporte:
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-3 text-sm">
              <a
                href="mailto:suporte@limpanome.com"
                className="hover:underline"
                style={{ color: COLORS.gold }}
              >
                suporte@limpanome.com
              </a>
              <span style={{ color: COLORS.textSecondary }}>•</span>
              <a
                href="https://wa.me/5511999999999"
                className="hover:underline"
                style={{ color: COLORS.gold }}
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
