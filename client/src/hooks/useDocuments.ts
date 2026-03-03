import { useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useSupabaseQuery } from "./useSupabaseQuery";
import type { UserDocument, UserDocumentInsert } from "@/types/supabase";

interface UseDocumentsReturn {
  documents: UserDocument[];
  loading: boolean;
  error: string | null;
  uploadDocument: (file: File, name: string, category?: string, notes?: string) => Promise<boolean>;
  deleteDocument: (id: string) => Promise<boolean>;
  updateDocument: (id: string, updates: Partial<UserDocumentInsert>) => Promise<boolean>;
  downloadDocument: (fileUrl: string, fileName: string) => void;
  refresh: () => Promise<void>;
}

export function useDocuments(): UseDocumentsReturn {
  const { user } = useAuth();
  const { data: documents, loading, error, update, remove, refresh } = useSupabaseQuery(
    "user_documents",
    {
      orderBy: [{ column: "created_at", ascending: false }],
      errorMessage: {
        fetch: "Erro ao carregar documentos",
        create: "Erro ao enviar documento",
        update: "Erro ao atualizar documento",
        delete: "Erro ao excluir documento",
      },
    }
  );

  const uploadDocument = useCallback(
    async (file: File, name: string, category = "geral", notes?: string): Promise<boolean> => {
      if (!user) return false;

      try {
        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("user-documents")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("user-documents")
          .getPublicUrl(fileName);

        const insertData: UserDocumentInsert = {
          user_id: user.id,
          name,
          category,
          file_url: urlData.publicUrl,
          file_size: file.size,
          mime_type: file.type,
          notes,
        };

        const { error: insertError } = await supabase
          .from("user_documents")
          .insert(insertData);

        if (insertError) throw insertError;

        await refresh();
        return true;
      } catch (err) {
        console.error("Error uploading document:", err);
        return false;
      }
    },
    [user, refresh]
  );

  const deleteDocument = useCallback(
    async (id: string): Promise<boolean> => {
      if (!user) return false;

      try {
        const doc = documents.find((d) => d.id === id);
        if (doc) {
          const path = doc.file_url.split("/user-documents/")[1];
          if (path) {
            await supabase.storage.from("user-documents").remove([path]);
          }
        }

        return await remove(id);
      } catch (err) {
        console.error("Error deleting document:", err);
        return false;
      }
    },
    [user, documents, remove]
  );

  const updateDocument = useCallback(
    (id: string, updates: Partial<UserDocumentInsert>) => update(id, updates),
    [update]
  );

  const downloadDocument = useCallback((fileUrl: string, fileName: string): void => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  return {
    documents,
    loading,
    error,
    uploadDocument,
    deleteDocument,
    updateDocument,
    downloadDocument,
    refresh,
  };
}
