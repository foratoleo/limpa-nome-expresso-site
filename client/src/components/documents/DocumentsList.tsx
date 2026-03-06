import { useState } from "react";
import { useDocuments } from "@/hooks/useDocuments";
import { DocumentCard } from "./DocumentCard";
import { DocumentUpload } from "./DocumentUpload";
import { Plus, Search, Filter } from "lucide-react";

const CATEGORIES = [
  { value: "all", label: "Todos" },
  { value: "rg", label: "RG" },
  { value: "cpf", label: "CPF" },
  { value: "comprovante", label: "Comprovantes" },
  { value: "peticao", label: "Petições" },
  { value: "outro", label: "Outros" },
];

export function DocumentsList() {
  const { documents, loading, error } = useDocuments();
  const [showUpload, setShowUpload] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || doc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (showUpload) {
    return <DocumentUpload onClose={() => setShowUpload(false)} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex-1 flex gap-3">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "#94a3b8" }}
            />
            <input
              type="text"
              placeholder="Buscar documentos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border bg-transparent outline-none focus:border-[#d39e17]"
              style={{
                borderColor: "rgba(211, 158, 23, 0.2)",
                color: "#f1f5f9",
              }}
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 rounded-xl border bg-transparent outline-none"
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
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-colors"
          style={{
            backgroundColor: "#d39e17",
            color: "#12110d",
          }}
        >
          <Plus size={18} />
          Enviar Documento
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
          Carregando documentos...
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredDocuments.length === 0 && (
        <div
          className="text-center py-12 rounded-2xl border"
          style={{
            backgroundColor: "rgba(22, 40, 71, 0.95)",
            borderColor: "rgba(211, 158, 23, 0.2)",
          }}
        >
          <p style={{ color: "#94a3b8" }}>
            {documents.length === 0
              ? "Nenhum documento enviado ainda."
              : "Nenhum documento encontrado."}
          </p>
        </div>
      )}

      {/* Documents Grid */}
      {!loading && filteredDocuments.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDocuments.map((doc) => (
            <DocumentCard key={doc.id} document={doc} />
          ))}
        </div>
      )}
    </div>
  );
}
