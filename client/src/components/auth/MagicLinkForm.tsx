import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface MagicLinkFormProps {
  onSuccess?: () => void;
  onBackToLogin?: () => void;
}

export function MagicLinkForm({ onSuccess, onBackToLogin }: MagicLinkFormProps) {
  const { signInWithMagicLink } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error, success } = await signInWithMagicLink(email);

    setLoading(false);

    if (error) {
      setError(getErrorMessage(error.message));
    } else if (success) {
      setSent(true);
      onSuccess?.();
    }
  };

  if (sent) {
    return (
      <div className="text-center py-8">
        <div className="mb-4">
          <svg
            className="mx-auto"
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#22c55e"
            strokeWidth="2"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h3 className="text-xl font-bold mb-2" style={{ color: "#f1f5f9" }}>
          Link enviado!
        </h3>
        <p className="text-sm mb-6" style={{ color: "#94a3b8" }}>
          Enviamos um link de acesso para <strong>{email}</strong>. Verifique sua
          caixa de entrada.
        </p>
        <div
          className="text-xs p-4 rounded-xl mb-6"
          style={{
            backgroundColor: "rgba(34, 197, 94, 0.1)",
            borderLeft: "4px solid #22c55e",
          }}
        >
          <p style={{ color: "#94a3b8" }}>
            <span style={{ color: "#22c55e", fontWeight: 600 }}>💡 Dica:</span>{" "}
            O link expira em 1 hora. Se não encontrar, verifique a pasta de spam.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setSent(false);
            setEmail("");
          }}
          className="text-sm"
          style={{ color: "#d39e17" }}
        >
          Enviar outro link
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="magic-email"
          className="block text-sm font-medium mb-1.5"
          style={{ color: "#e8e4d8" }}
        >
          Email
        </label>
        <input
          id="magic-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          placeholder="seu@email.com"
          className="w-full px-4 py-2.5 rounded-xl border outline-none transition-colors"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            borderColor: "rgba(211, 158, 23, 0.2)",
            color: "#f1f5f9",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(211, 158, 23, 0.5)")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(211, 158, 23, 0.2)")}
        />
      </div>

      {error && <p className="text-sm" style={{ color: "#ef4444" }}>{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 rounded-xl font-semibold transition-all disabled:opacity-50"
        style={{
          backgroundColor: "#d39e17",
          color: "#12110d",
        }}
      >
        {loading ? "Enviando..." : "Enviar link de acesso"}
      </button>

      {onBackToLogin && (
        <div className="text-center">
          <button
            type="button"
            onClick={onBackToLogin}
            className="text-sm"
            style={{ color: "#94a3b8" }}
          >
            Voltar para login com senha
          </button>
        </div>
      )}
    </form>
  );
}

function getErrorMessage(error: string): string {
  // Email validation errors
  if (error.includes("Invalid email") || error.includes("validation")) {
    return "Email inválido. Verifique o endereço digitado.";
  }

  // Rate limiting
  if (error.includes("rate limit") || error.includes("too many")) {
    return "Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.";
  }

  // Network/timeout errors
  if (error.includes("timeout") || error.includes("timed out") || error.includes("network")) {
    return "Tempo de conexão esgotado. Verifique sua internet e tente novamente.";
  }

  if (error.includes("fetch") || error.includes("Failed to fetch")) {
    return "Erro de conexão. Verifique sua internet.";
  }

  // Supabase service errors
  if (error.includes("service unavailable") || error.includes("503") || error.includes("502")) {
    return "Serviço temporariamente indisponível. Tente novamente em alguns minutos.";
  }

  // OTP/expired link errors
  if (error.includes("expired") || error.includes("OTP")) {
    return "Link expirado. Solicite um novo link de acesso.";
  }

  if (error.includes("already used") || error.includes("invalid")) {
    return "Link inválido ou já usado. Solicite um novo link.";
  }

  // Generic fallback (security - don't leak info)
  return "Não foi possível enviar o link. Tente novamente ou entre em contato com o suporte.";
}
