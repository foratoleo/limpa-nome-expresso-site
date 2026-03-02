import { ScalesIcon } from "@/utils/icons";
import { Container } from "@/components/ui/container";

interface LegalCitation {
  id: string;
  icon: React.ReactNode;
  lawName: string;
  description: string;
}

const legalCitations: LegalCitation[] = [
  {
    id: "cdc-art-43",
    icon: <span style={{ color: "#d39e17" }}><ScalesIcon size="medium" label="" /></span>,
    lawName: "Art. 43, § 2º do CDC",
    description: "A abertura de cadastro de inadimplentes deverá ser comunicada por escrito ao consumidor",
  },
  {
    id: "stj-sumula-359",
    icon: <span style={{ color: "#d39e17" }}><ScalesIcon size="medium" label="" /></span>,
    lawName: "Súmula 359 do STJ",
    description: "Cabe ao órgão mantenedor do Cadastro de Proteção ao Crédito a notificação do devedor",
  },
  {
    id: "lei-9099-art9",
    icon: <span style={{ color: "#d39e17" }}><ScalesIcon size="medium" label="" /></span>,
    lawName: "Art. 9º da Lei 9.099/95",
    description: "Nas causas de até 20 salários mínimos, as partes comparecerão pessoalmente",
  },
  {
    id: "cnj-372-21",
    icon: <span style={{ color: "#d39e17" }}><ScalesIcon size="medium" label="" /></span>,
    lawName: "Resolução CNJ nº 372/21",
    description: "Institui o Balcão Virtual para atendimento imediato por videoconferência",
  },
];

interface LegalBasisSectionProps {
  className?: string;
}

export function LegalBasisSection({ className = "" }: LegalBasisSectionProps) {
  return (
    <section id="base-legal" className={`py-16 ${className}`}>
      <Container>
        <div className="text-center mb-10">
          <h2
            className="text-3xl font-bold mb-3"
            style={{
              color: "#f1f5f9",
              fontFamily: "'Public Sans', sans-serif",
            }}
          >
            Fundamentação Legal
          </h2>
          <p
            className="text-lg"
            style={{
              color: "#94a3b8",
            }}
          >
            Todo o processo é baseado em leis e jurisprudência
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {legalCitations.map((citation) => (
            <div
              key={citation.id}
              className="p-5 rounded-2xl"
              style={{
                backgroundColor: "rgba(22, 40, 71, 0.95)",
                border: "1px solid rgba(211, 158, 23, 0.2)",
              }}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {citation.icon}
                </div>
                <div className="flex-1">
                  <h3
                    className="font-semibold text-base mb-2"
                    style={{
                      color: "#d39e17",
                      fontFamily: "'Public Sans', sans-serif",
                    }}
                  >
                    {citation.lawName}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{
                      color: "#94a3b8",
                    }}
                  >
                    {citation.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

export default LegalBasisSection;
