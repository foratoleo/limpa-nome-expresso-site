import { useState } from "react";
import { useProcesses } from "@/hooks/useProcesses";
import type { UserProcess } from "@/types/supabase";
import { Scale, Edit2, Trash2, ExternalLink, Calendar, FileText } from "lucide-react";

interface ProcessCardProps {
  process: UserProcess;
  onEdit: () => void;
}

const STATUS_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  em_andamento: { bg: "rgba(96, 165, 250, 0.1)", border: "rgba(96, 165, 250, 0.3)", text: "#60a5fa" },
  aguardando: { bg: "rgba(245, 158, 11, 0.1)", border: "rgba(245, 158, 11, 0.3)", text: "#f59e0b" },
  concluido: { bg: "rgba(34, 197, 94, 0.1)", border: "rgba(34, 197, 94, 0.3)", text: "#22c55e" },
  arquivado: { bg: "rgba(148, 163, 184, 0.1)", border: "rgba(148, 163, 184, 0.3)", text: "#94a3b8" },
};

const STATUS_LABELS: Record<string, string> = {
  em_andamento: "Em Andamento",
  aguardando: "Aguardando",
  concluido: "Concluido",
  arquivado: "Arquivado",
};

export function ProcessCard({ process, onEdit }: ProcessCardProps) {
  const { deleteProcess } = useProcesses();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (isDeleting) {
      await deleteProcess(process.id);
    } else {
      setIsDeleting(true);
      setTimeout(() => setIsDeleting(false), 3000);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR");
  };

  const statusStyle = STATUS_COLORS[process.status] || STATUS_COLORS.em_andamento;

  return (
    <div
      className="rounded-xl border p-5 transition-colors"
      style={{
        backgroundColor: "rgba(22, 40, 71, 0.95)",
        borderColor: statusStyle.border,
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: statusStyle.bg }}
          >
            <Scale size={20} style={{ color: statusStyle.text }} />
          </div>
          <div>
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: statusStyle.bg,
                color: statusStyle.text,
              }}
            >
              {STATUS_LABELS[process.status] || process.status}
            </span>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg hover:bg-[rgba(211,158,23,0.2)]"
            style={{ color: "#94a3b8" }}
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 rounded-lg hover:bg-[rgba(239,68,68,0.2)]"
            style={{ color: isDeleting ? "#ef4444" : "#94a3b8" }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Process Number */}
      <div className="mb-3">
        <p className="text-xs mb-1" style={{ color: "#94a3b8" }}>
          Numero do Processo
        </p>
        <p className="font-mono font-medium" style={{ color: "#f1f5f9" }}>
          {process.process_number || "Nao informado"}
        </p>
      </div>

      {/* Notes */}
      {process.notes && (
        <div className="mb-3">
          <p className="text-xs mb-1" style={{ color: "#94a3b8" }}>
            Observacoes
          </p>
          <p className="text-sm" style={{ color: "#e8e4d8" }}>
            {process.notes}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-[rgba(148,163,184,0.1)]">
        <div className="flex items-center gap-1 text-xs" style={{ color: "#64748b" }}>
          <Calendar size={12} />
          <span>Adicionado em {formatDate(process.created_at)}</span>
        </div>
        {process.process_number && (
          <a
            href={`https://esaj.tjsp.jus.br/cpopg/search.do?conversationId=&dadosConsulta.localPesquisa.cdLocal=-1&cbPesquisa=NUMPROC&dadosConsulta.tipoNuProc=UNIFICADO&numeroDigitoAnoUnificado=${process.process_number.slice(0, 13)}&foroNumeroUnificado=${process.process_number.slice(-4)}&dadosConsulta.valorConsultaNuUnificado=${process.process_number}&dadosConsulta.valorConsulta=&uuidCaptcha=`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs hover:underline"
            style={{ color: "#60a5fa" }}
          >
            <ExternalLink size={12} />
            Consultar
          </a>
        )}
      </div>
    </div>
  );
}
