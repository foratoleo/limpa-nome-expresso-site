import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";

interface UserProfileProps {
  onOpenAuth: () => void;
}

export function UserProfile({ onOpenAuth }: UserProfileProps) {
  const { user, signOut } = useAuth();
  const [, navigate] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) {
    return (
      <button
        onClick={onOpenAuth}
        className="rounded-full px-3 py-2 text-xs font-bold transition-all hover:shadow-lg sm:px-5 sm:text-sm"
        style={{
          backgroundColor: "#d39e17",
          color: "#12110d",
          boxShadow: "0 0 20px rgba(211, 158, 23, 0.3)",
        }}
      >
        Área do Cliente
      </button>
    );
  }

  const initials = user.email?.substring(0, 2).toUpperCase() ?? "U";
  const displayName = user.user_metadata?.name ?? user.email?.split("@")[0] ?? "Usuário";

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut();
    navigate("/");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-full transition-colors"
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(211, 158, 23, 0.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
        }}
      >
        <div
          className="w-10 h-10 rounded-full border-2 flex items-center justify-center"
          style={{ borderColor: "rgba(211, 158, 23, 0.5)" }}
        >
          <span className="text-sm font-bold" style={{ color: "#d39e17" }}>
            {initials}
          </span>
        </div>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-56 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border shadow-xl"
          style={{
            backgroundColor: "rgba(22, 40, 71, 0.98)",
            borderColor: "rgba(211, 158, 23, 0.3)",
          }}
        >
          <div className="px-4 py-3 border-b" style={{ borderColor: "rgba(211, 158, 23, 0.2)" }}>
            <p className="text-sm font-semibold truncate" style={{ color: "#f1f5f9" }}>
              {displayName}
            </p>
            <p className="text-xs truncate" style={{ color: "#94a3b8" }}>
              {user.email}
            </p>
          </div>

          <div className="py-1">
            <a
              href="/dashboard"
              className="block px-4 py-2 text-sm transition-colors"
              style={{ color: "#e8e4d8" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(211, 158, 23, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              Meu Painel
            </a>
            <a
              href="/guia"
              className="block px-4 py-2 text-sm transition-colors"
              style={{ color: "#e8e4d8" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(211, 158, 23, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              Meus Processos
            </a>
            <a
              href="/faturamento"
              className="block px-4 py-2 text-sm transition-colors"
              style={{ color: "#e8e4d8" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(211, 158, 23, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              Faturamento
            </a>
          </div>

          <div className="border-t py-1" style={{ borderColor: "rgba(211, 158, 23, 0.2)" }}>
            <button
              onClick={handleSignOut}
              className="w-full text-left px-4 py-2 text-sm transition-colors"
              style={{ color: "#ef4444" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              Sair
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
