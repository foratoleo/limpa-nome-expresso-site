import { useState } from "react";
import { useDocuments } from "@/hooks/useDocuments";
import type { UserDocument } from "@/types/supabase";
import { FileText, Download, Trash2, Edit2, X, Check } from "lucide-react";

interface DocumentCardProps {
  document: UserDocument;
}

const CATEGORY_COLORS: Record<string, string> = {
  rg: "#60a5fa",
  cpf: "#22c55e",
  comprovante: "#f59e0b",
  peticao: "#a855f7",
  geral: "#94a3b8",
};

export function DocumentCard({ document }: DocumentCardProps) {
  const { deleteDocument, updateDocument } = useDocuments();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(document.name);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (isDeleting) {
      await deleteDocument(document.id);
      setIsDeleting(false);
    } else {
      setIsDeleting(true);
      setTimeout(() => setIsDeleting(false), 3000);
    }
  };

  const handleSave = async () => {
    if (name !== document.name) {
      await updateDocument(document.id, { name });
    }
    setIsEditing(false);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR");
  };

  const formatSize = (bytes: number | null) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div
      className="rounded-xl border p-4 transition-colors"
      style={{
        backgroundColor: "rgba(22, 40, 71, 0.95)",
        borderColor: "rgba(211, 158, 23, 0.2)",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileText size={20} style={{ color: "#d39e17" }} />
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: `${CATEGORY_COLORS[document.category] || "#94a3b8"}20`,
              color: CATEGORY_COLORS[document.category] || "#94a3b8",
            }}
          >
            {document.category}
          </span>
        </div>
        <div className="flex gap-1">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="p-1.5 rounded-lg hover:bg-[rgba(34,197,94,0.2)]"
                style={{ color: "#22c55e" }}
              >
                <Check size={16} />
              </button>
              <button
                onClick={() => {
                  setName(document.name);
                  setIsEditing(false);
                }}
                className="p-1.5 rounded-lg hover:bg-[rgba(239,68,68,0.2)]"
                style={{ color: "#94a3b8" }}
              >
                <X size={16} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
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
            </>
          )}
        </div>
      </div>

      {/* Name */}
      {isEditing ? (
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-2 py-1 rounded border bg-transparent outline-none"
          style={{
            borderColor: "rgba(211, 158, 23, 0.3)",
            color: "#f1f5f9",
          }}
          autoFocus
        />
      ) : (
        <h4 className="font-medium truncate mb-2" style={{ color: "#f1f5f9" }}>
          {document.name}
        </h4>
      )}

      {/* Meta */}
      <div className="flex items-center justify-between text-xs" style={{ color: "#94a3b8" }}>
        <span>{formatDate(document.created_at)}</span>
        {document.file_size && <span>{formatSize(document.file_size)}</span>}
      </div>

      {/* Download */}
      <a
        href={document.file_url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 mt-3 py-2 rounded-lg border transition-colors hover:border-[#d39e17]"
        style={{
          borderColor: "rgba(211, 158, 23, 0.2)",
          color: "#d39e17",
        }}
      >
        <Download size={16} />
        <span className="text-sm">Baixar</span>
      </a>
    </div>
  );
}
