import { useLocation } from 'wouter';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { useAuth } from '@/contexts/AuthContext';

const COLORS = {
  background: '#12110d',
  navy: '#162847',
  gold: '#d39e17',
  goldLight: '#e5b020',
  textPrimary: '#f1f5f9',
  textSecondary: '#94a3b8',
  green: '#22c55e',
} as const;

export default function WelcomeHome() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário';

  const handleNavigate = () => {
    setLocation('/guia');
  };

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
            borderColor: 'rgba(211, 158, 23, 0.3)',
          }}
        >
          {/* Success Icon */}
          <div
            className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)' }}
          >
            <CheckCircle className="w-10 h-10" style={{ color: COLORS.green }} />
          </div>

          {/* Welcome Message */}
          <h1 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: COLORS.textPrimary }}>
            Bem-vindo ao CPF Blindado!
          </h1>

          <p className="text-lg mb-6" style={{ color: COLORS.textSecondary }}>
            Olá, <strong style={{ color: COLORS.gold }}>{userName}</strong>! Seu cadastro foi realizado com sucesso.
          </p>

          {/* Info Box */}
          <div
            className="rounded-lg p-4 mb-6"
            style={{ backgroundColor: 'rgba(211, 158, 23, 0.1)' }}
          >
            <p className="text-sm" style={{ color: COLORS.textPrimary }}>
              Explore nosso guia completo e descubra como podemos ajudá-lo a limpar seu nome.
            </p>
          </div>

          {/* CTA Button */}
          <button
            onClick={handleNavigate}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all w-full sm:w-auto"
            style={{
              backgroundColor: COLORS.gold,
              color: '#12110d',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = COLORS.goldLight)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = COLORS.gold)}
          >
            Acessar Guia
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </Container>
    </div>
  );
}
