import { useState } from "react";
import { useTodos } from "@/hooks/useTodos";
import type { UserTodo } from "@/types/supabase";
import { Check, Edit2, Trash2, Calendar, Flag } from "lucide-react";

interface TodoItemProps {
  todo: UserTodo;
  onEdit: () => void;
}

const PRIORITY_COLORS: Record<string, string> = {
  baixa: "#94a3b8",
  media: "#60a5fa",
  alta: "#f59e0b",
  urgente: "#ef4444",
};

export function TodoItem({ todo, onEdit }: TodoItemProps) {
  const { toggleComplete, deleteTodo } = useTodos();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (isDeleting) {
      await deleteTodo(todo.id);
    } else {
      setIsDeleting(true);
      setTimeout(() => setIsDeleting(false), 3000);
    }
  };

  const formatDueDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const isPast = date < now && !todo.completed;

    return {
      text: date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
      }),
      isPast,
    };
  };

  const dueDate = formatDueDate(todo.due_date);

  return (
    <div
      className="flex items-center gap-4 p-4 rounded-xl border transition-colors"
      style={{
        backgroundColor: "rgba(22, 40, 71, 0.95)",
        borderColor: todo.completed
          ? "rgba(34, 197, 94, 0.3)"
          : dueDate?.isPast
          ? "rgba(239, 68, 68, 0.3)"
          : "rgba(211, 158, 23, 0.2)",
        opacity: todo.completed ? 0.7 : 1,
      }}
    >
      {/* Checkbox */}
      <button
        onClick={() => toggleComplete(todo.id, !todo.completed)}
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
          todo.completed ? "bg-[#22c55e] border-[#22c55e]" : ""
        }`}
        style={{
          borderColor: todo.completed ? "#22c55e" : "rgba(148, 163, 184, 0.3)",
        }}
      >
        {todo.completed && <Check size={14} style={{ color: "#12110d" }} />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4
          className="font-medium truncate"
          style={{
            color: todo.completed ? "#94a3b8" : "#f1f5f9",
            textDecoration: todo.completed ? "line-through" : "none",
          }}
        >
          {todo.title}
        </h4>
        {todo.description && (
          <p
            className="text-sm truncate"
            style={{ color: "#94a3b8" }}
          >
            {todo.description}
          </p>
        )}
        <div className="flex items-center gap-3 mt-1">
          {/* Priority */}
          <div className="flex items-center gap-1">
            <Flag size={12} style={{ color: PRIORITY_COLORS[todo.priority] }} />
            <span
              className="text-xs"
              style={{ color: PRIORITY_COLORS[todo.priority] }}
            >
              {todo.priority}
            </span>
          </div>
          {/* Due Date */}
          {dueDate && (
            <div className="flex items-center gap-1">
              <Calendar
                size={12}
                style={{ color: dueDate.isPast ? "#ef4444" : "#94a3b8" }}
              />
              <span
                className="text-xs"
                style={{ color: dueDate.isPast ? "#ef4444" : "#94a3b8" }}
              >
                {dueDate.text}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
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
  );
}
