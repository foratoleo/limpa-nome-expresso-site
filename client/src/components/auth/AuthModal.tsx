import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "login" | "register";
}

type Tab = "login" | "register" | "forgot";

export function AuthModal({ isOpen, onClose, defaultTab = "login" }: AuthModalProps) {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>(defaultTab);

  // Close modal when user logs in
  useEffect(() => {
    if (user && isOpen) {
      onClose();
    }
  }, [user, isOpen, onClose]);

  // Reset tab when modal opens
  useEffect(() => {
    if (isOpen) {
      setTab(defaultTab);
    }
  }, [isOpen, defaultTab]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
      onClick={handleBackdropClick}
    >
      <div
        className="w-full max-w-md rounded-2xl border p-6"
        style={{
          backgroundColor: "rgba(22, 40, 71, 0.98)",
          borderColor: "rgba(211, 158, 23, 0.3)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold" style={{ color: "#f1f5f9" }}>
            {tab === "login" && "Entrar"}
            {tab === "register" && "Criar Conta"}
            {tab === "forgot" && "Recuperar Senha"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            style={{ color: "#94a3b8" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        {tab !== "forgot" && (
          <div className="flex mb-6 rounded-xl overflow-hidden" style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}>
            <button
              onClick={() => setTab("login")}
              className="flex-1 py-2.5 text-sm font-medium transition-colors"
              style={{
                backgroundColor: tab === "login" ? "#d39e17" : "transparent",
                color: tab === "login" ? "#12110d" : "#94a3b8",
              }}
            >
              Entrar
            </button>
            <button
              onClick={() => setTab("register")}
              className="flex-1 py-2.5 text-sm font-medium transition-colors"
              style={{
                backgroundColor: tab === "register" ? "#d39e17" : "transparent",
                color: tab === "register" ? "#12110d" : "#94a3b8",
              }}
            >
              Criar Conta
            </button>
          </div>
        )}

        {/* Content */}
        {tab === "login" && (
          <LoginForm
            onSuccess={onClose}
            onForgotPassword={() => setTab("forgot")}
            onRegister={() => setTab("register")}
          />
        )}
        {tab === "register" && (
          <RegisterForm
            onSuccess={onClose}
            onLogin={() => setTab("login")}
          />
        )}
        {tab === "forgot" && (
          <ForgotPasswordForm onLogin={() => setTab("login")} />
        )}
      </div>
    </div>
  );
}
