import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { validateEmail } from "@/lib/validation/email";

interface RegisterFormProps {
  onSuccess?: (email: string) => void;
  onLogin: () => void;
}

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export function RegisterForm({ onSuccess, onLogin }: RegisterFormProps) {
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState(false);
  const [touched, setTouched] = useState<{
    email: boolean;
    password: boolean;
    confirmPassword: boolean;
  }>({
    email: false,
    password: false,
    confirmPassword: false,
  });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // Validate email
    if (!email) {
      newErrors.email = "Email é obrigatório";
      isValid = false;
    } else {
      const emailValidation = validateEmail(email);
      if (!emailValidation.valid) {
        newErrors.email = emailValidation.message || "Email inválido";
        isValid = false;
      }
    }

    // Validate password
    if (!password) {
      newErrors.password = "Senha é obrigatória";
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = "A senha deve ter pelo menos 6 caracteres";
      isValid = false;
    }

    // Validate confirm password
    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirme sua senha";
      isValid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "As senhas não coincidem";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);

    // Validate email in real-time if field has been touched
    if (touched.email && value) {
      const validation = validateEmail(value);
      setErrors((prev) => ({
        ...prev,
        email: validation.valid ? undefined : validation.message,
      }));
    } else if (touched.email && !value) {
      setErrors((prev) => ({
        ...prev,
        email: "Email é obrigatório",
      }));
    } else {
      // Clear email error when user starts typing
      setErrors((prev) => ({
        ...prev,
        email: undefined,
      }));
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);

    // Validate password in real-time if field has been touched
    if (touched.password) {
      if (!value) {
        setErrors((prev) => ({
          ...prev,
          password: "Senha é obrigatória",
        }));
      } else if (value.length < 6) {
        setErrors((prev) => ({
          ...prev,
          password: "A senha deve ter pelo menos 6 caracteres",
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          password: undefined,
        }));
      }
    }

    // Re-validate confirm password if it has been touched
    if (touched.confirmPassword && confirmPassword) {
      if (value !== confirmPassword) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: "As senhas não coincidem",
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: undefined,
        }));
      }
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);

    // Validate confirm password in real-time if field has been touched
    if (touched.confirmPassword) {
      if (!value) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: "Confirme sua senha",
        }));
      } else if (password !== value) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: "As senhas não coincidem",
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: undefined,
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      email: true,
      password: true,
      confirmPassword: true,
    });

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    const { error } = await signUp(email, password);

    setLoading(false);

    if (error) {
      setErrors({ general: getErrorMessage(error.message) });
    } else {
      if (onSuccess) {
        onSuccess(email.trim().toLowerCase());
      } else {
        setSuccess(true);
      }
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
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
          onChange={(e) => handleEmailChange(e.target.value)}
          onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
          required
          autoComplete="email"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "register-email-error" : undefined}
          className="w-full px-4 py-2.5 rounded-xl border outline-none transition-colors"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            borderColor: errors.email
              ? "#ef4444"
              : touched.email && email && !errors.email
              ? "#22c55e"
              : "rgba(211, 158, 23, 0.2)",
            color: "#f1f5f9",
          }}
          onFocus={(e) =>
            (e.currentTarget.style.borderColor = errors.email
              ? "#ef4444"
              : "rgba(211, 158, 23, 0.5)")
          }
        />
        {errors.email && (
          <p
            id="register-email-error"
            className="text-sm mt-1"
            style={{ color: "#ef4444" }}
            role="alert"
          >
            {errors.email}
          </p>
        )}
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
          onChange={(e) => handlePasswordChange(e.target.value)}
          onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
          required
          autoComplete="new-password"
          minLength={6}
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? "register-password-error" : undefined}
          className="w-full px-4 py-2.5 rounded-xl border outline-none transition-colors"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            borderColor: errors.password
              ? "#ef4444"
              : touched.password && password && !errors.password
              ? "#22c55e"
              : "rgba(211, 158, 23, 0.2)",
            color: "#f1f5f9",
          }}
          onFocus={(e) =>
            (e.currentTarget.style.borderColor = errors.password
              ? "#ef4444"
              : "rgba(211, 158, 23, 0.5)")
          }
        />
        {errors.password && (
          <p
            id="register-password-error"
            className="text-sm mt-1"
            style={{ color: "#ef4444" }}
            role="alert"
          >
            {errors.password}
          </p>
        )}
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
          onChange={(e) => handleConfirmPasswordChange(e.target.value)}
          onBlur={() => setTouched((prev) => ({ ...prev, confirmPassword: true }))}
          required
          autoComplete="new-password"
          aria-invalid={!!errors.confirmPassword}
          aria-describedby={
            errors.confirmPassword ? "register-confirm-password-error" : undefined
          }
          className="w-full px-4 py-2.5 rounded-xl border outline-none transition-colors"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            borderColor: errors.confirmPassword
              ? "#ef4444"
              : touched.confirmPassword && confirmPassword && !errors.confirmPassword
              ? "#22c55e"
              : "rgba(211, 158, 23, 0.2)",
            color: "#f1f5f9",
          }}
          onFocus={(e) =>
            (e.currentTarget.style.borderColor = errors.confirmPassword
              ? "#ef4444"
              : "rgba(211, 158, 23, 0.5)")
          }
        />
        {errors.confirmPassword && (
          <p
            id="register-confirm-password-error"
            className="text-sm mt-1"
            style={{ color: "#ef4444" }}
            role="alert"
          >
            {errors.confirmPassword}
          </p>
        )}
      </div>

      {errors.general && (
        <div
          className="px-4 py-3 rounded-lg"
          style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", border: "1px solid #ef4444" }}
          role="alert"
        >
          <p className="text-sm" style={{ color: "#ef4444" }}>
            {errors.general}
          </p>
        </div>
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
  if (message.includes("Serviço de cadastro indisponível")) {
    return "Não foi possível enviar o e-mail de confirmação agora. Tente novamente em instantes.";
  }
  if (message.includes("already registered") || message.includes("já está cadastrado")) {
    return "Este email já está cadastrado";
  }
  if (message.includes("Password") || message.includes("senha")) {
    return "A senha deve ter pelo menos 6 caracteres";
  }
  if (message.includes("invalid") || message.includes("inválido") || message.includes("formato")) {
    return "Insira um endereço de email válido";
  }
  return "Erro ao criar conta. Tente novamente";
}
