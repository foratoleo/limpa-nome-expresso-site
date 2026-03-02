import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import type { UserDocument } from "@/types/supabase";

interface ChecklistDocumentWithDetails {
  id: string;
  user_id: string;
  checklist_item_id: string;
  step_number: number;
  document_id: string;
  created_at: string;
  updated_at: string;
  document: UserDocument;
}

interface UseChecklistDocumentsReturn {
  // Documents grouped by checklist item ID
  documentsByItem: Record<string, ChecklistDocumentWithDetails[]>;
  // All documents for a specific step/phase
  documentsByStep: Record<number, ChecklistDocumentWithDetails[]>;
  loading: boolean;
  error: string | null;
  // Attach a document to a checklist item
  attachDocument: (itemId: string, stepNumber: number, documentId: string) => Promise<boolean>;
  // Detach a document from a checklist item
  detachDocument: (checklistDocId: string) => Promise<boolean>;
  // Get documents for a specific checklist item
  getDocumentsForItem: (itemId: string) => ChecklistDocumentWithDetails[];
  // Get document count for a specific checklist item
  getDocumentCount: (itemId: string) => number;
  // Refresh data
  refresh: () => Promise<void>;
}

export function useChecklistDocuments(): UseChecklistDocumentsReturn {
  const { user } = useAuth();
  const [allDocs, setAllDocs] = useState<ChecklistDocumentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    if (!user) {
      setAllDocs([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("checklist_documents")
        .select(`
          *,
          document:user_documents!document_id(*)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setAllDocs((data as unknown as ChecklistDocumentWithDetails[]) || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching checklist documents:", err);
      setError("Erro ao carregar documentos do checklist");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Group documents by checklist item ID
  const documentsByItem = allDocs.reduce((acc, doc) => {
    if (!acc[doc.checklist_item_id]) {
      acc[doc.checklist_item_id] = [];
    }
    acc[doc.checklist_item_id].push(doc);
    return acc;
  }, {} as Record<string, ChecklistDocumentWithDetails[]>);

  // Group documents by step number
  const documentsByStep = allDocs.reduce((acc, doc) => {
    if (!acc[doc.step_number]) {
      acc[doc.step_number] = [];
    }
    acc[doc.step_number].push(doc);
    return acc;
  }, {} as Record<number, ChecklistDocumentWithDetails[]>);

  const attachDocument = useCallback(
    async (itemId: string, stepNumber: number, documentId: string): Promise<boolean> => {
      if (!user) return false;

      try {
        const { error: insertError } = await supabase
          .from("checklist_documents")
          .insert({
            user_id: user.id,
            checklist_item_id: itemId,
            step_number: stepNumber,
            document_id: documentId,
          });

        if (insertError) {
          // Check if it's a duplicate error
          if (insertError.code === "23505") {
            setError("Este documento ja esta vinculado a este item");
          } else {
            throw insertError;
          }
          return false;
        }

        await fetchDocuments();
        return true;
      } catch (err) {
        console.error("Error attaching document:", err);
        setError("Erro ao vincular documento");
        return false;
      }
    },
    [user, fetchDocuments]
  );

  const detachDocument = useCallback(
    async (checklistDocId: string): Promise<boolean> => {
      if (!user) return false;

      try {
        const { error: deleteError } = await supabase
          .from("checklist_documents")
          .delete()
          .eq("id", checklistDocId)
          .eq("user_id", user.id);

        if (deleteError) throw deleteError;

        setAllDocs((prev) => prev.filter((d) => d.id !== checklistDocId));
        return true;
      } catch (err) {
        console.error("Error detaching document:", err);
        setError("Erro ao desvincular documento");
        return false;
      }
    },
    [user]
  );

  const getDocumentsForItem = useCallback(
    (itemId: string): ChecklistDocumentWithDetails[] => {
      return documentsByItem[itemId] || [];
    },
    [documentsByItem]
  );

  const getDocumentCount = useCallback(
    (itemId: string): number => {
      return documentsByItem[itemId]?.length || 0;
    },
    [documentsByItem]
  );

  return {
    documentsByItem,
    documentsByStep,
    loading,
    error,
    attachDocument,
    detachDocument,
    getDocumentsForItem,
    getDocumentCount,
    refresh: fetchDocuments,
  };
}
