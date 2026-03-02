import { useState } from "react";
import { useNotes } from "@/hooks/useNotes";
import type { UserNote } from "@/types/supabase";
import { Pin, Edit2, Trash2, Clock } from "lucide-react";

interface NoteCardProps {
  note: UserNote;
  onEdit: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  importante: "#ef4444",
  lembrete: "#f59e0b",
  duvida: "#60a5fa",
  geral: "#94a3b8",
};

export function NoteCard({ note, onEdit }: NoteCardProps) {
  const { togglePin, deleteNote } = useNotes();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (isDeleting) {
      await deleteNote(note.id);
    } else {
      setIsDeleting(true);
      setTimeout(() => setIsDeleting(false), 3000);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className="rounded-xl border p-4 transition-colors"
      style={{
        backgroundColor: "rgba(22, 40, 71, 0.95)",
        borderColor: note.pinned
          ? "rgba(211, 158, 23, 0.5)"
          : "rgba(211, 158, 23, 0.2)",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: `${CATEGORY_COLORS[note.category] || "#94a3b8"}20`,
              color: CATEGORY_COLORS[note.category] || "#94a3b8",
            }}
          >
            {note.category}
          </span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => togglePin(note.id, !note.pinned)}
            className="p-1.5 rounded-lg hover:bg-[rgba(211,158,23,0.2)]"
            style={{ color: note.pinned ? "#d39e17" : "#94a3b8" }}
          >
            <Pin size={16} />
          </button>
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

      {/* Title */}
      {note.title && (
        <h4 className="font-medium mb-2" style={{ color: "#f1f5f9" }}>
          {note.title}
        </h4>
      )}

      {/* Content */}
      <p
        className="text-sm line-clamp-4 mb-3"
        style={{ color: "#e8e4d8" }}
      >
        {note.content}
      </p>

      {/* Date */}
      <div className="flex items-center gap-1 text-xs" style={{ color: "#64748b" }}>
        <Clock size={12} />
        <span>{formatDate(note.updated_at)}</span>
      </div>
    </div>
  );
}
