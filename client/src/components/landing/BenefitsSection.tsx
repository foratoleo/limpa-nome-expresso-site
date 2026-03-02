import { Container } from "@/components/ui/container";
import { CheckCircleIcon } from "@/utils/icons";

interface BenefitCardProps {
  id: string;
  title: string;
  description: string;
}

function BenefitCard({ title, description }: Omit<BenefitCardProps, 'id'>) {
  return (
    <div
      className="p-6 rounded-3xl"
      style={{
        background: "rgba(22, 40, 71, 0.95)",
        border: "1px solid rgba(34, 197, 94, 0.2)",
      }}
    >
      <div className="flex items-start gap-4">
        <span style={{ color: "#22c55e" }} className="flex-shrink-0">
          <CheckCircleIcon label="Benefit check" />
        </span>
        <div className="flex-1">
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: "#e8e4d8" }}
          >
            {title}
          </h3>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "#94a3b8" }}
          >
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

const benefits: BenefitCardProps[] = [
  {
    id: "guia-completo",
    title: "Guia passo a passo completo",
    description: "Do documento a liminar",
  },
  {
    id: "docs-preenchidos",
    title: "Documentos preenchidos",
    description: "Petição, roteiro, checklist",
  },
  {
    id: "acompanhamento",
    title: "Acompanhamento do processo",
    description: "Monitoramento no e-SAJ",
  },
  {
    id: "base-legal",
    title: "Base legal fundamentada",
    description: "CDC, STJ, Lei 9.099/95",
  },
];

export function BenefitsSection() {
  return (
    <section id="beneficios" className="py-16 md:py-24">
      <Container>
        <h2
          className="text-2xl md:text-3xl font-bold text-center mb-12"
          style={{ color: "#f1f5f9" }}
        >
          Como o Limpa Nome Expresso resolve
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {benefits.map((benefit) => (
            <BenefitCard
              key={benefit.id}
              title={benefit.title}
              description={benefit.description}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
