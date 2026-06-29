import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  course: string;
  department: string;
  role: string;
  entryYear: number;
  avatarUrl?: string | null;
  skills: string[];
  connectionsCount: number;
  communitiesCount: number;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<{ pendingVerification: true; email: string }>;
  logout: () => Promise<void>;
  updateAvatar: (avatarUrl: string) => void;
  loginWithData: (data: AuthUser & { token: string }) => void;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  course: string;
  department: string;
  entryYear: string;
  role: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "";
const TOKEN_KEY = "faceufsc_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) { setLoading(false); return; }
    fetch(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${stored}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const r = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || "Erro ao entrar");
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data);
  }

  async function register(data: RegisterData): Promise<{ pendingVerification: true; email: string }> {
    const r = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const body = await r.json();
    if (!r.ok) throw new Error(body.error || "Erro ao cadastrar");
    return { pendingVerification: true, email: data.email };
  }

  function loginWithData(data: AuthUser & { token: string }) {
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data);
  }

  async function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }

  function updateAvatar(avatarUrl: string) {
    setUser(prev => prev ? { ...prev, avatarUrl } : prev);
  }

  return (
    <AuthContext.Provider value={{ user, loading, token, login, register, logout, updateAvatar, loginWithData }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
