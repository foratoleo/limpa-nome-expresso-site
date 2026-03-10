import type { ReactNode } from "react";
import { Lock, ShieldCheck, CreditCard, BadgeCheck, Scale, UserCheck, EyeOff, Star } from "lucide-react";
import { Container } from "@/components/ui/container";

// =============================================================================
// TRUST SEALS SECTION - Selos de Confiança e Segurança
// =============================================================================

interface TrustBadge {
  id: string;
  icon: ReactNode;
  label: string;
  sublabel?: string;
  color: string;
}

const badges: TrustBadge[] = [
  {
    id: "ssl",
    icon: <Lock size={20} />,
    label: "SSL 256-bit",
    sublabel: "Conexão criptografada",
    color: "#22c55e",
  },
  {
    id: "lgpd",
    icon: <ShieldCheck size={20} />,
    label: "LGPD Compliant",
    sublabel: "Seus dados protegidos",
    color: "#60a5fa",
  },
  {
    id: "pagamento-seguro",
    icon: <CreditCard size={20} />,
    label: "Pagamento Seguro",
    sublabel: "Processado pelo Stripe",
    color: "#22c55e",
  },
  {
    id: "garantia-7dias",
    icon: <BadgeCheck size={20} />,
    label: "Garantia de 7 Dias",
    sublabel: "Reembolso total",
    color: "#d39e17",
  },
  {
    id: "cdc-legal",
    icon: <Scale size={20} />,
    label: "Base no CDC",
    sublabel: "Art. 43, § 2º",
    color: "#d39e17",
  },
  {
    id: "sem-advogado",
    icon: <UserCheck size={20} />,
    label: "Sem Advogado",
    sublabel: "Processo autônomo",
    color: "#22c55e",
  },
  {
    id: "privacy",
    icon: <EyeOff size={20} />,
    label: "Dados Privados",
    sublabel: "Nunca vendemos",
    color: "#60a5fa",
  },
  {
    id: "usuarios",
    icon: <Star size={20} />,
    label: "1000+ Usuários",
    sublabel: "Casos resolvidos",
    color: "#d39e17",
  },
];

export function TrustSealsSection() {
  return (
    <section className="py-12 md:py-16" id="selos-confiança">
      <Container>
        {/* Visually hidden heading for screen readers */}
        <h2 className="sr-only">Selos de confiança e segurança</h2>

        {/* Visible subtitle */}
        <p
          className="text-center text-sm font-semibold uppercase tracking-widest mb-6"
          style={{ color: "#64748b" }}
        >
          Compra 100% segura
        </p>

        {/* Badges grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className="flex flex-col items-center text-center gap-2 p-4 rounded-xl"
              style={{
                background: "rgba(22, 40, 71, 0.95)",
                border: "1px solid rgba(211, 158, 23, 0.15)",
              }}
            >
              {/* Icon wrapper */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: `${badge.color}26`,
                  color: badge.color,
                }}
                role="img"
                aria-label={badge.label}
              >
                {badge.icon}
              </div>

              {/* Label */}
              <span
                className="text-sm font-semibold leading-tight"
                style={{ color: "#f1f5f9" }}
              >
                {badge.label}
              </span>

              {/* Sublabel */}
              {badge.sublabel && (
                <span
                  className="text-xs leading-tight"
                  style={{ color: "#64748b" }}
                >
                  {badge.sublabel}
                </span>
              )}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
