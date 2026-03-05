import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import type { UserDocument, UserDocumentInsert } from "@/types/supabase";

interface UseDocumentsReturn {
  documents: UserDocument[];
  loading: boolean;
  error: string | null;
  uploadDocument: (file: File, name: string, category?: string, notes?: string) => Promise<{ success: boolean; documentId: string | null }>;
  deleteDocument: (id: string) => Promise<boolean>;
  updateDocument: (id: string, updates: Partial<UserDocumentInsert>) => Promise<boolean>;
  downloadDocument: (fileUrl: string, fileName: string) => void;
  refresh: () => Promise<void>;
}

export function useDocuments(): UseDocumentsReturn {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    if (!user) {
      setDocuments([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("user_documents")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setDocuments(data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching documents:", err);
      setError("Erro ao carregar documentos");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const uploadDocument = useCallback(
    async (file: File, name: string, category = "geral", notes?: string): Promise<{ success: boolean; documentId: string | null }> => {
      if (!user) return { success: false, documentId: null };

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

        const { data, error: insertError } = await supabase
          .from("user_documents")
          .insert(insertData)
          .select()
          .single();

        if (insertError) throw insertError;

        await fetchDocuments();
        return { success: true, documentId: data.id };
      } catch (err) {
        console.error("Error uploading document:", err);
        setError("Erro ao enviar documento");
        return { success: false, documentId: null };
      }
    },
    [user, fetchDocuments]
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

        const { error: deleteError } = await supabase
          .from("user_documents")
          .delete()
          .eq("id", id)
          .eq("user_id", user.id);

        if (deleteError) throw deleteError;

        setDocuments((prev) => prev.filter((d) => d.id !== id));
        return true;
      } catch (err) {
        console.error("Error deleting document:", err);
        setError("Erro ao excluir documento");
        return false;
      }
    },
    [user, documents]
  );

  const updateDocument = useCallback(
    async (id: string, updates: Partial<UserDocumentInsert>): Promise<boolean> => {
      if (!user) return false;

      try {
        const { error: updateError } = await supabase
          .from("user_documents")
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq("id", id)
          .eq("user_id", user.id);

        if (updateError) throw updateError;

        await fetchDocuments();
        return true;
      } catch (err) {
        console.error("Error updating document:", err);
        setError("Erro ao atualizar documento");
        return false;
      }
    },
    [user, fetchDocuments]
  );

  const downloadDocument = useCallback((fileUrl: string, fileName: string): void => {
    // Validar que URL pertence ao bucket Supabase deste projeto
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dvkfvhqfwffxgmmjbgjd.supabase.co';
    const expectedBucket = `${supabaseUrl}/storage/v1/object/public/user-documents/`;

    if (!fileUrl.startsWith(expectedBucket)) {
      console.error('[Security] URL de documento inválida:', fileUrl);
      // TODO: Reportar para serviço de monitoring
      return;
    }

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
    refresh: fetchDocuments,
  };
}
