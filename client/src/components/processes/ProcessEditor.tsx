import { useState, useEffect } from "react";
import { useProcesses } from "@/hooks/useProcesses";
import { X, Save } from "lucide-react";

interface ProcessEditorProps {
  processId: string | null;
  onClose: () => void;
}

const STATUS_OPTIONS = [
  { value: "em_andamento", label: "Em Andamento" },
  { value: "aguardando", label: "Aguardando" },
  { value: "concluido", label: "Concluido" },
  { value: "arquivado", label: "Arquivado" },
];

export function ProcessEditor({ processId, onClose }: ProcessEditorProps) {
  const { processes, createProcess, updateProcess } = useProcesses();
  const [processNumber, setProcessNumber] = useState("");
  const [status, setStatus] = useState("em_andamento");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const isEditing = !!processId;

  useEffect(() => {
    if (processId) {
      const process = processes.find((p) => p.id === processId);
      if (process) {
        setProcessNumber(process.process_number || "");
        setStatus(process.status);
        setNotes(process.notes || "");
      }
    }
  }, [processId, processes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSaving(true);

    const data = {
      process_number: processNumber || null,
      status,
      notes: notes || null,
    };

    if (isEditing && processId) {
      await updateProcess(processId, data);
    } else {
      await createProcess(data);
    }

    setSaving(false);
    onClose();
  };

  const formatProcessNumber = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 15) return numbers;
    return `${numbers.slice(0, 15)}-${numbers.slice(15, 19)}.${numbers.slice(19, 23)}.${numbers.slice(23)}`;
  };

  return (
    <div
      className="rounded-2xl border p-6"
      style={{
        backgroundColor: "rgba(22, 40, 71, 0.95)",
        borderColor: "rgba(211, 158, 23, 0.3)",
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold" style={{ color: "#f1f5f9" }}>
          {isEditing ? "Editar Processo" : "Novo Processo"}
        </h3>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-[rgba(148,163,184,0.1)]"
          style={{ color: "#94a3b8" }}
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Process Number */}
        <div>
          <label className="block text-sm mb-1" style={{ color: "#94a3b8" }}>
            Numero do Processo (opcional)
          </label>
          <input
            type="text"
            value={processNumber}
            onChange={(e) => setProcessNumber(formatProcessNumber(e.target.value))}
            placeholder="Ex: 1234567-89.2024.8.26.0100"
            maxLength={25}
            className="w-full px-4 py-2 rounded-xl border bg-transparent outline-none focus:border-[#d39e17] font-mono"
            style={{
              borderColor: "rgba(211, 158, 23, 0.2)",
              color: "#f1f5f9",
            }}
          />
          <p className="text-xs mt-1" style={{ color: "#64748b" }}>
            Encontre o numero na consulta do e-SAJ
          </p>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm mb-2" style={{ color: "#94a3b8" }}>
            Status
          </label>
          <div className="grid grid-cols-2 gap-2">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setStatus(opt.value)}
                className="px-4 py-2 rounded-xl border transition-colors"
                style={{
                  borderColor: status === opt.value ? "#d39e17" : "rgba(211, 158, 23, 0.2)",
                  color: status === opt.value ? "#d39e17" : "#94a3b8",
                  backgroundColor: status === opt.value ? "rgba(211, 158, 23, 0.1)" : "transparent",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm mb-1" style={{ color: "#94a3b8" }}>
            Observacoes (opcional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Adicione observacoes sobre o processo..."
            rows={4}
            className="w-full px-4 py-2 rounded-xl border bg-transparent outline-none focus:border-[#d39e17] resize-none"
            style={{
              borderColor: "rgba(211, 158, 23, 0.2)",
              color: "#f1f5f9",
            }}
          />
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border font-medium transition-colors"
            style={{
              borderColor: "rgba(211, 158, 23, 0.2)",
              color: "#94a3b8",
            }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50"
            style={{
              backgroundColor: "#d39e17",
              color: "#12110d",
            }}
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  );
}
