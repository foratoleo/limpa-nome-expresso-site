import { useState } from "react";
import { useProcesses } from "@/hooks/useProcesses";
import { ProcessCard } from "./ProcessCard";
import { ProcessEditor } from "./ProcessEditor";
import { Plus, Scale } from "lucide-react";

export function ProcessList() {
  const { processes, loading, error } = useProcesses();
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  if (showEditor || editingId) {
    return (
      <ProcessEditor
        processId={editingId}
        onClose={() => {
          setShowEditor(false);
          setEditingId(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold" style={{ color: "#f1f5f9" }}>
            Processos Juridicos
          </h3>
          <p className="text-sm" style={{ color: "#94a3b8" }}>
            Acompanhe seus processos no TJSP
          </p>
        </div>
        <button
          onClick={() => setShowEditor(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-colors"
          style={{
            backgroundColor: "#d39e17",
            color: "#12110d",
          }}
        >
          <Plus size={18} />
          Novo Processo
        </button>
      </div>

      {/* Error */}
      {error && (
        <div
          className="p-4 rounded-xl border"
          style={{
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            borderColor: "rgba(239, 68, 68, 0.3)",
            color: "#ef4444",
          }}
        >
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-12" style={{ color: "#94a3b8" }}>
          Carregando processos...
        </div>
      )}

      {/* Empty State */}
      {!loading && processes.length === 0 && (
        <div
          className="text-center py-12 rounded-2xl border"
          style={{
            backgroundColor: "rgba(22, 40, 71, 0.95)",
            borderColor: "rgba(211, 158, 23, 0.2)",
          }}
        >
          <Scale size={48} className="mx-auto mb-4" style={{ color: "#94a3b8" }} />
          <p style={{ color: "#94a3b8" }}>
            Nenhum processo cadastrado ainda.
          </p>
          <p className="text-sm mt-2" style={{ color: "#64748b" }}>
            Adicione o numero do seu processo para acompanhar.
          </p>
        </div>
      )}

      {/* Process List */}
      {!loading && processes.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {processes.map((process) => (
            <ProcessCard
              key={process.id}
              process={process}
              onEdit={() => setEditingId(process.id)}
            />
          ))}
        </div>
      )}

      {/* External Link */}
      <div
        className="rounded-xl border p-4"
        style={{
          backgroundColor: "rgba(22, 40, 71, 0.95)",
          borderColor: "rgba(96, 165, 250, 0.3)",
        }}
      >
        <a
          href="https://esaj.tjsp.jus.br/cpopg/open.do"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between"
        >
          <div>
            <h4 className="font-medium" style={{ color: "#60a5fa" }}>
              Consultar Processos no e-SAJ
            </h4>
            <p className="text-sm" style={{ color: "#94a3b8" }}>
              Acesse o sistema oficial do TJSP
            </p>
          </div>
          <span style={{ color: "#60a5fa" }}>→</span>
        </a>
      </div>
    </div>
  );
}
