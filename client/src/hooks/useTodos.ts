import { useState, useCallback, useMemo } from "react";
import { useSupabaseQuery } from "./useSupabaseQuery";
import type { UserTodo, UserTodoInsert } from "@/types/supabase";

type TodoFilter = "all" | "pending" | "completed" | "overdue";

interface UseTodosReturn {
  todos: UserTodo[];
  filteredTodos: UserTodo[];
  loading: boolean;
  error: string | null;
  filter: TodoFilter;
  setFilter: (filter: TodoFilter) => void;
  createTodo: (todo: Omit<UserTodoInsert, "user_id">) => Promise<boolean>;
  updateTodo: (id: string, updates: Partial<UserTodoInsert>) => Promise<boolean>;
  deleteTodo: (id: string) => Promise<boolean>;
  toggleComplete: (id: string, completed: boolean) => Promise<boolean>;
  getStats: () => { total: number; completed: number; pending: number; overdue: number };
  refresh: () => Promise<void>;
}

export function useTodos(): UseTodosReturn {
  const [filter, setFilter] = useState<TodoFilter>("all");

  const { data: todos, loading, error, create, update, remove, refresh } = useSupabaseQuery(
    "user_todos",
    {
      orderBy: [
        { column: "due_date", ascending: true, nullsFirst: false },
        { column: "priority", ascending: false },
        { column: "created_at", ascending: false },
      ],
      errorMessage: {
        fetch: "Erro ao carregar tarefas",
        create: "Erro ao criar tarefa",
        update: "Erro ao atualizar tarefa",
        delete: "Erro ao excluir tarefa",
      },
    }
  );

  const filteredTodos = useMemo(() => {
    if (filter === "all") return todos;
    if (filter === "completed") return todos.filter((t) => t.completed);
    if (filter === "pending") return todos.filter((t) => !t.completed);
    if (filter === "overdue") {
      const now = new Date();
      return todos.filter(
        (t) => !t.completed && t.due_date && new Date(t.due_date) < now
      );
    }
    return todos;
  }, [todos, filter]);

  const createTodo = useCallback(
    (todo: Omit<UserTodoInsert, "user_id">) => create(todo),
    [create]
  );

  const updateTodo = useCallback(
    (id: string, updates: Partial<UserTodoInsert>) => update(id, updates),
    [update]
  );

  const deleteTodo = useCallback(
    (id: string) => remove(id),
    [remove]
  );

  const toggleComplete = useCallback(
    (id: string, completed: boolean) =>
      update(id, {
        completed,
        completed_at: completed ? new Date().toISOString() : null,
        status: completed ? "concluida" : "pendente",
      }),
    [update]
  );

  const getStats = useCallback(() => {
    const now = new Date();
    const total = todos.length;
    const completed = todos.filter((t) => t.completed).length;
    const pending = todos.filter((t) => !t.completed).length;
    const overdue = todos.filter(
      (t) => !t.completed && t.due_date && new Date(t.due_date) < now
    ).length;

    return { total, completed, pending, overdue };
  }, [todos]);

  return {
    todos,
    filteredTodos,
    loading,
    error,
    filter,
    setFilter,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleComplete,
    getStats,
    refresh,
  };
}
