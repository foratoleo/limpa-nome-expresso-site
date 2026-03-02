import { useState } from "react";
import { useNotes } from "@/hooks/useNotes";
import { NoteCard } from "./NoteCard";
import { NoteEditor } from "./NoteEditor";
import { Plus, Search, Pin } from "lucide-react";

export function NotesList() {
  const { notes, loading, error, searchNotes } = useNotes();
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredNotes = searchQuery ? searchNotes(searchQuery) : notes;
  const pinnedNotes = filteredNotes.filter((n) => n.pinned);
  const otherNotes = filteredNotes.filter((n) => !n.pinned);

  if (showEditor || editingId) {
    return (
      <NoteEditor
        noteId={editingId}
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
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "#94a3b8" }}
          />
          <input
            type="text"
            placeholder="Buscar anotacoes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border bg-transparent outline-none focus:border-[#d39e17]"
            style={{
              borderColor: "rgba(211, 158, 23, 0.2)",
              color: "#f1f5f9",
            }}
          />
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
          Nova Anotacao
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
          Carregando anotacoes...
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredNotes.length === 0 && (
        <div
          className="text-center py-12 rounded-2xl border"
          style={{
            backgroundColor: "rgba(22, 40, 71, 0.95)",
            borderColor: "rgba(211, 158, 23, 0.2)",
          }}
        >
          <p style={{ color: "#94a3b8" }}>
            {searchQuery
              ? "Nenhuma anotacao encontrada."
              : "Nenhuma anotacao ainda. Crie sua primeira!"}
          </p>
        </div>
      )}

      {/* Pinned Notes */}
      {pinnedNotes.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Pin size={16} style={{ color: "#d39e17" }} />
            <h3 className="font-medium" style={{ color: "#d39e17" }}>
              Fixadas
            </h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pinnedNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={() => setEditingId(note.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Other Notes */}
      {otherNotes.length > 0 && (
        <div>
          {pinnedNotes.length > 0 && (
            <h3 className="font-medium mb-3" style={{ color: "#94a3b8" }}>
              Outras
            </h3>
          )}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {otherNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={() => setEditingId(note.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
