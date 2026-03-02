import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface LoginFormProps {
  onSuccess?: () => void;
  onForgotPassword: () => void;
  onRegister: () => void;
}

export function LoginForm({ onSuccess, onForgotPassword, onRegister }: LoginFormProps) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await signIn(email, password);

    setLoading(false);

    if (error) {
      setError(getErrorMessage(error.message));
    } else {
      onSuccess?.();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="login-email"
          className="block text-sm font-medium mb-1.5"
          style={{ color: "#e8e4d8" }}
        >
          Email
        </label>
        <input
          id="login-email"
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

      <div>
        <label
          htmlFor="login-password"
          className="block text-sm font-medium mb-1.5"
          style={{ color: "#e8e4d8" }}
        >
          Senha
        </label>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
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
        {loading ? "Entrando..." : "Entrar"}
      </button>

      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={onForgotPassword}
          className="hover:underline"
          style={{ color: "#60a5fa" }}
        >
          Esqueceu a senha?
        </button>
        <button
          type="button"
          onClick={onRegister}
          className="hover:underline"
          style={{ color: "#d39e17" }}
        >
          Criar conta
        </button>
      </div>
    </form>
  );
}

function getErrorMessage(message: string): string {
  if (message.includes("Invalid login credentials")) {
    return "Email ou senha incorretos";
  }
  if (message.includes("Email not confirmed")) {
    return "Confirme seu email antes de entrar";
  }
  return "Erro ao fazer login. Tente novamente";
}
