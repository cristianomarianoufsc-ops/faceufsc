import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/auth";

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "";

export default function VerifyEmail() {
  const [, setLocation] = useLocation();
  const { loginWithData } = useAuth();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      setStatus("error");
      setErrorMsg("Link de verificação inválido.");
      return;
    }

    fetch(`${API_BASE}/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(async r => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "Erro ao verificar e-mail.");
        return data;
      })
      .then(data => {
        loginWithData(data);
        setStatus("success");
        setTimeout(() => setLocation("/feed"), 1500);
      })
      .catch(err => {
        setStatus("error");
        setErrorMsg(err.message);
      });
  }, []);

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {status === "verifying" && (
          <>
            <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto" />
            <div>
              <h2 className="text-xl font-bold text-foreground">Verificando seu e-mail...</h2>
              <p className="text-muted-foreground text-sm mt-2">Aguarde um momento.</p>
            </div>
          </>
        )}
        {status === "success" && (
          <>
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">E-mail verificado!</h2>
              <p className="text-muted-foreground text-sm mt-2">Sua conta foi criada. Redirecionando...</p>
            </div>
          </>
        )}
        {status === "error" && (
          <>
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mx-auto">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Link inválido ou expirado</h2>
              <p className="text-muted-foreground text-sm mt-2">{errorMsg}</p>
            </div>
            <button
              onClick={() => setLocation("/")}
              className="text-primary underline text-sm"
            >
              Voltar para o início
            </button>
          </>
        )}
      </div>
    </div>
  );
}
