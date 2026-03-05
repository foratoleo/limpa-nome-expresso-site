/**
 * UserListTable Component
 *
 * Table component for displaying all users with access status and action buttons.
 * Shows user email, status badge, manual access info, payment access info, and actions.
 *
 * Features:
 * - Color-coded status badges (UserStatusBadge)
 * - Grant/Revoke access buttons
 * - Loading skeleton state
 * - Empty state message
 * - Action confirmation dialogs
 *
 * @example
 * ```tsx
 * <UserListTable
 *   users={users}
 *   loading={loading}
 *   onRefresh={refetch}
 * />
 * ```
 */

import { useState } from "react";
import { UserStatusBadge } from "./UserStatusBadge";
import { RevokeConfirmDialog } from "./RevokeConfirmDialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Pencil, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import type { AdminUser } from "@/hooks/useAdminUsers";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

// ============================================================================
// TypeScript Types
// ============================================================================

/**
 * Props for UserListTable component
 */
export interface UserListTableProps {
  /** Array of users to display */
  users: AdminUser[];
  /** Loading state */
  loading: boolean;
  /** Callback to refresh the user list */
  onRefresh: () => void;
  /** Logged-in admin user ID */
  currentUserId?: string;
}

// ============================================================================
// Component
// ============================================================================

/**
 * UserListTable displays a table of users with status badges and action buttons.
 *
 * Each row shows:
 * - User email
 * - Status badge (color-coded)
 * - Manual access info (Sim/Não with reason)
 * - Payment access info (Ativo/Expirado)
 * - Action buttons (Grant access, Revoke access)
 *
 * @param props - Component props
 * @returns JSX element
 */
export function UserListTable({ users, loading, onRefresh, currentUserId }: UserListTableProps) {
  const [runningActionUserId, setRunningActionUserId] = useState<string | null>(null);

  const getAccessToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error("Sessão expirada. Faça login novamente.");
    }
    return session.access_token;
  };

  /**
   * Handle revoking access for a user
   */
  const handleRevoke = async (userId: string, userEmail: string) => {
    try {
      setRunningActionUserId(userId);
      const token = await getAccessToken();

      const response = await fetch(`/api/admin/access/${userId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason: "Revogado pelo painel administrativo",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to revoke access");
      }

      toast.success("Acesso revogado", {
        description: `Acesso de ${userEmail} foi revogado com sucesso`,
      });

      // Refresh the list
      onRefresh();
    } catch (error) {
      console.error("Error revoking access:", error);
      toast.error("Erro ao revogar acesso", {
        description: error instanceof Error ? error.message : "Tente novamente",
      });
    } finally {
      setRunningActionUserId(null);
    }
  };

  const handleEditUser = async (user: AdminUser) => {
    const newName = window.prompt("Nome de exibição:", user.display_name || "");
    if (newName === null) return;

    const newEmail = window.prompt("E-mail:", user.email);
    if (newEmail === null) return;

    try {
      setRunningActionUserId(user.id);
      const token = await getAccessToken();

      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          display_name: newName.trim() || null,
          email: newEmail.trim().toLowerCase(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Não foi possível editar o usuário");
      }

      toast.success("Usuário atualizado");
      onRefresh();
    } catch (error) {
      toast.error("Erro ao editar usuário", {
        description: error instanceof Error ? error.message : "Tente novamente",
      });
    } finally {
      setRunningActionUserId(null);
    }
  };

  const handleToggleStatus = async (user: AdminUser) => {
    if (user.id === currentUserId) {
      toast.error("Você não pode alterar o status do seu próprio usuário");
      return;
    }

    const targetStatus = user.has_access ? "inactive" : "active";
    const confirmed = window.confirm(
      targetStatus === "inactive"
        ? `Desativar acesso de ${user.email}?`
        : `Ativar acesso de ${user.email}?`
    );

    if (!confirmed) return;

    try {
      setRunningActionUserId(user.id);
      const token = await getAccessToken();

      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          access_status: targetStatus,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Não foi possível alterar o status");
      }

      toast.success(
        targetStatus === "inactive" ? "Acesso desativado" : "Acesso ativado"
      );
      onRefresh();
    } catch (error) {
      toast.error("Erro ao alterar status", {
        description: error instanceof Error ? error.message : "Tente novamente",
      });
    } finally {
      setRunningActionUserId(null);
    }
  };

  const handleDeleteUser = async (user: AdminUser) => {
    if (user.id === currentUserId) {
      toast.error("Você não pode deletar seu próprio usuário admin");
      return;
    }

    const confirmed = window.confirm(
      `Tem certeza que deseja deletar o usuário ${user.email}? Essa ação é permanente.`
    );
    if (!confirmed) return;

    try {
      setRunningActionUserId(user.id);
      const token = await getAccessToken();

      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Não foi possível deletar o usuário");
      }

      toast.success("Usuário deletado");
      onRefresh();
    } catch (error) {
      toast.error("Erro ao deletar usuário", {
        description: error instanceof Error ? error.message : "Tente novamente",
      });
    } finally {
      setRunningActionUserId(null);
    }
  };

  /**
   * Format date for display
   */
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="rounded-2xl border p-6" style={{ backgroundColor: "rgba(22, 40, 71, 0.95)", borderColor: "rgba(211, 158, 23, 0.2)" }}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#d39e17" }} />
          <span className="ml-3" style={{ color: "#94a3b8" }}>Carregando usuários...</span>
        </div>
      </div>
    );
  }

  // Empty state
  if (users.length === 0) {
    return (
      <div className="rounded-2xl border p-6" style={{ backgroundColor: "rgba(22, 40, 71, 0.95)", borderColor: "rgba(211, 158, 23, 0.2)" }}>
        <div className="text-center py-12">
          <p style={{ color: "#94a3b8" }}>Nenhum usuário encontrado</p>
        </div>
      </div>
    );
  }

  // Render table
  return (
    <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "rgba(22, 40, 71, 0.95)", borderColor: "rgba(211, 158, 23, 0.2)" }}>
      <div className="p-6 border-b" style={{ borderColor: "rgba(211, 158, 23, 0.1)" }}>
        <h2 className="text-lg font-semibold" style={{ color: "#f1f5f9" }}>
          Lista de Usuários
        </h2>
        <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
          {users.length} {users.length === 1 ? "usuário" : "usuários"}
        </p>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow style={{ borderColor: "rgba(211, 158, 23, 0.1)" }}>
              <TableHead style={{ color: "#e8e4d8" }}>Usuário</TableHead>
              <TableHead style={{ color: "#e8e4d8" }}>Cadastro</TableHead>
              <TableHead style={{ color: "#e8e4d8" }}>Ativação</TableHead>
              <TableHead style={{ color: "#e8e4d8" }}>Status</TableHead>
              <TableHead style={{ color: "#e8e4d8" }}>Acesso Manual</TableHead>
              <TableHead style={{ color: "#e8e4d8" }}>Acesso Pago</TableHead>
              <TableHead style={{ color: "#e8e4d8" }}>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const manualExpired = Boolean(
                user.manual_access?.expires_at &&
                new Date(user.manual_access.expires_at) < new Date()
              );
              const hasActiveManualAccess = Boolean(
                user.manual_access?.is_active && !manualExpired
              );
              const hasActivePaidAccess = Boolean(
                user.payment_access?.is_active &&
                (!user.payment_access?.expires_at || new Date(user.payment_access.expires_at) > new Date())
              );
              const canRevokeManual = hasActiveManualAccess;
              const canGrantManual = !hasActiveManualAccess;

              return (
                <TableRow
                  key={user.id}
                  style={{ borderColor: "rgba(211, 158, 23, 0.1)" }}
                >
                  <TableCell style={{ color: "#e8e4d8" }}>
                    <div className="flex flex-col">
                      <span>{user.email}</span>
                      {user.display_name ? (
                        <span className="text-xs" style={{ color: "#94a3b8" }}>
                          {user.display_name}
                        </span>
                      ) : null}
                    </div>
                  </TableCell>

                  <TableCell style={{ color: "#94a3b8" }}>
                    {formatDate(user.created_at)}
                  </TableCell>

                  <TableCell style={{ color: "#94a3b8" }}>
                    {formatDate(user.activated_at)}
                  </TableCell>

                  <TableCell>
                    <UserStatusBadge status={user.status} />
                  </TableCell>

                  <TableCell>
                    {user.manual_access ? (
                      <div className="flex flex-col gap-1">
                        {hasActiveManualAccess ? (
                          <Badge variant="outline" className="w-fit">Ativo</Badge>
                        ) : (
                          <Badge variant="secondary" className="w-fit">Inativo</Badge>
                        )}
                        {user.manual_access.reason && (
                          <span className="text-xs" style={{ color: "#94a3b8" }} title={user.manual_access.reason}>
                            {user.manual_access.reason.length > 20
                              ? `${user.manual_access.reason.substring(0, 20)}...`
                              : user.manual_access.reason}
                          </span>
                        )}
                      </div>
                    ) : (
                      <Badge variant="secondary" className="w-fit">Não</Badge>
                    )}
                  </TableCell>

                  <TableCell>
                    {user.payment_access ? (
                      <Badge variant="default" className="w-fit">
                        {hasActivePaidAccess ? "Ativo" : "Expirado"}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="w-fit">Não</Badge>
                    )}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      {canRevokeManual ? (
                        <RevokeConfirmDialog
                          userName={user.email}
                          userEmail={user.email}
                          onConfirm={async () => {
                            await handleRevoke(user.id, user.email);
                          }}
                        />
                      ) : null}

                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title="Editar usuário"
                        className="hover:bg-blue-500/20 hover:text-blue-400"
                        onClick={() => handleEditUser(user)}
                        disabled={runningActionUserId === user.id}
                      >
                        <Pencil size={16} />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title={user.has_access ? "Desativar acesso" : "Ativar acesso"}
                        className="hover:bg-yellow-500/20 hover:text-yellow-300"
                        onClick={() => handleToggleStatus(user)}
                        disabled={runningActionUserId === user.id || user.id === currentUserId}
                      >
                        {user.has_access ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title="Deletar usuário"
                        className="hover:bg-red-500/20 hover:text-red-400"
                        onClick={() => handleDeleteUser(user)}
                        disabled={runningActionUserId === user.id || user.id === currentUserId}
                      >
                        <Trash2 size={16} />
                      </Button>

                      {canGrantManual ? (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          title="Conceda acesso pelo formulário acima"
                          className="hover:bg-green-500/20 hover:text-green-400"
                          disabled
                        >
                          <ToggleLeft size={16} />
                        </Button>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ============================================================================
// Export Default
// ============================================================================

export default UserListTable;
