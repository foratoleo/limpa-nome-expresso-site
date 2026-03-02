import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import type { ChecklistProgress, ChecklistProgressInsert } from "@/types/supabase";

const LOCAL_STORAGE_KEY = "limpa-nome-checklist";

interface UseChecklistSyncReturn {
  checked: Record<string, boolean>;
  toggle: (id: string, stepNumber: number) => void;
  progress: number;
  totalChecked: number;
  totalItems: number;
  resetAll: () => void;
  loading: boolean;
  syncError: string | null;
}

export function useChecklistSync(totalItems: number): UseChecklistSyncReturn {
  const { user } = useAuth();
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Load initial state
  useEffect(() => {
    const loadInitialState = async () => {
      setLoading(true);
      setSyncError(null);

      if (user) {
        // Load from Supabase
        try {
          const { data, error } = await supabase
            .from("checklist_progress")
            .select("*")
            .eq("user_id", user.id);

          if (error) {
            console.error("Error loading from Supabase:", error);
            // Fallback to localStorage
            loadFromLocalStorage();
          } else {
            const checkedMap: Record<string, boolean> = {};
            data.forEach((item: ChecklistProgress) => {
              checkedMap[item.item_id] = item.checked;
            });
            setChecked(checkedMap);
          }
        } catch (err) {
          console.error("Exception loading from Supabase:", err);
          loadFromLocalStorage();
        }
      } else {
        // Load from localStorage
        loadFromLocalStorage();
      }

      setLoading(false);
    };

    const loadFromLocalStorage = () => {
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          setChecked(JSON.parse(saved));
        }
      } catch {
        setChecked({});
      }
    };

    loadInitialState();
  }, [user]);

  // Persist to localStorage for non-logged users
  useEffect(() => {
    if (!user && !loading) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(checked));
    }
  }, [checked, user, loading]);

  const toggle = useCallback(
    async (id: string, stepNumber: number) => {
      // Use functional update to get current value and update atomically
      let newCheckedValue: boolean = false;

      setChecked((prev) => {
        newCheckedValue = !prev[id];
        return { ...prev, [id]: newCheckedValue };
      });

      if (user) {
        try {
          const insertData: ChecklistProgressInsert = {
            user_id: user.id,
            item_id: id,
            step_number: stepNumber,
            checked: newCheckedValue,
            updated_at: new Date().toISOString(),
          };
          const { error } = await supabase.from("checklist_progress").upsert(insertData, {
            onConflict: "user_id,item_id",
          });

          if (error) {
            console.error("Error syncing to Supabase:", error);
            setSyncError("Erro ao sincronizar. Verifique sua conexao.");
            // Revert on error
            setChecked((prev) => ({ ...prev, [id]: !newCheckedValue }));
          } else {
            setSyncError(null);
          }
        } catch (err) {
          console.error("Exception syncing to Supabase:", err);
          setSyncError("Erro ao sincronizar. Verifique sua conexao.");
          // Revert on error
          setChecked((prev) => ({ ...prev, [id]: !newCheckedValue }));
        }
      }
    },
    [user]
  );

  const totalChecked = Object.values(checked).filter(Boolean).length;
  const progress = Math.round((totalChecked / totalItems) * 100);

  const resetAll = useCallback(async () => {
    setChecked({});

    if (user) {
      try {
        await supabase.from("checklist_progress").delete().eq("user_id", user.id);
      } catch (err) {
        console.error("Error resetting in Supabase:", err);
      }
    }

    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }, [user]);

  return {
    checked,
    toggle,
    progress,
    totalChecked,
    totalItems,
    resetAll,
    loading,
    syncError,
  };
}
