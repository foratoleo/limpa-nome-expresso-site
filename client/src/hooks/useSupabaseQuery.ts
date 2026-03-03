import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/supabase";

type TableName = keyof Database["public"]["Tables"];
type TableRow<T extends TableName> = Database["public"]["Tables"][T]["Row"];
type TableInsert<T extends TableName> = Database["public"]["Tables"][T]["Insert"];

export interface OrderOption {
  column: string;
  ascending?: boolean;
  nullsFirst?: boolean;
}

export interface UseSupabaseQueryOptions {
  orderBy?: OrderOption[];
  filter?: (query: unknown, userId: string) => unknown;
  onError?: (error: Error, operation: string) => void;
  errorMessage?: {
    fetch?: string;
    create?: string;
    update?: string;
    delete?: string;
  };
}

export interface UseSupabaseQueryReturn<T, I> {
  data: T[];
  loading: boolean;
  error: string | null;
  create: (item: Omit<I, "user_id">) => Promise<boolean>;
  update: (id: string, updates: Partial<I>) => Promise<boolean>;
  remove: (id: string) => Promise<boolean>;
  refresh: () => Promise<void>;
  setData: React.Dispatch<React.SetStateAction<T[]>>;
}

export function useSupabaseQuery<T extends TableName>(
  tableName: T,
  options?: UseSupabaseQueryOptions
): UseSupabaseQueryReturn<TableRow<T>, TableInsert<T>> {
  const { orderBy, filter, onError, errorMessage } = options || {};
  const { user } = useAuth();
  const [data, setData] = useState<TableRow<T>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const defaultErrors = {
    fetch: `Erro ao carregar dados`,
    create: `Erro ao criar item`,
    update: `Erro ao atualizar item`,
    delete: `Erro ao excluir item`,
  };

  const errors = { ...defaultErrors, ...errorMessage };

  const fetchData = useCallback(async () => {
    if (!user) {
      setData([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query: any = supabase.from(tableName as any).select("*").eq("user_id", user.id);

      if (filter) {
        query = filter(query, user.id);
      }

      if (orderBy) {
        for (const order of orderBy) {
          query = query.order(order.column, {
            ascending: order.ascending ?? true,
            nullsFirst: order.nullsFirst ?? false,
          });
        }
      }

      const { data: result, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setData((result || []) as TableRow<T>[]);
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error(`Error fetching ${tableName}:`, err);
      setError(errors.fetch || null);
      onError?.(error, "fetch");
    } finally {
      setLoading(false);
    }
  }, [user, tableName, filter, orderBy, onError, errors.fetch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const create = useCallback(
    async (item: Omit<TableInsert<T>, "user_id">): Promise<boolean> => {
      if (!user) return false;

      try {
        const { error: insertError } = await supabase
          .from(tableName as any)
          .insert({ ...item, user_id: user.id } as any);

        if (insertError) throw insertError;

        await fetchData();
        return true;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        console.error(`Error creating in ${tableName}:`, err);
        setError(errors.create || null);
        onError?.(error, "create");
        return false;
      }
    },
    [user, tableName, fetchData, onError, errors.create]
  );

  const update = useCallback(
    async (id: string, updates: Partial<TableInsert<T>>): Promise<boolean> => {
      if (!user) return false;

      try {
        const { error: updateError } = await supabase
          .from(tableName as any)
          .update({ ...updates, updated_at: new Date().toISOString() } as any)
          .eq("id", id)
          .eq("user_id", user.id);

        if (updateError) throw updateError;

        await fetchData();
        return true;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        console.error(`Error updating in ${tableName}:`, err);
        setError(errors.update || null);
        onError?.(error, "update");
        return false;
      }
    },
    [user, tableName, fetchData, onError, errors.update]
  );

  const remove = useCallback(
    async (id: string): Promise<boolean> => {
      if (!user) return false;

      try {
        const { error: deleteError } = await supabase
          .from(tableName as any)
          .delete()
          .eq("id", id)
          .eq("user_id", user.id);

        if (deleteError) throw deleteError;

        setData((prev) => prev.filter((d) => d.id !== id));
        return true;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        console.error(`Error deleting from ${tableName}:`, err);
        setError(errors.delete || null);
        onError?.(error, "delete");
        return false;
      }
    },
    [user, tableName, onError, errors.delete]
  );

  return {
    data: data as TableRow<T>[],
    loading,
    error,
    create: create as (item: Omit<TableInsert<T>, "user_id">) => Promise<boolean>,
    update: update as (id: string, updates: Partial<TableInsert<T>>) => Promise<boolean>,
    remove,
    refresh: fetchData,
    setData: setData as React.Dispatch<React.SetStateAction<TableRow<T>[]>>,
  };
}
