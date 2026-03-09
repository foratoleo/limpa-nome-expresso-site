import { useChecklistSync } from "@/hooks/useChecklistSync";
import { ArrowRight, ExternalLink } from "lucide-react";

const STEPS = [
  { number: 1, title: "Reunir Documentos", description: "RG, CPF, comprovantes" },
  { number: 2, title: "Preparar Peticao", description: "Use nossos modelos pre-preenchidos" },
  { number: 3, title: "Protocolar no sistema judicial", description: "Sistema do tribunal" },
  { number: 4, title: "Agendar Balcão Virtual", description: "Atendimento por video" },
  { number: 5, title: "Acompanhar Processo", description: "Aguarde a decisao" },
];

const TOTAL_ITEMS = 30;

export function NextSteps() {
  const { checked } = useChecklistSync(TOTAL_ITEMS);

  const getStepStatus = (stepNumber: number) => {
    const stepItems = Object.keys(checked).filter((key) =>
      key.startsWith(`step${stepNumber}`)
    );
    const completed = stepItems.filter((key) => checked[key]).length;
    return {
      completed,
      total: stepItems.length || 6,
      isComplete: completed === (stepItems.length || 6),
      isInProgress: completed > 0,
    };
  };

  const nextStep = STEPS.find((step) => {
    const status = getStepStatus(step.number);
    return !status.isComplete;
  });

  if (!nextStep) {
    return (
      <div
        className="rounded-2xl border p-6"
        style={{
          backgroundColor: "rgba(22, 40, 71, 0.95)",
          borderColor: "rgba(34, 197, 94, 0.3)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "rgba(34, 197, 94, 0.2)" }}
          >
            <span style={{ color: "#22c55e" }}>✓</span>
          </div>
          <div>
            <h3 className="font-semibold" style={{ color: "#22c55e" }}>
              Parabens!
            </h3>
            <p style={{ color: "#94a3b8" }}>
              Voce completou todas as etapas do guia.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl border p-6"
      style={{
        backgroundColor: "rgba(22, 40, 71, 0.95)",
        borderColor: "rgba(211, 158, 23, 0.3)",
      }}
    >
      <h3 className="text-lg font-semibold mb-4" style={{ color: "#f1f5f9" }}>
        Proximo Passo
      </h3>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg"
          style={{
            backgroundColor: "rgba(211, 158, 23, 0.2)",
            color: "#d39e17",
          }}
        >
          {nextStep.number}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold" style={{ color: "#f1f5f9" }}>
            {nextStep.title}
          </h4>
          <p className="text-sm" style={{ color: "#94a3b8" }}>
            {nextStep.description}
          </p>
        </div>
        <a
          href="/"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2 font-medium transition-colors sm:w-auto"
          style={{
            backgroundColor: "#d39e17",
            color: "#12110d",
          }}
        >
          Continuar
          <ArrowRight size={16} />
        </a>
      </div>
    </div>
  );
}
