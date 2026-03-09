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
    <nav className="grid grid-cols-2 gap-2 md:flex md:flex-col md:gap-1">
      {tabs.map((tab, index) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex min-w-0 items-center gap-2 rounded-xl px-4 py-3 text-left transition-all md:gap-3 ${
              tabs.length % 2 !== 0 && index === tabs.length - 1 ? "col-span-2" : ""
            } ${
              isActive
                ? "bg-[#d39e17] text-[#12110d] font-semibold"
                : "text-[#94a3b8] hover:bg-[rgba(211,158,23,0.1)] hover:text-[#f1f5f9]"
            }`}
          >
            <Icon size={18} className="shrink-0" />
            <span className="min-w-0 truncate text-sm">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
