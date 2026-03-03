interface PricingCardProps {
  price?: number;
  duration?: string;
  title?: string;
  highlighted?: boolean;
}

const COLORS = {
  navy: '#162847',
  gold: '#d39e17',
  goldLight: '#e5b020',
  textPrimary: '#f1f5f9',
  textSecondary: '#94a3b8',
  green: '#22c55e',
} as const;

export function PricingCard({
  price = 149.90,
  duration = '12 meses de acesso',
  title = 'Acesso Premium',
  highlighted = true,
}: PricingCardProps) {
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div
      className={`relative rounded-2xl border p-8 backdrop-blur-[4px] transition-all ${
        highlighted ? 'ring-2' : ''
      }`}
      style={{
        backgroundColor: highlighted
          ? 'rgba(22, 40, 71, 0.9)'
          : 'rgba(22, 40, 71, 0.6)',
        borderColor: highlighted
          ? COLORS.gold
          : 'rgba(211, 158, 23, 0.2)',
        ...(highlighted && { boxShadow: '0 0 0 2px rgba(211, 158, 23, 0.2)' }),
      }}
    >
      {highlighted && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-bold"
          style={{ backgroundColor: COLORS.gold, color: '#12110d' }}
        >
          MAIS POPULAR
        </div>
      )}

      <div className="text-center">
        <h3
          className="text-xl font-bold mb-2"
          style={{ color: COLORS.textPrimary }}
        >
          {title}
        </h3>

        <div className="flex items-baseline justify-center gap-1.5 my-6">
          <span
            className="text-5xl font-bold"
            style={{ color: COLORS.gold }}
          >
            {formatPrice(price)}
          </span>
        </div>

        <p
          className="text-base mb-6"
          style={{ color: COLORS.textSecondary }}
        >
          {duration}
        </p>

        <div
          className="rounded-lg p-4 space-y-2"
          style={{ backgroundColor: 'rgba(34, 197, 94, 0.08)' }}
        >
          <div className="flex items-center justify-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: COLORS.green }}
            />
            <span
              className="text-sm font-medium"
              style={{ color: COLORS.textSecondary }}
            >
              Pagamento único
            </span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: COLORS.green }}
            />
            <span
              className="text-sm font-medium"
              style={{ color: COLORS.textSecondary }}
            >
              Acesso imediato
            </span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: COLORS.green }}
            />
            <span
              className="text-sm font-medium"
              style={{ color: COLORS.textSecondary }}
            >
              Suporte incluso
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
