import { Container } from "@/components/ui/container";
import { WarningIcon } from "@/utils/icons";

const painPoints = [
  {
    id: 1,
    text: "Nome sujo no Serasa/SPC sem ter sido notificado",
  },
  {
    id: 2,
    text: "Negativação indevida impedindo crédito",
  },
  {
    id: 3,
    text: "Dificuldade em conseguir emprego por causa do score",
  },
  {
    id: 4,
    text: "Cobranças abusivas de empresas de \"limpa nome\"",
  },
];

export function PainPointsSection() {
  return (
    <section className="py-16 md:py-24">
      <Container>
        <h2
          className="text-2xl md:text-3xl font-bold text-center mb-12"
          style={{ color: "#f1f5f9" }}
        >
          Você está nessa situação?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {painPoints.map((point) => (
            <div
              key={point.id}
              className="p-6 backdrop-blur-sm"
              style={{
                backgroundColor: "rgba(22, 40, 71, 0.95)",
                border: "1px solid rgba(211, 158, 23, 0.2)",
                borderRadius: "24px",
              }}
            >
              <div className="flex items-start gap-4">
                <span className="flex-shrink-0 mt-1" style={{ color: "#d39e17" }}>
                  <WarningIcon
                    size="medium"
                    label="Alerta"
                    color="currentColor"
                  />
                </span>
                <p
                  className="text-base md:text-lg leading-relaxed"
                  style={{ color: "#94a3b8" }}
                >
                  {point.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
