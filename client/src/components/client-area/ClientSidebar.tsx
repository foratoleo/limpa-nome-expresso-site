import { FileText, CheckSquare, StickyNote, Scale, LayoutDashboard } from "lucide-react";

interface ClientSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "documentos", label: "Documentos", icon: FileText },
  { id: "tarefas", label: "Tarefas", icon: CheckSquare },
  { id: "notas", label: "Anotacoes", icon: StickyNote },
  { id: "processos", label: "Processos", icon: Scale },
];

export function ClientSidebar({ activeTab, onTabChange }: ClientSidebarProps) {
  return (
    <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap ${
              isActive
                ? "bg-[#d39e17] text-[#12110d] font-semibold"
                : "text-[#94a3b8] hover:bg-[rgba(211,158,23,0.1)] hover:text-[#f1f5f9]"
            }`}
          >
            <Icon size={20} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
