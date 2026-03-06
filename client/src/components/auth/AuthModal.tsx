import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { ForgotPasswordForm } from "./ForgotPasswordForm";
import { MagicLinkForm } from "./MagicLinkForm";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: Tab;
  onRegisterSuccess?: (email: string) => void;
}

type Tab = "login" | "register" | "forgot" | "magic";

export function AuthModal({
  isOpen,
  onClose,
  defaultTab = "login",
  onRegisterSuccess,
}: AuthModalProps) {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>(defaultTab as Tab);

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

  const handleRegisterSuccess = (email: string) => {
    if (onRegisterSuccess) {
      onRegisterSuccess(email);
      return;
    }
    onClose();
  };

  const isRegisterTab = tab === "register";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
      onClick={handleBackdropClick}
    >
      <div
        className={`w-full rounded-2xl border p-6 ${isRegisterTab ? "max-w-5xl" : "max-w-md"}`}
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
            {tab === "magic" && "Acesso por Link"}
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
          <div className="flex gap-2 mb-6 rounded-xl overflow-hidden" style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}>
            <button
              onClick={() => setTab("login")}
              className="flex-1 py-2.5 text-sm font-medium transition-colors rounded-lg"
              style={{
                backgroundColor: tab === "login" ? "#d39e17" : "transparent",
                color: tab === "login" ? "#12110d" : "#94a3b8",
              }}
            >
              Com Senha
            </button>
            <button
              onClick={() => setTab("magic")}
              className="flex-1 py-2.5 text-sm font-medium transition-colors rounded-lg"
              style={{
                backgroundColor: tab === "magic" ? "#d39e17" : "transparent",
                color: tab === "magic" ? "#12110d" : "#94a3b8",
              }}
            >
              Magic Link
            </button>
            <button
              onClick={() => setTab("register")}
              className="flex-1 py-2.5 text-sm font-medium transition-colors rounded-lg"
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
        {tab === "magic" && (
          <MagicLinkForm
            onSuccess={onClose}
            onBackToLogin={() => setTab("login")}
          />
        )}
        {tab === "register" && (
          <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <aside
              className="rounded-2xl border p-6"
              style={{
                background:
                  "linear-gradient(145deg, rgba(211, 158, 23, 0.18) 0%, rgba(22, 40, 71, 0.35) 55%, rgba(18, 17, 13, 0.6) 100%)",
                borderColor: "rgba(211, 158, 23, 0.25)",
              }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] mb-3" style={{ color: "#d39e17" }}>
                Acesso Premium
              </p>
              <h3 className="text-2xl font-bold leading-tight mb-4" style={{ color: "#f1f5f9" }}>
                Sua conta libera o caminho completo para limpar seu nome
              </h3>
              <p className="text-sm mb-6" style={{ color: "#cbd5e1" }}>
                Entre, organize seus documentos e siga o passo a passo jurídico com base legal e
                modelos prontos para protocolar.
              </p>

              <div className="space-y-3">
                {[
                  "Modelos de petição inicial e recursos atualizados",
                  "Checklist de provas (e-mail, spam, SMS e protocolos)",
                  "Roteiro de protocolo no e-SAJ e acompanhamento no TJSP",
                  "Suporte com resposta em até 48 horas úteis",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center mt-0.5 shrink-0"
                      style={{ backgroundColor: "rgba(34, 197, 94, 0.2)", color: "#22c55e" }}
                    >
                      ✓
                    </span>
                    <span className="text-sm" style={{ color: "#e2e8f0" }}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </aside>

            <div
              className="rounded-2xl border p-5 sm:p-6"
              style={{
                backgroundColor: "rgba(18, 17, 13, 0.45)",
                borderColor: "rgba(211, 158, 23, 0.2)",
              }}
            >
              <h3 className="text-lg font-semibold mb-1" style={{ color: "#f1f5f9" }}>
                Criar conta
              </h3>
              <p className="text-sm mb-5" style={{ color: "#94a3b8" }}>
                Cadastre seu login e senha para continuar no checkout.
              </p>
              <RegisterForm
                onSuccess={handleRegisterSuccess}
                onLogin={() => setTab("login")}
              />
            </div>
          </div>
        )}
        {tab === "forgot" && (
          <ForgotPasswordForm onLogin={() => setTab("login")} />
        )}
      </div>
    </div>
  );
}
