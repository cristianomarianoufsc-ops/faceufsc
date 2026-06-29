import { useState, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

export default function Admin() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const [emailVerification, setEmailVerification] = useState(true);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setAuthError("");
    try {
      const res = await fetch(`${API_BASE}/api/admin/settings`, {
        headers: { "x-admin-password": password },
      });
      if (res.status === 401) {
        setAuthError("Senha incorreta.");
        return;
      }
      const data = await res.json();
      setEmailVerification(data.email_verification_enabled);
      setAuthenticated(true);
    } catch {
      setAuthError("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle(value: boolean) {
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch(`${API_BASE}/api/admin/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({ email_verification_enabled: value }),
      });
      if (!res.ok) throw new Error("Falha ao salvar");
      const data = await res.json();
      setEmailVerification(data.email_verification_enabled);
      setFeedback({ type: "success", message: value ? "Verificação de e-mail ativada." : "Verificação de e-mail desativada. Novos cadastros entram direto." });
    } catch {
      setFeedback({ type: "error", message: "Erro ao salvar configuração." });
    } finally {
      setSaving(false);
    }
  }

  if (!authenticated) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="mb-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-950 mb-4">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Painel Admin</h1>
            <p className="text-sm text-gray-500 mt-1">FaceUFSC</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha de administrador</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-950 focus:border-transparent"
                placeholder="••••••••"
                required
                autoFocus
              />
            </div>
            {authError && (
              <p className="text-sm text-red-600">{authError}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-950 text-white rounded-lg text-sm font-semibold hover:bg-blue-900 disabled:opacity-50 transition-colors"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-950 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900">Painel Admin</h1>
            <p className="text-xs text-gray-400">FaceUFSC</p>
          </div>
        </div>
        <button
          onClick={() => { setAuthenticated(false); setPassword(""); }}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          Sair
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Configurações de cadastro</h2>
          <p className="text-sm text-gray-500 mt-1">Controle o fluxo de criação de contas.</p>
        </div>

        {feedback && (
          <div className={`rounded-lg px-4 py-3 text-sm font-medium ${
            feedback.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"
          }`}>
            {feedback.message}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900">Verificação de e-mail no cadastro</h3>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                {emailVerification
                  ? "Ativada — novos usuários recebem um e-mail de confirmação antes de acessar a plataforma."
                  : "Desativada — novos usuários entram direto após preencher o formulário, sem confirmar o e-mail."}
              </p>
            </div>
            <button
              onClick={() => handleToggle(!emailVerification)}
              disabled={saving}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-50 ${
                emailVerification ? "bg-blue-950" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  emailVerification ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Status atual:{" "}
              <span className={`font-semibold ${emailVerification ? "text-blue-900" : "text-gray-600"}`}>
                {emailVerification ? "Verificação obrigatória" : "Acesso imediato"}
              </span>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
