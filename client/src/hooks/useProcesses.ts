import { useCallback } from "react";
import { useSupabaseQuery } from "./useSupabaseQuery";
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
  const { data: processes, loading, error, create, update, remove, refresh } = useSupabaseQuery(
    "user_processes",
    {
      orderBy: [{ column: "created_at", ascending: false }],
      errorMessage: {
        fetch: "Erro ao carregar processos",
        create: "Erro ao criar processo",
        update: "Erro ao atualizar processo",
        delete: "Erro ao excluir processo",
      },
    }
  );

  const createProcess = useCallback(
    (process: Omit<UserProcessInsert, "user_id">) => create(process),
    [create]
  );

  const updateProcess = useCallback(
    (id: string, updates: Partial<UserProcessInsert>) => update(id, updates),
    [update]
  );

  const deleteProcess = useCallback(
    (id: string) => remove(id),
    [remove]
  );

  return {
    processes,
    loading,
    error,
    createProcess,
    updateProcess,
    deleteProcess,
    refresh,
  };
}
