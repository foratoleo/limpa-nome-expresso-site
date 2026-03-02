import { useChecklistSync } from "@/hooks/useChecklistSync";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Clock, AlertCircle } from "lucide-react";

const STEPS = [
  { number: 1, title: "Documentos", items: 6 },
  { number: 2, title: "Peticao", items: 8 },
  { number: 3, title: "Protocolo", items: 6 },
  { number: 4, title: "Balcao Virtual", items: 5 },
  { number: 5, title: "Acompanhamento", items: 5 },
];

const TOTAL_ITEMS = 30;

export function ProgressDashboard() {
  const { checked, progress, totalChecked } = useChecklistSync(TOTAL_ITEMS);

  const stepProgress = STEPS.map((step) => {
    const stepItems = Object.keys(checked).filter((key) =>
      key.startsWith(`step${step.number}`)
    );
    const completed = stepItems.filter((key) => checked[key]).length;
    return {
      ...step,
      completed,
      total: step.items,
      percent: Math.round((completed / step.items) * 100),
    };
  });

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <div
        className="rounded-2xl border p-6"
        style={{
          backgroundColor: "rgba(22, 40, 71, 0.95)",
          borderColor: "rgba(211, 158, 23, 0.3)",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold" style={{ color: "#f1f5f9" }}>
            Progresso Geral
          </h3>
          <span className="text-2xl font-bold" style={{ color: "#d39e17" }}>
            {progress}%
          </span>
        </div>
        <Progress value={progress} className="h-3" />
        <p className="text-sm mt-2" style={{ color: "#94a3b8" }}>
          {totalChecked} de {TOTAL_ITEMS} itens completos
        </p>
      </div>

      {/* Step Progress */}
      <div className="grid gap-4 md:grid-cols-5">
        {stepProgress.map((step) => (
          <div
            key={step.number}
            className="rounded-xl border p-4 text-center"
            style={{
              backgroundColor: "rgba(22, 40, 71, 0.95)",
              borderColor:
                step.percent === 100
                  ? "rgba(34, 197, 94, 0.5)"
                  : step.percent > 0
                  ? "rgba(211, 158, 23, 0.3)"
                  : "rgba(148, 163, 184, 0.2)",
            }}
          >
            <div className="flex justify-center mb-2">
              {step.percent === 100 ? (
                <CheckCircle2 size={24} style={{ color: "#22c55e" }} />
              ) : step.percent > 0 ? (
                <Clock size={24} style={{ color: "#d39e17" }} />
              ) : (
                <Circle size={24} style={{ color: "#94a3b8" }} />
              )}
            </div>
            <h4 className="font-medium text-sm" style={{ color: "#f1f5f9" }}>
              {step.title}
            </h4>
            <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>
              {step.completed}/{step.total}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
