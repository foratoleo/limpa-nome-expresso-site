import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Container } from "@/components/ui/container";
import { ClientSidebar, ProgressDashboard, NextSteps, MissingItems } from "@/components/client-area";
import { DocumentsList } from "@/components/documents";
import { NotesList } from "@/components/notes";
import { TodoList } from "@/components/todos";
import { ProcessList } from "@/components/processes";
import { LogOut, ExternalLink } from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";

export default function Dashboard() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Note: Auth redirect is handled by ProtectedRoute in App.tsx

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#12110d" }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: "#d39e17", borderTopColor: "transparent" }} />
          <p style={{ color: "#94a3b8" }}>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const displayName = user.user_metadata?.name ?? user.email?.split("@")[0] ?? "Usuario";
  const initials = user.email?.substring(0, 2).toUpperCase() ?? "U";

  const renderContent = () => {
    switch (activeTab) {
      case "documentos":
        return <DocumentsList />;
      case "notas":
        return <NotesList />;
      case "tarefas":
        return <TodoList />;
      case "processos":
        return <ProcessList />;
      case "dashboard":
      default:
        return (
          <div className="space-y-6">
            <ProgressDashboard />
            <NextSteps />
            <MissingItems />
            <QuickActions />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#12110d" }}>
      <SiteHeader
        links={[
          { href: "/dashboard", label: "Painel" },
          { href: "/guia", label: "Guia" },
          { href: "/documentos", label: "Documentos" },
          { href: "/modelos", label: "Modelos" },
          { href: "/processo", label: "Meu Processo" },
          { href: "/suporte", label: "Suporte" },
        ]}
        activeHref="/dashboard"
        logoHref="/guia"
        rightContent={
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full border text-sm font-bold"
                style={{ borderColor: "rgba(211, 158, 23, 0.5)", color: "#d39e17" }}
              >
                {initials}
              </div>
              <span className="hidden text-sm sm:block" style={{ color: "#e8e4d8" }}>
                {displayName}
              </span>
            </div>
            <button
              onClick={() => void signOut()}
              className="rounded-lg p-2 transition-colors hover:bg-[rgba(239,68,68,0.1)]"
              style={{ color: "#94a3b8" }}
              title="Sair"
            >
              <LogOut size={20} />
            </button>
          </div>
        }
      />

      {/* Main Content */}
      <Container as="main" maxWidth="xl" className="py-6 flex-1">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar - Desktop */}
          <aside className="hidden md:block w-56 shrink-0">
            <div
              className="rounded-2xl border p-3 sticky top-24"
              style={{
                backgroundColor: "rgba(22, 40, 71, 0.95)",
                borderColor: "rgba(211, 158, 23, 0.2)",
              }}
            >
              <ClientSidebar activeTab={activeTab} onTabChange={setActiveTab} />
            </div>
          </aside>

          {/* Mobile Tabs */}
          <div
            className="mb-4 rounded-xl border p-3 md:hidden"
            style={{
              backgroundColor: "rgba(22, 40, 71, 0.95)",
              borderColor: "rgba(211, 158, 23, 0.2)",
            }}
          >
            <ClientSidebar activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            {renderContent()}
          </div>
        </div>
      </Container>
    </div>
  );
}

function QuickActions() {
  const actions = [
    {
      href: "/modelos",
      title: "Modelos de Protocolo",
      description: "Use os modelos prontos da plataforma",
      color: "#22c55e",
    },
    {
      href: "/downloads",
      title: "Roteiros e Downloads",
      description: "Arquivos de apoio para cada etapa",
      color: "#60a5fa",
    },
    {
      href: "/processo",
      title: "Meu Processo",
      description: "Acompanhe seu progresso na plataforma",
      color: "#d39e17",
    },
    {
      href: "/suporte",
      title: "Central de Suporte",
      description: "Tire dúvidas sobre o fluxo completo",
      color: "#a855f7",
    },
  ];

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4" style={{ color: "#f1f5f9" }}>
        Acoes Rapidas
      </h3>
      <div className="grid sm:grid-cols-2 gap-4">
        {actions.map((action) => (
          <a
            key={action.href}
            href={action.href}
            className="rounded-xl border p-4 transition-colors group"
            style={{
              backgroundColor: "rgba(22, 40, 71, 0.95)",
              borderColor: `${action.color}40`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = `${action.color}80`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = `${action.color}40`;
            }}
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold" style={{ color: action.color }}>
                  {action.title}
                </h4>
                <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
                  {action.description}
                </p>
              </div>
              <ExternalLink size={16} style={{ color: action.color }} />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
