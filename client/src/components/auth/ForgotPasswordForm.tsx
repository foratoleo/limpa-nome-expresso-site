import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface ForgotPasswordFormProps {
  onLogin: () => void;
}

export function ForgotPasswordForm({ onLogin }: ForgotPasswordFormProps) {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await resetPassword(email);

    setLoading(false);

    if (error) {
      setError("Erro ao enviar email. Verifique o endereço e tente novamente.");
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div
          className="w-16 h-16 mx-auto rounded-full flex items-center justify-center"
          style={{ backgroundColor: "rgba(96, 165, 250, 0.2)" }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold" style={{ color: "#f1f5f9" }}>
          Email enviado!
        </h3>
        <p className="text-sm" style={{ color: "#94a3b8" }}>
          Enviamos instruções para redefinir sua senha para <strong style={{ color: "#e8e4d8" }}>{email}</strong>.
        </p>
        <button
          onClick={onLogin}
          className="text-sm hover:underline"
          style={{ color: "#d39e17" }}
        >
          Voltar para o login
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm mb-4" style={{ color: "#94a3b8" }}>
        Digite seu email e enviaremos um link para redefinir sua senha.
      </p>

      <div>
        <label
          htmlFor="forgot-email"
          className="block text-sm font-medium mb-1.5"
          style={{ color: "#e8e4d8" }}
        >
          Email
        </label>
        <input
          id="forgot-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="w-full px-4 py-2.5 rounded-xl border outline-none transition-colors"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            borderColor: "rgba(211, 158, 23, 0.2)",
            color: "#f1f5f9",
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = "rgba(211, 158, 23, 0.5)"}
          onBlur={(e) => e.currentTarget.style.borderColor = "rgba(211, 158, 23, 0.2)"}
        />
      </div>

      {error && (
        <p className="text-sm" style={{ color: "#ef4444" }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 rounded-xl font-semibold transition-all disabled:opacity-50"
        style={{
          backgroundColor: "#d39e17",
          color: "#12110d",
        }}
      >
        {loading ? "Enviando..." : "Enviar link de recuperação"}
      </button>

      <p className="text-center text-sm" style={{ color: "#94a3b8" }}>
        Lembrou a senha?{" "}
        <button
          type="button"
          onClick={onLogin}
          className="font-medium hover:underline"
          style={{ color: "#d39e17" }}
        >
          Entrar
        </button>
      </p>
    </form>
  );
}
