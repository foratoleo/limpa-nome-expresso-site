/**
 * AdminPanel Page
 *
 * Comprehensive admin panel for managing user access.
 * Integrates grant access form, user list table, and all admin components.
 *
 * Features:
 * - Verify admin role on mount (redirect to /guia if not admin)
 * - Grant access form with email, reason, and expiration date
 * - User list table with status badges and action buttons
 * - Confirmation dialogs for destructive actions
 * - Toast notifications for all operations
 * - Refresh functionality for real-time updates
 *
 * @route /admin
 * @protected Admin only
 */

import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { UserListTable } from "@/components/admin/UserListTable";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Shield, UserCheck, Calendar, Mail, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { grantAccessSchema, type GrantAccessInput } from "@/lib/validation/admin";

// ============================================================================
// Component
// ============================================================================

/**
 * AdminPanel page - Main admin interface for user access management
 */
export default function AdminPanel() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const { data: users = [], isLoading: usersLoading, error, refetch } = useAdminUsers();
  const [submitting, setSubmitting] = useState(false);

  // React Hook Form setup
  const form = useForm<GrantAccessInput>({
    resolver: zodResolver(grantAccessSchema),
    defaultValues: {
      email: "",
      reason: "",
      expires_at: null,
    },
  });

  // Verify admin role
  useEffect(() => {
    if (!authLoading && user) {
      if (user.user_metadata?.role !== "admin") {
        toast.error("Acesso negado", {
          description: "Você não tem permissão para acessar esta página",
        });
        navigate("/guia");
      }
    }
  }, [user, authLoading, navigate]);

  /**
   * Handle granting access to a user
   */
  const handleGrantAccess = async (data: GrantAccessInput) => {
    try {
      setSubmitting(true);

      // Get session token
      const { data: { session } } = await (await import("@supabase/supabase-js"))
        .createClient(
          import.meta.env.VITE_SUPABASE_URL,
          import.meta.env.VITE_SUPABASE_ANON_KEY
        )
        .auth.getSession();

      if (!session?.access_token) {
        throw new Error("No active session");
      }

      // Call grant API
      const response = await fetch("/api/admin/access/grant", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          reason: data.reason || null,
          expires_at: data.expires_at || null,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to grant access");
      }

      toast.success("Acesso concedido", {
        description: `Acesso manual concedido para ${data.email}`,
      });

      // Reset form and refresh user list
      form.reset();
      refetch();
    } catch (error) {
      console.error("Error granting access:", error);
      toast.error("Erro ao conceder acesso", {
        description: error instanceof Error ? error.message : "Tente novamente",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (authLoading || usersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#12110d" }}>
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: "#d39e17" }} />
          <p style={{ color: "#94a3b8" }}>Carregando...</p>
        </div>
      </div>
    );
  }

  // Error state - prevent React error #31 by safely rendering error message
  if (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#12110d" }}>
        <div className="text-center max-w-md px-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}
          >
            <Shield size={32} style={{ color: "#ef4444" }} />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: "#f1f5f9" }}>
            Erro ao carregar dados
          </h2>
          <p className="text-sm mb-6" style={{ color: "#94a3b8" }}>
            {errorMessage}
          </p>
          <Button
            onClick={() => refetch()}
            className="gap-2"
            style={{ backgroundColor: "#d39e17", color: "#12110d" }}
          >
            <RefreshCw size={16} />
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  // Not admin
  if (!user || user.user_metadata?.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#12110d" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-50 backdrop-blur-[6px] border-b"
        style={{
          backgroundColor: "rgba(18, 17, 13, 0.9)",
          borderColor: "rgba(211, 158, 23, 0.2)",
        }}
      >
        <Container as="div" maxWidth="xl" className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(211, 158, 23, 0.2)" }}>
              <Shield size={20} style={{ color: "#d39e17" }} />
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: "#f1f5f9" }}>
                Painel Administrativo
              </h1>
              <p className="text-sm" style={{ color: "#94a3b8" }}>
                Gerencie acessos dos usuários
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="gap-2"
            disabled={usersLoading}
          >
            <RefreshCw size={16} className={usersLoading ? "animate-spin" : ""} />
            Atualizar
          </Button>
        </Container>
      </header>

      {/* Main Content */}
      <Container as="main" maxWidth="xl" className="py-6">
        <div className="space-y-6">
          {/* Grant Access Form */}
          <div
            className="rounded-2xl border p-6"
            style={{
              backgroundColor: "rgba(22, 40, 71, 0.95)",
              borderColor: "rgba(211, 158, 23, 0.2)",
            }}
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: "#f1f5f9" }}>
              <UserCheck size={20} style={{ color: "#d39e17" }} />
              Conceder Acesso Manual
            </h2>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleGrantAccess)} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Email Field */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel style={{ color: "#e8e4d8" }}>Email do Usuário *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#94a3b8" }} />
                            <Input
                              {...field}
                              type="email"
                              placeholder="usuario@exemplo.com"
                              className="pl-10"
                              disabled={submitting}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Expiration Date Field */}
                  <FormField
                    control={form.control}
                    name="expires_at"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel style={{ color: "#e8e4d8" }}>Data de Expiração (opcional)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#94a3b8" }} />
                            <Input
                              {...field}
                              type="date"
                              value={field.value ? new Date(field.value).toISOString().split("T")[0] : ""}
                              onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value).toISOString() : null)}
                              className="pl-10"
                              min={new Date().toISOString().split("T")[0]}
                              disabled={submitting}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Reason Field */}
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel style={{ color: "#e8e4d8" }}>Motivo (opcional)</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Descreva o motivo deste acesso manual..."
                          rows={3}
                          disabled={submitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="gap-2"
                    style={{ backgroundColor: "#d39e17", color: "#12110d" }}
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Concedendo...
                      </>
                    ) : (
                      <>
                        <UserCheck size={16} />
                        Conceder Acesso
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>

          {/* User List Table */}
          <UserListTable
            users={users}
            loading={usersLoading}
            onRefresh={refetch}
            currentUserId={user.id}
          />
        </div>
      </Container>
    </div>
  );
}
