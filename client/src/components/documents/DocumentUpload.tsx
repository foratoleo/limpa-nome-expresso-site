import { useState, useCallback } from "react";
import { useDocuments } from "@/hooks/useDocuments";
import { Upload, X, FileText, Check } from "lucide-react";

interface DocumentUploadProps {
  onClose: () => void;
}

const CATEGORIES = [
  { value: "rg", label: "RG" },
  { value: "cpf", label: "CPF" },
  { value: "comprovante", label: "Comprovante" },
  { value: "peticao", label: "Peticao" },
  { value: "geral", label: "Geral" },
  { value: "outro", label: "Outro" },
];

export function DocumentUpload({ onClose }: DocumentUploadProps) {
  const { uploadDocument } = useDocuments();
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("geral");
  const [notes, setNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      if (!name) {
        setName(droppedFile.name.replace(/\.[^/.]+$/, ""));
      }
    }
  }, [name]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!name) {
        setName(selectedFile.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !name) return;

    setUploading(true);
    const success = await uploadDocument(file, name, category, notes);
    setUploading(false);

    if (success) {
      onClose();
    }
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
          Enviar Documento
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
        {/* File Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            dragOver ? "border-[#d39e17]" : ""
          }`}
          style={{
            borderColor: dragOver ? "#d39e17" : "rgba(211, 158, 23, 0.3)",
          }}
        >
          {file ? (
            <div className="flex items-center justify-center gap-3">
              <FileText size={24} style={{ color: "#d39e17" }} />
              <span style={{ color: "#f1f5f9" }}>{file.name}</span>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="p-1 rounded hover:bg-[rgba(239,68,68,0.2)]"
                style={{ color: "#94a3b8" }}
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <>
              <Upload size={32} className="mx-auto mb-3" style={{ color: "#94a3b8" }} />
              <p style={{ color: "#94a3b8" }}>
                Arraste um arquivo ou{" "}
                <label className="cursor-pointer underline" style={{ color: "#d39e17" }}>
                  clique para selecionar
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </p>
              <p className="text-xs mt-2" style={{ color: "#64748b" }}>
                PDF, JPG ou PNG (max. 10MB)
              </p>
            </>
          )}
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm mb-1" style={{ color: "#94a3b8" }}>
            Nome do documento
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: RG frente"
            className="w-full px-4 py-2 rounded-xl border bg-transparent outline-none focus:border-[#d39e17]"
            style={{
              borderColor: "rgba(211, 158, 23, 0.2)",
              color: "#f1f5f9",
            }}
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm mb-1" style={{ color: "#94a3b8" }}>
            Categoria
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border bg-transparent outline-none"
            style={{
              borderColor: "rgba(211, 158, 23, 0.2)",
              color: "#f1f5f9",
              backgroundColor: "rgba(22, 40, 71, 0.95)",
            }}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm mb-1" style={{ color: "#94a3b8" }}>
            Observacoes (opcional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Adicione observacoes sobre o documento..."
            rows={3}
            className="w-full px-4 py-2 rounded-xl border bg-transparent outline-none focus:border-[#d39e17] resize-none"
            style={{
              borderColor: "rgba(211, 158, 23, 0.2)",
              color: "#f1f5f9",
            }}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!file || !name || uploading}
          className="w-full py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: "#d39e17",
            color: "#12110d",
          }}
        >
          {uploading ? "Enviando..." : "Enviar Documento"}
        </button>
      </form>
    </div>
  );
}
