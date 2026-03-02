import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import type { UserProcess, UserProcessInsert } from "@/types/supabase";

interface UseProcessesReturn {
  processes: UserProcess[];
  loading: boolean;
  error: string | null;
  createProcess: (process: Omit<UserProcessInsert, "user_id">) => Promise<boolean>;
  updateProcess: (id: string, updates: Partial<UserProcessInsert>) => Promise<boolean>;
  deleteProcess: (id: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

export function useProcesses(): UseProcessesReturn {
  const { user } = useAuth();
  const [processes, setProcesses] = useState<UserProcess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProcesses = useCallback(async () => {
    if (!user) {
      setProcesses([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("user_processes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setProcesses(data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching processes:", err);
      setError("Erro ao carregar processos");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProcesses();
  }, [fetchProcesses]);

  const createProcess = useCallback(
    async (process: Omit<UserProcessInsert, "user_id">): Promise<boolean> => {
      if (!user) return false;

      try {
        const { error: insertError } = await supabase
          .from("user_processes")
          .insert({ ...process, user_id: user.id });

        if (insertError) throw insertError;

        await fetchProcesses();
        return true;
      } catch (err) {
        console.error("Error creating process:", err);
        setError("Erro ao criar processo");
        return false;
      }
    },
    [user, fetchProcesses]
  );

  const updateProcess = useCallback(
    async (id: string, updates: Partial<UserProcessInsert>): Promise<boolean> => {
      if (!user) return false;

      try {
        const { error: updateError } = await supabase
          .from("user_processes")
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq("id", id)
          .eq("user_id", user.id);

        if (updateError) throw updateError;

        await fetchProcesses();
        return true;
      } catch (err) {
        console.error("Error updating process:", err);
        setError("Erro ao atualizar processo");
        return false;
      }
    },
    [user, fetchProcesses]
  );

  const deleteProcess = useCallback(
    async (id: string): Promise<boolean> => {
      if (!user) return false;

      try {
        const { error: deleteError } = await supabase
          .from("user_processes")
          .delete()
          .eq("id", id)
          .eq("user_id", user.id);

        if (deleteError) throw deleteError;

        setProcesses((prev) => prev.filter((p) => p.id !== id));
        return true;
      } catch (err) {
        console.error("Error deleting process:", err);
        setError("Erro ao excluir processo");
        return false;
      }
    },
    [user]
  );

  return {
    processes,
    loading,
    error,
    createProcess,
    updateProcess,
    deleteProcess,
    refresh: fetchProcesses,
  };
}
