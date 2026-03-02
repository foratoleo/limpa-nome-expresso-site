import { useState, useEffect } from "react";
import { useNotes } from "@/hooks/useNotes";
import type { UserNote } from "@/types/supabase";
import { X, Save } from "lucide-react";

interface NoteEditorProps {
  noteId: string | null;
  onClose: () => void;
}

const CATEGORIES = [
  { value: "geral", label: "Geral" },
  { value: "importante", label: "Importante" },
  { value: "lembrete", label: "Lembrete" },
  { value: "duvida", label: "Duvida" },
];

export function NoteEditor({ noteId, onClose }: NoteEditorProps) {
  const { notes, createNote, updateNote } = useNotes();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("geral");
  const [saving, setSaving] = useState(false);

  const isEditing = !!noteId;

  useEffect(() => {
    if (noteId) {
      const note = notes.find((n) => n.id === noteId);
      if (note) {
        setTitle(note.title || "");
        setContent(note.content);
        setCategory(note.category);
      }
    }
  }, [noteId, notes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSaving(true);

    if (isEditing && noteId) {
      await updateNote(noteId, { title, content, category });
    } else {
      await createNote({ title, content, category });
    }

    setSaving(false);
    onClose();
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
          {isEditing ? "Editar Anotacao" : "Nova Anotacao"}
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
        {/* Title */}
        <div>
          <label className="block text-sm mb-1" style={{ color: "#94a3b8" }}>
            Titulo (opcional)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Digite um titulo..."
            className="w-full px-4 py-2 rounded-xl border bg-transparent outline-none focus:border-[#d39e17]"
            style={{
              borderColor: "rgba(211, 158, 23, 0.2)",
              color: "#f1f5f9",
            }}
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm mb-1" style={{ color: "#94a3b8" }}>
            Categoria
          </label>
          <div className="flex gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className="px-4 py-2 rounded-xl border transition-colors"
                style={{
                  borderColor:
                    category === cat.value
                      ? "#d39e17"
                      : "rgba(211, 158, 23, 0.2)",
                  color: category === cat.value ? "#d39e17" : "#94a3b8",
                  backgroundColor:
                    category === cat.value
                      ? "rgba(211, 158, 23, 0.1)"
                      : "transparent",
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm mb-1" style={{ color: "#94a3b8" }}>
            Conteudo
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Digite sua anotacao..."
            rows={6}
            className="w-full px-4 py-3 rounded-xl border bg-transparent outline-none focus:border-[#d39e17] resize-none"
            style={{
              borderColor: "rgba(211, 158, 23, 0.2)",
              color: "#f1f5f9",
            }}
            required
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
            disabled={!content.trim() || saving}
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
