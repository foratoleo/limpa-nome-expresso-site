import { useState } from "react";
import { useTodos } from "@/hooks/useTodos";
import { TodoItem } from "./TodoItem";
import { TodoEditor } from "./TodoEditor";
import { Plus, Filter, CheckCircle2, Circle, AlertCircle, Clock } from "lucide-react";

type FilterType = "all" | "pending" | "completed" | "overdue";

export function TodoList() {
  const { filteredTodos, loading, error, filter, setFilter, getStats } = useTodos();
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const stats = getStats();

  const filters: { id: FilterType; label: string; icon: typeof CheckCircle2 }[] = [
    { id: "all", label: "Todas", icon: Circle },
    { id: "pending", label: "Pendentes", icon: Clock },
    { id: "completed", label: "Concluidas", icon: CheckCircle2 },
    { id: "overdue", label: "Atrasadas", icon: AlertCircle },
  ];

  if (showEditor || editingId) {
    return (
      <TodoEditor
        todoId={editingId}
        onClose={() => {
          setShowEditor(false);
          setEditingId(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div
          className="rounded-xl border p-4 text-center"
          style={{
            backgroundColor: "rgba(22, 40, 71, 0.95)",
            borderColor: "rgba(211, 158, 23, 0.2)",
          }}
        >
          <p className="text-2xl font-bold" style={{ color: "#d39e17" }}>
            {stats.total}
          </p>
          <p className="text-xs" style={{ color: "#94a3b8" }}>Total</p>
        </div>
        <div
          className="rounded-xl border p-4 text-center"
          style={{
            backgroundColor: "rgba(22, 40, 71, 0.95)",
            borderColor: "rgba(34, 197, 94, 0.2)",
          }}
        >
          <p className="text-2xl font-bold" style={{ color: "#22c55e" }}>
            {stats.completed}
          </p>
          <p className="text-xs" style={{ color: "#94a3b8" }}>Concluidas</p>
        </div>
        <div
          className="rounded-xl border p-4 text-center"
          style={{
            backgroundColor: "rgba(22, 40, 71, 0.95)",
            borderColor: "rgba(96, 165, 250, 0.2)",
          }}
        >
          <p className="text-2xl font-bold" style={{ color: "#60a5fa" }}>
            {stats.pending}
          </p>
          <p className="text-xs" style={{ color: "#94a3b8" }}>Pendentes</p>
        </div>
        <div
          className="rounded-xl border p-4 text-center"
          style={{
            backgroundColor: "rgba(22, 40, 71, 0.95)",
            borderColor: "rgba(239, 68, 68, 0.2)",
          }}
        >
          <p className="text-2xl font-bold" style={{ color: "#ef4444" }}>
            {stats.overdue}
          </p>
          <p className="text-xs" style={{ color: "#94a3b8" }}>Atrasadas</p>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2">
          {filters.map((f) => {
            const Icon = f.icon;
            const isActive = filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors"
                style={{
                  borderColor: isActive ? "#d39e17" : "rgba(211, 158, 23, 0.2)",
                  color: isActive ? "#d39e17" : "#94a3b8",
                  backgroundColor: isActive ? "rgba(211, 158, 23, 0.1)" : "transparent",
                }}
              >
                <Icon size={16} />
                <span className="text-sm">{f.label}</span>
              </button>
            );
          })}
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
          Nova Tarefa
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
          Carregando tarefas...
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredTodos.length === 0 && (
        <div
          className="text-center py-12 rounded-2xl border"
          style={{
            backgroundColor: "rgba(22, 40, 71, 0.95)",
            borderColor: "rgba(211, 158, 23, 0.2)",
          }}
        >
          <p style={{ color: "#94a3b8" }}>
            {filter === "all"
              ? "Nenhuma tarefa ainda. Crie sua primeira!"
              : `Nenhuma tarefa ${filter === "pending" ? "pendente" : filter === "completed" ? "concluida" : "atrasada"}.`}
          </p>
        </div>
      )}

      {/* Todo List */}
      {!loading && filteredTodos.length > 0 && (
        <div className="space-y-2">
          {filteredTodos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onEdit={() => setEditingId(todo.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
