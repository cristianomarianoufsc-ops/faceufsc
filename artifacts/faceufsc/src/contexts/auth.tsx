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
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateAvatar: (avatarUrl: string) => void;
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/auth/me`, { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(data => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const r = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || "Erro ao entrar");
    setUser(data);
  }

  async function register(data: RegisterData) {
    const r = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const body = await r.json();
    if (!r.ok) throw new Error(body.error || "Erro ao cadastrar");
    setUser(body);
  }

  async function logout() {
    await fetch(`${API_BASE}/api/auth/logout`, { method: "POST", credentials: "include" });
    setUser(null);
  }

  function updateAvatar(avatarUrl: string) {
    setUser(prev => prev ? { ...prev, avatarUrl } : prev);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateAvatar }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
