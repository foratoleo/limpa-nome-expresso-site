import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import type { UserNote, UserNoteInsert } from "@/types/supabase";

interface UseNotesReturn {
  notes: UserNote[];
  loading: boolean;
  error: string | null;
  createNote: (note: Omit<UserNoteInsert, "user_id">) => Promise<boolean>;
  updateNote: (id: string, updates: Partial<UserNoteInsert>) => Promise<boolean>;
  deleteNote: (id: string) => Promise<boolean>;
  togglePin: (id: string, pinned: boolean) => Promise<boolean>;
  searchNotes: (query: string) => UserNote[];
  refresh: () => Promise<void>;
}

export function useNotes(): UseNotesReturn {
  const { user } = useAuth();
  const [notes, setNotes] = useState<UserNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    if (!user) {
      setNotes([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("user_notes")
        .select("*")
        .eq("user_id", user.id)
        .order("pinned", { ascending: false })
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setNotes(data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching notes:", err);
      setError("Erro ao carregar anotacoes");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const createNote = useCallback(
    async (note: Omit<UserNoteInsert, "user_id">): Promise<boolean> => {
      if (!user) return false;

      try {
        const { error: insertError } = await supabase
          .from("user_notes")
          .insert({ ...note, user_id: user.id });

        if (insertError) throw insertError;

        await fetchNotes();
        return true;
      } catch (err) {
        console.error("Error creating note:", err);
        setError("Erro ao criar anotacao");
        return false;
      }
    },
    [user, fetchNotes]
  );

  const updateNote = useCallback(
    async (id: string, updates: Partial<UserNoteInsert>): Promise<boolean> => {
      if (!user) return false;

      try {
        const { error: updateError } = await supabase
          .from("user_notes")
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq("id", id)
          .eq("user_id", user.id);

        if (updateError) throw updateError;

        await fetchNotes();
        return true;
      } catch (err) {
        console.error("Error updating note:", err);
        setError("Erro ao atualizar anotacao");
        return false;
      }
    },
    [user, fetchNotes]
  );

  const deleteNote = useCallback(
    async (id: string): Promise<boolean> => {
      if (!user) return false;

      try {
        const { error: deleteError } = await supabase
          .from("user_notes")
          .delete()
          .eq("id", id)
          .eq("user_id", user.id);

        if (deleteError) throw deleteError;

        setNotes((prev) => prev.filter((n) => n.id !== id));
        return true;
      } catch (err) {
        console.error("Error deleting note:", err);
        setError("Erro ao excluir anotacao");
        return false;
      }
    },
    [user]
  );

  const togglePin = useCallback(
    async (id: string, pinned: boolean): Promise<boolean> => {
      return updateNote(id, { pinned });
    },
    [updateNote]
  );

  const searchNotes = useCallback(
    (query: string): UserNote[] => {
      if (!query.trim()) return notes;
      const lowerQuery = query.toLowerCase();
      return notes.filter(
        (note) =>
          note.title?.toLowerCase().includes(lowerQuery) ||
          note.content.toLowerCase().includes(lowerQuery)
      );
    },
    [notes]
  );

  return {
    notes,
    loading,
    error,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    searchNotes,
    refresh: fetchNotes,
  };
}
