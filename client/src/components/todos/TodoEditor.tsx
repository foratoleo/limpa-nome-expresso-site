import { useState, useEffect } from "react";
import { useTodos } from "@/hooks/useTodos";
import type { UserTodo } from "@/types/supabase";
import { X, Save } from "lucide-react";

interface TodoEditorProps {
  todoId: string | null;
  onClose: () => void;
}

const PRIORITIES = [
  { value: "baixa", label: "Baixa", color: "#94a3b8" },
  { value: "media", label: "Media", color: "#60a5fa" },
  { value: "alta", label: "Alta", color: "#f59e0b" },
  { value: "urgente", label: "Urgente", color: "#ef4444" },
];

export function TodoEditor({ todoId, onClose }: TodoEditorProps) {
  const { todos, createTodo, updateTodo } = useTodos();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("media");
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);

  const isEditing = !!todoId;

  useEffect(() => {
    if (todoId) {
      const todo = todos.find((t) => t.id === todoId);
      if (todo) {
        setTitle(todo.title);
        setDescription(todo.description || "");
        setPriority(todo.priority);
        setDueDate(todo.due_date ? todo.due_date.split("T")[0] : "");
      }
    }
  }, [todoId, todos]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);

    const data = {
      title,
      description: description || null,
      priority,
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
    };

    if (isEditing && todoId) {
      await updateTodo(todoId, data);
    } else {
      await createTodo(data);
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
          {isEditing ? "Editar Tarefa" : "Nova Tarefa"}
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
            Titulo
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Digite o titulo da tarefa..."
            className="w-full px-4 py-2 rounded-xl border bg-transparent outline-none focus:border-[#d39e17]"
            style={{
              borderColor: "rgba(211, 158, 23, 0.2)",
              color: "#f1f5f9",
            }}
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm mb-1" style={{ color: "#94a3b8" }}>
            Descricao (opcional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Adicione detalhes..."
            rows={3}
            className="w-full px-4 py-2 rounded-xl border bg-transparent outline-none focus:border-[#d39e17] resize-none"
            style={{
              borderColor: "rgba(211, 158, 23, 0.2)",
              color: "#f1f5f9",
            }}
          />
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm mb-2" style={{ color: "#94a3b8" }}>
            Prioridade
          </label>
          <div className="flex gap-2">
            {PRIORITIES.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPriority(p.value)}
                className="px-4 py-2 rounded-xl border transition-colors"
                style={{
                  borderColor: priority === p.value ? p.color : "rgba(211, 158, 23, 0.2)",
                  color: priority === p.value ? p.color : "#94a3b8",
                  backgroundColor: priority === p.value ? `${p.color}20` : "transparent",
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Due Date */}
        <div>
          <label className="block text-sm mb-1" style={{ color: "#94a3b8" }}>
            Data de vencimento (opcional)
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="px-4 py-2 rounded-xl border bg-transparent outline-none focus:border-[#d39e17]"
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
            disabled={!title.trim() || saving}
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
