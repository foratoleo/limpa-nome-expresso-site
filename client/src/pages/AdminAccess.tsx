import { useEffect, useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Shield, UserX, UserCheck, Calendar, Mail, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useAdminUsers, type AdminUser } from "@/hooks/useAdminUsers";
import { useGrantAccess, useRevokeAccess } from "@/hooks/useAdminMutations";
import { UserSearchInput } from "@/components/admin/UserSearchInput";
import { UserFilters, type StatusFilter, type AccessTypeFilter } from "@/components/admin/UserFilters";

export default function AdminAccess() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilters, setStatusFilters] = useState<StatusFilter[]>([]);
  const [accessTypeFilters, setAccessTypeFilters] = useState<AccessTypeFilter[]>([]);

  // Form state
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  // React Query hooks
  const { data: users = [], isLoading } = useAdminUsers(searchTerm);
  const grantAccess = useGrantAccess();
  const revokeAccess = useRevokeAccess();

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
   * Check if access is expired
   */
  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  /**
   * Client-side filtering with useMemo
   * Applies status and access type filters on top of server-side search
   */
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Status filter
      const matchesStatus = statusFilters.length === 0 ||
        (statusFilters.includes('active') && user.is_active && !isExpired(user.expires_at)) ||
        (statusFilters.includes('expired') && isExpired(user.expires_at)) ||
        (statusFilters.includes('inactive') && !user.is_active);

      // Access type filter (all manual accesses from this endpoint)
      const matchesAccess = accessTypeFilters.length === 0 ||
        accessTypeFilters.includes('manual');

      return matchesStatus && matchesAccess;
    });
  }, [users, statusFilters, accessTypeFilters]);

  /**
   * Grant access handler
   */
  const handleGrantAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Email é obrigatório");
      return;
    }

    grantAccess.mutate({
      email: email.trim(),
      reason: reason.trim() || undefined,
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : undefined,
    }, {
      onSuccess: () => {
        // Reset form
        setEmail("");
        setReason("");
        setExpiresAt("");
      },
    });
  };

  /**
   * Revoke access handler
   */
  const handleRevokeAccess = (userId: string, userEmail: string) => {
    revokeAccess.mutate({ userId, email: userEmail });
  };

  /**
   * Reactivate access handler
   */
  const handleReactivateAccess = async (userId: string, userEmail: string) => {
    try {
      const response = await fetch(`/api/admin/access/${userId}/reactivate`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao reativar acesso");
      }

      toast.success("Acesso reativado", {
        description: `Acesso de ${userEmail} foi reativado`,
      });
    } catch (error) {
      console.error("Error reactivating access:", error);
      toast.error("Erro ao reativar acesso", {
        description: error instanceof Error ? error.message : "Tente novamente",
      });
    }
  };

  /**
   * Format date for display
   */
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#12110d" }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: "#d39e17", borderTopColor: "transparent" }} />
          <p style={{ color: "#94a3b8" }}>Carregando...</p>
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
                Administração de Acessos
              </h1>
              <p className="text-sm" style={{ color: "#94a3b8" }}>
                Gerencie acessos manuais ao sistema
              </p>
            </div>
          </div>
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
            <form onSubmit={handleGrantAccess} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" style={{ color: "#e8e4d8" }}>
                    Email do Usuário *
                  </Label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#94a3b8" }} />
                    <Input
                      id="email"
                      type="email"
                      placeholder="usuario@exemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiresAt" style={{ color: "#e8e4d8" }}>
                    Data de Expiração (opcional)
                  </Label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#94a3b8" }} />
                    <Input
                      id="expiresAt"
                      type="date"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                      className="pl-10"
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason" style={{ color: "#e8e4d8" }}>
                  Motivo (opcional)
                </Label>
                <Textarea
                  id="reason"
                  placeholder="Descreva o motivo deste acesso manual..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  isLoading={grantAccess.isPending}
                  className="gap-2"
                  style={{ backgroundColor: "#d39e17", color: "#12110d" }}
                >
                  <UserCheck size={16} />
                  Conceder Acesso
                </Button>
              </div>
            </form>
          </div>

          {/* Search and Filters */}
          <div
            className="rounded-2xl border p-6"
            style={{
              backgroundColor: "rgba(22, 40, 71, 0.95)",
              borderColor: "rgba(211, 158, 23, 0.2)",
            }}
          >
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              {/* Search Input */}
              <div className="w-full md:w-auto md:flex-1">
                <UserSearchInput
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Buscar por nome ou email..."
                />
              </div>

              {/* Filters */}
              <UserFilters
                statusFilters={statusFilters}
                onStatusChange={setStatusFilters}
                accessTypeFilters={accessTypeFilters}
                onAccessTypeChange={setAccessTypeFilters}
              />
            </div>

            {/* Results count */}
            <p className="text-sm mt-4" style={{ color: "#94a3b8" }}>
              {filteredUsers.length} {filteredUsers.length === 1 ? "acesso" : "acessos"}
              {searchTerm && ` correspondendo à "${searchTerm}"`}
              {(statusFilters.length > 0 || accessTypeFilters.length > 0) && " com filtros aplicados"}
            </p>
          </div>

          {/* Access List */}
          <div
            className="rounded-2xl border overflow-hidden"
            style={{
              backgroundColor: "rgba(22, 40, 71, 0.95)",
              borderColor: "rgba(211, 158, 23, 0.2)",
            }}
          >
            <div className="p-6 border-b" style={{ borderColor: "rgba(211, 158, 23, 0.1)" }}>
              <h2 className="text-lg font-semibold" style={{ color: "#f1f5f9" }}>
                Acessos Manuais Concedidos
              </h2>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow style={{ borderColor: "rgba(211, 158, 23, 0.1)" }}>
                    <TableHead style={{ color: "#e8e4d8" }}>Usuário</TableHead>
                    <TableHead style={{ color: "#e8e4d8" }}>Concedido por</TableHead>
                    <TableHead style={{ color: "#e8e4d8" }}>Data de Concessão</TableHead>
                    <TableHead style={{ color: "#e8e4d8" }}>Expira em</TableHead>
                    <TableHead style={{ color: "#e8e4d8" }}>Motivo</TableHead>
                    <TableHead style={{ color: "#e8e4d8" }}>Status</TableHead>
                    <TableHead style={{ color: "#e8e4d8" }}>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8" style={{ color: "#94a3b8" }}>
                        {searchTerm || statusFilters.length > 0 || accessTypeFilters.length > 0
                          ? "Nenhum acesso encontrado com os filtros aplicados"
                          : "Nenhum acesso manual concedido ainda"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((access) => {
                      const expired = isExpired(access.expires_at);
                      return (
                        <TableRow
                          key={access.id}
                          style={{
                            borderColor: "rgba(211, 158, 23, 0.1)",
                            opacity: !access.is_active || expired ? 0.5 : 1,
                          }}
                        >
                          <TableCell style={{ color: "#e8e4d8" }}>
                            {access.user_email || "N/A"}
                          </TableCell>
                          <TableCell style={{ color: "#94a3b8" }}>
                            {access.granter_email || "N/A"}
                          </TableCell>
                          <TableCell style={{ color: "#94a3b8" }}>
                            {formatDate(access.granted_at)}
                          </TableCell>
                          <TableCell style={{ color: "#94a3b8" }}>
                            {access.expires_at ? formatDate(access.expires_at) : "Não expira"}
                          </TableCell>
                          <TableCell style={{ color: "#94a3b8", maxWidth: 200 }}>
                            <div className="truncate" title={access.reason || ""}>
                              {access.reason || "-"}
                            </div>
                          </TableCell>
                          <TableCell>
                            {expired ? (
                              <Badge variant="destructive">Expirado</Badge>
                            ) : access.is_active ? (
                              <Badge variant="default">Ativo</Badge>
                            ) : (
                              <Badge variant="secondary">Inativo</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {access.is_active && !expired ? (
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => handleRevokeAccess(access.user_id, access.user_email || "")}
                                title="Revogar acesso"
                                className="hover:bg-red-500/20 hover:text-red-400"
                                disabled={revokeAccess.isPending}
                              >
                                <UserX size={16} />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => handleReactivateAccess(access.user_id, access.user_email || "")}
                                title="Reativar acesso"
                                className="hover:bg-green-500/20 hover:text-green-400"
                              >
                                <RefreshCw size={16} />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
