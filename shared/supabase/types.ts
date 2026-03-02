export interface Database {
  public: {
    Tables: {
      checklist_progress: {
        Row: {
          id: string;
          user_id: string;
          step_number: number;
          item_id: string;
          checked: boolean;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          step_number: number;
          item_id: string;
          checked?: boolean;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          step_number?: number;
          item_id?: string;
          checked?: boolean;
          updated_at?: string;
        };
      };
      user_processes: {
        Row: {
          id: string;
          user_id: string;
          process_number: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          process_number?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          process_number?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

export type ChecklistProgress = Database["public"]["Tables"]["checklist_progress"]["Row"];
export type ChecklistProgressInsert = Database["public"]["Tables"]["checklist_progress"]["Insert"];
export type UserProcess = Database["public"]["Tables"]["user_processes"]["Row"];
export type UserProcessInsert = Database["public"]["Tables"]["user_processes"]["Insert"];
