import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const url = new URL(window.location.href);
        const queryParams = url.searchParams;
        const hashParams = new URLSearchParams(url.hash.startsWith("#") ? url.hash.slice(1) : "");
        const getParam = (key: string) => queryParams.get(key) || hashParams.get(key);

        const accessToken = getParam("access_token");
        const refreshToken = getParam("refresh_token");
        const code = getParam("code");
        const errorCode = getParam("error");
        const errorDescription = getParam("error_description");

        if (errorCode) {
          setStatus("error");
          setError(errorDescription || errorCode);
          return;
        }

        let session = null;

        // PKCE flow (Supabase default for this app): exchange auth code for session.
        if (code) {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            throw exchangeError;
          }
          session = data.session;
        } else if (accessToken && refreshToken) {
          // Legacy/implicit flow fallback when tokens are returned directly.
          const { data, error: setSessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (setSessionError) {
            throw setSessionError;
          }
          session = data.session;
        } else {
          const { data } = await supabase.auth.getSession();
          session = data.session;
        }

        if (!session) {
          setStatus("error");
          setError("Nao foi possivel criar sessao. Solicite um novo link de confirmacao.");
          return;
        }

        // Remove sensitive query/hash params from URL.
        window.history.replaceState({}, document.title, "/auth/callback");
        setStatus("success");

        setTimeout(() => {
          setLocation("/bem-vindo");
        }, 1000);
      } catch (err) {
        setStatus("error");
        setError("Falha ao processar login");
      }
    };

    handleCallback();
  }, [setLocation]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#12110d" }}>
        <div className="text-center">
          <div className="animate-spin mb-4" style={{ color: "#d39e17" }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" strokeDasharray="60" strokeDashoffset="20" />
            </svg>
          </div>
          <p style={{ color: "#94a3b8" }}>Processando login...</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#12110d" }}>
        <div className="text-center max-w-md">
          <div className="mb-4">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: "#f1f5f9" }}>
            Erro no login
          </h2>
          <p className="mb-6" style={{ color: "#94a3b8" }}>
            {error || "Não foi possível processar seu login. O link pode ter expirado."}
          </p>
          <button
            onClick={() => setLocation("/")}
            className="px-6 py-2 rounded-xl font-medium"
            style={{ backgroundColor: "#d39e17", color: "#12110d" }}
          >
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#12110d" }}>
      <div className="text-center">
        <div className="mb-4">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h2 className="text-xl font-bold mb-2" style={{ color: "#f1f5f9" }}>
          Login realizado!
        </h2>
        <p style={{ color: "#94a3b8" }}>Redirecionando...</p>
      </div>
    </div>
  );
}
