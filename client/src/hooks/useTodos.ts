import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import type { UserTodo, UserTodoInsert } from "@/types/supabase";

type TodoFilter = "all" | "pending" | "completed" | "overdue";
type TodoPriority = "baixa" | "media" | "alta" | "urgente";

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
  const { user } = useAuth();
  const [todos, setTodos] = useState<UserTodo[]>([]);
  const [filter, setFilter] = useState<TodoFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTodos = useCallback(async () => {
    if (!user) {
      setTodos([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("user_todos")
        .select("*")
        .eq("user_id", user.id)
        .order("due_date", { ascending: true, nullsFirst: false })
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setTodos(data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching todos:", err);
      setError("Erro ao carregar tarefas");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const filteredTodos = todos.filter((todo) => {
    if (filter === "all") return true;
    if (filter === "completed") return todo.completed;
    if (filter === "pending") return !todo.completed;
    if (filter === "overdue") {
      return (
        !todo.completed &&
        todo.due_date &&
        new Date(todo.due_date) < new Date()
      );
    }
    return true;
  });

  const createTodo = useCallback(
    async (todo: Omit<UserTodoInsert, "user_id">): Promise<boolean> => {
      if (!user) return false;

      try {
        const { error: insertError } = await supabase
          .from("user_todos")
          .insert({ ...todo, user_id: user.id });

        if (insertError) throw insertError;

        await fetchTodos();
        return true;
      } catch (err) {
        console.error("Error creating todo:", err);
        setError("Erro ao criar tarefa");
        return false;
      }
    },
    [user, fetchTodos]
  );

  const updateTodo = useCallback(
    async (id: string, updates: Partial<UserTodoInsert>): Promise<boolean> => {
      if (!user) return false;

      try {
        const { error: updateError } = await supabase
          .from("user_todos")
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq("id", id)
          .eq("user_id", user.id);

        if (updateError) throw updateError;

        await fetchTodos();
        return true;
      } catch (err) {
        console.error("Error updating todo:", err);
        setError("Erro ao atualizar tarefa");
        return false;
      }
    },
    [user, fetchTodos]
  );

  const deleteTodo = useCallback(
    async (id: string): Promise<boolean> => {
      if (!user) return false;

      try {
        const { error: deleteError } = await supabase
          .from("user_todos")
          .delete()
          .eq("id", id)
          .eq("user_id", user.id);

        if (deleteError) throw deleteError;

        setTodos((prev) => prev.filter((t) => t.id !== id));
        return true;
      } catch (err) {
        console.error("Error deleting todo:", err);
        setError("Erro ao excluir tarefa");
        return false;
      }
    },
    [user]
  );

  const toggleComplete = useCallback(
    async (id: string, completed: boolean): Promise<boolean> => {
      return updateTodo(id, {
        completed,
        completed_at: completed ? new Date().toISOString() : null,
        status: completed ? "concluida" : "pendente",
      });
    },
    [updateTodo]
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
    refresh: fetchTodos,
  };
}
