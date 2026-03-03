import { useCallback } from "react";
import { useSupabaseQuery } from "./useSupabaseQuery";
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
  const { data: notes, loading, error, create, update, remove, refresh } = useSupabaseQuery(
    "user_notes",
    {
      orderBy: [
        { column: "pinned", ascending: false },
        { column: "created_at", ascending: false },
      ],
      errorMessage: {
        fetch: "Erro ao carregar anotacoes",
        create: "Erro ao criar anotacao",
        update: "Erro ao atualizar anotacao",
        delete: "Erro ao excluir anotacao",
      },
    }
  );

  const createNote = useCallback(
    (note: Omit<UserNoteInsert, "user_id">) => create(note),
    [create]
  );

  const updateNote = useCallback(
    (id: string, updates: Partial<UserNoteInsert>) => update(id, updates),
    [update]
  );

  const deleteNote = useCallback(
    (id: string) => remove(id),
    [remove]
  );

  const togglePin = useCallback(
    (id: string, pinned: boolean) => update(id, { pinned }),
    [update]
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
    refresh,
  };
}
