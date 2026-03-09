import { Container } from "@/components/ui/container";
import { ShieldIcon } from "@/utils/icons";

// =============================================================================
// SOCIAL PROOF SECTION - Resultados Reais
// =============================================================================

interface StatItem {
  value: string;
  label: string;
}

interface TrustBadge {
  text: string;
}

const stats: StatItem[] = [
  { value: "1000+", label: "usuários atendidos" },
  { value: "95%", label: "taxa de sucesso" },
  { value: "10 dias", label: "tempo médio" },
  { value: "12+", label: "meses de blindagem" },
];

const trustBadges: TrustBadge[] = [
  { text: "Baseado no CDC - Art. 43, § 2º" },
  { text: "Aprovado pelo tribunal" },
  { text: "Sem advogado necessário" },
  { text: "Processo 100% online" },
];

export function SocialProofSection() {
  return (
    <section className="py-16 md:py-20">
      <Container>
        {/* Section Title */}
        <h2 className="text-2xl md:text-3xl font-bold text-center text-white mb-12">
          Resultados reais
        </h2>

        {/* Statistics Grid */}
        <div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12 p-6 md:p-8 rounded-2xl"
          style={{
            background: "rgba(22, 40, 71, 0.95)",
            border: "1px solid rgba(211, 158, 23, 0.2)",
          }}
        >
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <p
                className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2"
                style={{ color: "#d39e17" }}
              >
                {stat.value}
              </p>
              <p
                className="text-sm md:text-base"
                style={{ color: "#64748b" }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {trustBadges.map((badge, index) => (
            <div
              key={index}
              className="flex items-center justify-center gap-3 p-4 rounded-xl"
              style={{
                background: "rgba(22, 40, 71, 0.95)",
                border: "1px solid rgba(211, 158, 23, 0.2)",
              }}
            >
              <div style={{ color: "#22c55e" }}>
                <ShieldIcon
                  size="medium"
                  label="Badge de confiança"
                />
              </div>
              <span
                className="text-sm md:text-base font-medium"
                style={{ color: "#22c55e" }}
              >
                {badge.text}
              </span>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
