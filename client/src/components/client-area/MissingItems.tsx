import { useChecklistSync } from "@/hooks/useChecklistSync";
import { AlertCircle } from "lucide-react";

const CHECKLIST_ITEMS: Record<string, { step: number; label: string }> = {
  rg_cpf: { step: 1, label: "RG e CPF" },
  comprovante_residencia: { step: 1, label: "Comprovante de residencia" },
  comprovante_renda: { step: 1, label: "Comprovante de renda" },
  relatorio_credito: { step: 1, label: "Print do cadastro de crédito" },
  protocolo_anterior: { step: 1, label: "Protocolo anterior (se houver)" },
  documentos_divida: { step: 1, label: "Documentos da divida" },
};

const TOTAL_ITEMS = 30;

export function MissingItems() {
  const { checked } = useChecklistSync(TOTAL_ITEMS);

  const missingItems = Object.entries(CHECKLIST_ITEMS)
    .filter(([key]) => !checked[`step1_${key}`] && !checked[key])
    .slice(0, 5);

  if (missingItems.length === 0) {
    return null;
  }

  return (
    <div
      className="rounded-2xl border p-6"
      style={{
        backgroundColor: "rgba(22, 40, 71, 0.95)",
        borderColor: "rgba(239, 68, 68, 0.3)",
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle size={20} style={{ color: "#ef4444" }} />
        <h3 className="text-lg font-semibold" style={{ color: "#f1f5f9" }}>
          Itens Pendentes
        </h3>
      </div>

      <ul className="space-y-2">
        {missingItems.map(([key, item]) => (
          <li
            key={key}
            className="flex items-center gap-3 py-2 border-b border-[rgba(148,163,184,0.1)]"
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: "#ef4444" }}
            />
            <span style={{ color: "#e8e4d8" }}>{item.label}</span>
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: "rgba(148, 163, 184, 0.1)",
                color: "#94a3b8",
              }}
            >
              Etapa {item.step}
            </span>
          </li>
        ))}
      </ul>

      <a
        href="/"
        className="inline-flex items-center gap-2 mt-4 text-sm font-medium hover:underline"
        style={{ color: "#d39e17" }}
      >
        Ver checklist completo
      </a>
    </div>
  );
}
