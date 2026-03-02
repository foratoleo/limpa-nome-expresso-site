import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface RegisterFormProps {
  onSuccess?: () => void;
  onLogin: () => void;
}

export function RegisterForm({ onSuccess, onLogin }: RegisterFormProps) {
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setLoading(true);

    const { error } = await signUp(email, password);

    setLoading(false);

    if (error) {
      setError(getErrorMessage(error.message));
    } else {
      setSuccess(true);
      onSuccess?.();
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div
          className="w-16 h-16 mx-auto rounded-full flex items-center justify-center"
          style={{ backgroundColor: "rgba(34, 197, 94, 0.2)" }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold" style={{ color: "#f1f5f9" }}>
          Conta criada!
        </h3>
        <p className="text-sm" style={{ color: "#94a3b8" }}>
          Enviamos um email de confirmação para <strong style={{ color: "#e8e4d8" }}>{email}</strong>.
          Verifique sua caixa de entrada e clique no link para ativar sua conta.
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
      <div>
        <label
          htmlFor="register-email"
          className="block text-sm font-medium mb-1.5"
          style={{ color: "#e8e4d8" }}
        >
          Email
        </label>
        <input
          id="register-email"
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
          htmlFor="register-password"
          className="block text-sm font-medium mb-1.5"
          style={{ color: "#e8e4d8" }}
        >
          Senha
        </label>
        <input
          id="register-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          minLength={6}
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
          htmlFor="register-confirm-password"
          className="block text-sm font-medium mb-1.5"
          style={{ color: "#e8e4d8" }}
        >
          Confirmar Senha
        </label>
        <input
          id="register-confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
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
        {loading ? "Criando conta..." : "Criar conta"}
      </button>

      <p className="text-center text-sm" style={{ color: "#94a3b8" }}>
        Já tem uma conta?{" "}
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

function getErrorMessage(message: string): string {
  if (message.includes("already registered")) {
    return "Este email já está cadastrado";
  }
  if (message.includes("Password")) {
    return "A senha deve ter pelo menos 6 caracteres";
  }
  return "Erro ao criar conta. Tente novamente";
}
