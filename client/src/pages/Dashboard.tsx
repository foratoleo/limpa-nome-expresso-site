import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { Container } from "@/components/ui/container";
import { ClientSidebar, ProgressDashboard, NextSteps, MissingItems } from "@/components/client-area";
import { DocumentsList } from "@/components/documents";
import { NotesList } from "@/components/notes";
import { TodoList } from "@/components/todos";
import { ProcessList } from "@/components/processes";
import { LogOut, ExternalLink } from "lucide-react";

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
      {/* Header */}
      <header
        className="sticky top-0 z-50 backdrop-blur-[6px] border-b"
        style={{
          backgroundColor: "rgba(18, 17, 13, 0.9)",
          borderColor: "rgba(211, 158, 23, 0.2)",
        }}
      >
        <Container as="div" maxWidth="xl" className="flex items-center justify-between py-4">
          <a href="/guia" className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center">
              <svg width="27" height="29" viewBox="0 0 27 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.5 0L26.5 8V21L13.5 29L0.5 21V8L13.5 0Z" fill="#d39e17" />
                <path d="M13.5 6L20 10V19L13.5 23L7 19V10L13.5 6Z" fill="#12110d" />
              </svg>
            </div>
            <h2 className="text-xl font-bold hidden sm:block" style={{ color: "#f1f5f9" }}>
              Limpa Nome <span style={{ color: "#d39e17" }}>Expresso</span>
            </h2>
          </a>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full border flex items-center justify-center text-sm font-bold"
                style={{ borderColor: "rgba(211, 158, 23, 0.5)", color: "#d39e17" }}
              >
                {initials}
              </div>
              <span className="text-sm hidden sm:block" style={{ color: "#e8e4d8" }}>
                {displayName}
              </span>
            </div>
            <button
              onClick={signOut}
              className="p-2 rounded-lg hover:bg-[rgba(239,68,68,0.1)] transition-colors"
              style={{ color: "#94a3b8" }}
              title="Sair"
            >
              <LogOut size={20} />
            </button>
          </div>
        </Container>
      </header>

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
            className="md:hidden rounded-xl border p-2 mb-4 overflow-x-auto"
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
      href: "https://www.tjsp.jus.br/peticionamentojec",
      title: "Peticionamento JEC",
      description: "Acesse o sistema e-SAJ do TJSP",
      color: "#22c55e",
    },
    {
      href: "https://www.tjsp.jus.br/balcaovirtual",
      title: "Balcao Virtual",
      description: "Atendimento por videoconferencia",
      color: "#60a5fa",
    },
    {
      href: "https://esaj.tjsp.jus.br/cpopg/open.do",
      title: "Consulta Processual",
      description: "Acompanhe seu processo",
      color: "#d39e17",
    },
    {
      href: "https://www.serasa.com.br",
      title: "Consultar Serasa",
      description: "Verifique sua situacao cadastral",
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
            target="_blank"
            rel="noopener noreferrer"
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
