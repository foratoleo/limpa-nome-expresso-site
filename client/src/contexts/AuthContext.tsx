import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User, Session, AuthError } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null; data?: { user?: User; session?: Session } }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null; data?: { user?: User | null; session?: Session | null } }>;
  signInWithMagicLink: (email: string) => Promise<{ error: AuthError | null; success: boolean }>;
  checkUser: (email: string) => Promise<{ success: boolean } | null>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      // Use relative URL or current origin to avoid CORS issues
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const contentType = response.headers.get("content-type") || "";
      let data: any = null;

      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const rawBody = await response.text();
        if (import.meta.env.DEV) {
          console.error("Registration returned non-JSON response:", {
            status: response.status,
            contentType,
            bodyPreview: rawBody.slice(0, 200),
          });
        }

        // API unavailable (common in local dev when backend is down):
        // Do NOT fallback to direct Supabase signup, because registration
        // must go through backend to send custom confirmation template.
        if (response.status >= 500) {
          return {
            error: {
              message: "Serviço de cadastro indisponível. Tente novamente em instantes.",
              name: "ServiceUnavailableError",
              status: response.status,
            } as AuthError,
          };
        }

        return {
          error: {
            message: "Resposta inválida do servidor",
            name: "ServerResponseError",
            status: response.status,
          } as AuthError,
        };
      }

      if (!response.ok || !data.success) {
        // Parse specific error types for better user feedback
        let errorMessage = data.error || "Erro ao criar conta";

        // Log error for debugging (in development)
        if (import.meta.env.DEV) {
          console.log("Registration error:", {
            status: response.status,
            message: errorMessage,
            originalError: data.error,
          });
        }

        // Keep backend as single source for registration to ensure custom email flow.
        if (response.status >= 500) {
          return {
            error: {
              message: "Serviço de cadastro indisponível. Tente novamente em instantes.",
              name: "ServiceUnavailableError",
              status: response.status,
            } as AuthError,
          };
        }

        return {
          error: {
            message: errorMessage,
            name: "AuthError",
            status: response.status,
          } as AuthError,
        };
      }

      // After successful registration, redirect to home or let callback handle it
      // The caller should handle navigation based on their needs
      return { error: null, data: data.data };
    } catch (err) {
      // Log network errors for debugging
      if (import.meta.env.DEV) {
        console.error("Registration network error:", err);
      }

      return {
        error: {
          message: "Erro ao conectar com o servidor de cadastro",
          name: "NetworkError",
        } as AuthError,
      };
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    // Return both error and data to allow caller to handle post-signin actions
    return { error, data };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  };

  const signInWithMagicLink = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      }
    });

    return { error, success: !error };
  };

  const checkUser = async (email: string) => {
    try {
      const response = await fetch("/api/auth/check-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) return null;

      const data = await response.json();
      return data;
    } catch {
      return null;
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithMagicLink,
    checkUser,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useUser(): User | null {
  const { user } = useAuth();
  return user;
}

export function useSession(): Session | null {
  const { session } = useAuth();
  return session;
}
