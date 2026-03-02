export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

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
        Relationships: [];
      };
      user_processes: {
        Row: {
          id: string;
          user_id: string;
          process_number: string | null;
          status: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          process_number?: string | null;
          status?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          process_number?: string | null;
          status?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_documents: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          category: string;
          file_url: string;
          file_size: number | null;
          mime_type: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          category?: string;
          file_url: string;
          file_size?: number | null;
          mime_type?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          category?: string;
          file_url?: string;
          file_size?: number | null;
          mime_type?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_notes: {
        Row: {
          id: string;
          user_id: string;
          title: string | null;
          content: string;
          category: string;
          pinned: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string | null;
          content: string;
          category?: string;
          pinned?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string | null;
          content?: string;
          category?: string;
          pinned?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_todos: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          due_date: string | null;
          priority: string;
          status: string;
          completed: boolean;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          due_date?: string | null;
          priority?: string;
          status?: string;
          completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          due_date?: string | null;
          priority?: string;
          status?: string;
          completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      stripe_customers: {
        Row: {
          id: string;
          user_id: string;
          stripe_customer_id: string;
          email: string | null;
          name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_customer_id: string;
          email?: string | null;
          name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          stripe_customer_id?: string;
          email?: string | null;
          name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          stripe_subscription_id: string;
          stripe_price_id: string;
          stripe_product_id: string;
          status: string;
          current_period_start: string;
          current_period_end: string;
          cancel_at_period_end: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_subscription_id: string;
          stripe_price_id: string;
          stripe_product_id: string;
          status?: string;
          current_period_start: string;
          current_period_end: string;
          cancel_at_period_end?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          stripe_subscription_id?: string;
          stripe_price_id?: string;
          stripe_product_id?: string;
          status?: string;
          current_period_start?: string;
          current_period_end?: string;
          cancel_at_period_end?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          user_id: string;
          stripe_payment_id: string;
          stripe_customer_id: string;
          amount: number;
          currency: string;
          status: string;
          description: string | null;
          paid_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_payment_id: string;
          stripe_customer_id: string;
          amount: number;
          currency: string;
          status?: string;
          description?: string | null;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          stripe_payment_id?: string;
          stripe_customer_id?: string;
          amount?: number;
          currency?: string;
          status?: string;
          description?: string | null;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      checklist_documents: {
        Row: {
          id: string;
          user_id: string;
          checklist_item_id: string;
          step_number: number;
          document_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          checklist_item_id: string;
          step_number: number;
          document_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          checklist_item_id?: string;
          step_number?: number;
          document_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type ChecklistProgress = Database["public"]["Tables"]["checklist_progress"]["Row"];
export type ChecklistProgressInsert = Database["public"]["Tables"]["checklist_progress"]["Insert"];
export type UserProcess = Database["public"]["Tables"]["user_processes"]["Row"];
export type UserProcessInsert = Database["public"]["Tables"]["user_processes"]["Insert"];
export type UserDocument = Database["public"]["Tables"]["user_documents"]["Row"];
export type UserDocumentInsert = Database["public"]["Tables"]["user_documents"]["Insert"];
export type UserNote = Database["public"]["Tables"]["user_notes"]["Row"];
export type UserNoteInsert = Database["public"]["Tables"]["user_notes"]["Insert"];
export type UserTodo = Database["public"]["Tables"]["user_todos"]["Row"];
export type UserTodoInsert = Database["public"]["Tables"]["user_todos"]["Insert"];
export type StripeCustomer = Database["public"]["Tables"]["stripe_customers"]["Row"];
export type StripeCustomerInsert = Database["public"]["Tables"]["stripe_customers"]["Insert"];
export type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];
export type SubscriptionInsert = Database["public"]["Tables"]["subscriptions"]["Insert"];
export type Payment = Database["public"]["Tables"]["payments"]["Row"];
export type PaymentInsert = Database["public"]["Tables"]["payments"]["Insert"];
export type ChecklistDocument = Database["public"]["Tables"]["checklist_documents"]["Row"];
export type ChecklistDocumentInsert = Database["public"]["Tables"]["checklist_documents"]["Insert"];
