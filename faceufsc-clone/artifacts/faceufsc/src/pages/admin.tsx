import { useState, useEffect, useCallback } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

type User = {
  id: number;
  name: string;
  email: string;
  course: string;
  department: string;
  role: string;
  entryYear: number;
  createdAt: string;
};

type Post = {
  id: number;
  content: string;
  authorId: number;
  authorName: string;
  authorCourse: string;
  communityName?: string | null;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  orphaned: boolean;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function Admin() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [emailVerification, setEmailVerification] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsFeedback, setSettingsFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const [confirmDeleteUser, setConfirmDeleteUser] = useState<User | null>(null);

  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState<number | null>(null);
  const [confirmDeletePost, setConfirmDeletePost] = useState<Post | null>(null);

  const [tab, setTab] = useState<"settings" | "users" | "posts">("settings");

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/users`, { headers: { "x-admin-password": password } });
      const data = await res.json();
      setUsers(data.users || []);
    } catch { setUsers([]); }
    finally { setUsersLoading(false); }
  }, [password]);

  const fetchPosts = useCallback(async () => {
    setPostsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/posts`, { headers: { "x-admin-password": password } });
      const data = await res.json();
      setPosts(data.posts || []);
    } catch { setPosts([]); }
    finally { setPostsLoading(false); }
  }, [password]);

  useEffect(() => {
    if (authenticated && tab === "users") fetchUsers();
    if (authenticated && tab === "posts") fetchPosts();
  }, [authenticated, tab, fetchUsers, fetchPosts]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    try {
      const res = await fetch(`${API_BASE}/api/admin/settings`, { headers: { "x-admin-password": password } });
      if (res.status === 401) { setAuthError("Senha incorreta."); return; }
      const data = await res.json();
      setEmailVerification(data.email_verification_enabled);
      setAuthenticated(true);
    } catch { setAuthError("Erro ao conectar com o servidor."); }
    finally { setAuthLoading(false); }
  }

  async function handleToggle(value: boolean) {
    setSavingSettings(true);
    setSettingsFeedback(null);
    try {
      const res = await fetch(`${API_BASE}/api/admin/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-password": password },
        body: JSON.stringify({ email_verification_enabled: value }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setEmailVerification(data.email_verification_enabled);
      setSettingsFeedback({
        type: "success",
        message: value ? "Verificação de e-mail ativada." : "Verificação desativada. Novos cadastros entram direto.",
      });
    } catch { setSettingsFeedback({ type: "error", message: "Erro ao salvar." }); }
    finally { setSavingSettings(false); }
  }

  async function handleDeleteUser(user: User) {
    setDeletingUserId(user.id);
    try {
      await fetch(`${API_BASE}/api/admin/users/${user.id}`, { method: "DELETE", headers: { "x-admin-password": password } });
      setUsers(prev => prev.filter(u => u.id !== user.id));
    } finally { setDeletingUserId(null); setConfirmDeleteUser(null); }
  }

  async function handleDeletePost(post: Post) {
    setDeletingPostId(post.id);
    try {
      await fetch(`${API_BASE}/api/admin/posts/${post.id}`, { method: "DELETE", headers: { "x-admin-password": password } });
      setPosts(prev => prev.filter(p => p.id !== post.id));
    } finally { setDeletingPostId(null); setConfirmDeletePost(null); }
  }

  const filteredUsers = users.filter(u =>
    `${u.name} ${u.email} ${u.course} ${u.department}`.toLowerCase().includes(userSearch.toLowerCase())
  );

  const orphanedCount = posts.filter(p => p.orphaned).length;

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
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-950"
                placeholder="••••••••" required autoFocus />
            </div>
            {authError && <p className="text-sm text-red-600">{authError}</p>}
            <button type="submit" disabled={authLoading}
              className="w-full py-2.5 bg-blue-950 text-white rounded-lg text-sm font-semibold hover:bg-blue-900 disabled:opacity-50 transition-colors">
              {authLoading ? "Entrando..." : "Entrar"}
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
        <button onClick={() => { setAuthenticated(false); setPassword(""); }} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
          Sair
        </button>
      </header>

      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex gap-6">
          {(["settings", "users", "posts"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`py-3 text-sm font-medium border-b-2 transition-colors relative ${tab === t ? "border-blue-950 text-blue-950" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
              {t === "settings" && "Configurações"}
              {t === "users" && `Inscritos${users.length ? ` (${users.length})` : ""}`}
              {t === "posts" && (
                <>
                  Publicações{posts.length ? ` (${posts.length})` : ""}
                  {orphanedCount > 0 && tab !== "posts" && (
                    <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold">{orphanedCount}</span>
                  )}
                </>
              )}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">

        {/* Settings Tab */}
        {tab === "settings" && (
          <>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Configurações de cadastro</h2>
              <p className="text-sm text-gray-500 mt-1">Controle o fluxo de criação de contas.</p>
            </div>
            {settingsFeedback && (
              <div className={`rounded-lg px-4 py-3 text-sm font-medium ${settingsFeedback.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
                {settingsFeedback.message}
              </div>
            )}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900">Verificação de e-mail no cadastro</h3>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                    {emailVerification
                      ? "Ativada — novos usuários recebem um e-mail de confirmação antes de acessar a plataforma."
                      : "Desativada — novos usuários entram direto após preencher o formulário."}
                  </p>
                </div>
                <button onClick={() => handleToggle(!emailVerification)} disabled={savingSettings}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-50 ${emailVerification ? "bg-blue-950" : "bg-gray-300"}`}>
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${emailVerification ? "translate-x-5" : "translate-x-0"}`} />
                </button>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400">Status: <span className={`font-semibold ${emailVerification ? "text-blue-900" : "text-gray-600"}`}>{emailVerification ? "Verificação obrigatória" : "Acesso imediato"}</span></p>
              </div>
            </div>
          </>
        )}

        {/* Users Tab */}
        {tab === "users" && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Inscritos</h2>
                <p className="text-sm text-gray-500 mt-1">{users.length} usuário{users.length !== 1 ? "s" : ""} cadastrado{users.length !== 1 ? "s" : ""}.</p>
              </div>
              <button onClick={fetchUsers} className="text-xs text-gray-400 hover:text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors">Atualizar</button>
            </div>
            <input type="text" value={userSearch} onChange={e => setUserSearch(e.target.value)}
              placeholder="Buscar por nome, e-mail, curso..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-950" />
            {usersLoading ? (
              <div className="flex justify-center py-12"><div className="h-8 w-8 rounded-full border-4 border-blue-950 border-t-transparent animate-spin" /></div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">{userSearch ? "Nenhum usuário encontrado." : "Nenhum inscrito ainda."}</div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nome</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Curso / Vínculo</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Cadastro</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredUsers.map(user => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <p className="text-gray-700">{user.course}</p>
                          <p className="text-xs text-gray-400 capitalize">{user.role} · {user.entryYear}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{formatDate(user.createdAt)}</td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => setConfirmDeleteUser(user)}
                            className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors px-2 py-1 rounded hover:bg-red-50">
                            Excluir
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Posts Tab */}
        {tab === "posts" && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Publicações</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {posts.length} publicaç{posts.length !== 1 ? "ões" : "ão"} no total
                  {orphanedCount > 0 && <span className="ml-2 text-red-500 font-medium">· {orphanedCount} órfã{orphanedCount !== 1 ? "s" : ""} (autor deletado)</span>}
                </p>
              </div>
              <button onClick={fetchPosts} className="text-xs text-gray-400 hover:text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors">Atualizar</button>
            </div>
            {orphanedCount > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
                <strong>⚠ {orphanedCount} publicaç{orphanedCount !== 1 ? "ões" : "ão"} órfã{orphanedCount !== 1 ? "s" : ""}:</strong> o autor foi deletado, mas o post ficou. Você pode excluí-{orphanedCount !== 1 ? "los" : "lo"} abaixo.
              </div>
            )}
            {postsLoading ? (
              <div className="flex justify-center py-12"><div className="h-8 w-8 rounded-full border-4 border-blue-950 border-t-transparent animate-spin" /></div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">Nenhuma publicação ainda.</div>
            ) : (
              <div className="space-y-3">
                {posts.map(post => (
                  <div key={post.id} className={`bg-white rounded-2xl border p-4 ${post.orphaned ? "border-red-200 bg-red-50/30" : "border-gray-200"}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-gray-900">{post.authorName}</span>
                          <span className="text-xs text-gray-400">{post.authorCourse}</span>
                          {post.orphaned && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">conta deletada</span>
                          )}
                          {post.communityName && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">{post.communityName}</span>
                          )}
                        </div>
                        <p className="mt-2 text-sm text-gray-700 line-clamp-3">{post.content}</p>
                        <p className="mt-2 text-xs text-gray-400">{formatDate(post.createdAt)} · {post.likesCount} curtida{post.likesCount !== 1 ? "s" : ""} · {post.commentsCount} comentário{post.commentsCount !== 1 ? "s" : ""}</p>
                      </div>
                      <button onClick={() => setConfirmDeletePost(post)}
                        className="flex-shrink-0 text-xs text-red-500 hover:text-red-700 font-medium transition-colors px-2 py-1 rounded hover:bg-red-50">
                        Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal excluir usuário */}
      {confirmDeleteUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-base font-bold text-gray-900">Excluir inscrito</h3>
            <p className="text-sm text-gray-500 mt-2">Tem certeza que deseja excluir <strong>{confirmDeleteUser.name}</strong>? Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setConfirmDeleteUser(null)} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">Cancelar</button>
              <button onClick={() => handleDeleteUser(confirmDeleteUser)} disabled={deletingUserId === confirmDeleteUser.id}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors">
                {deletingUserId === confirmDeleteUser.id ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal excluir post */}
      {confirmDeletePost && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-base font-bold text-gray-900">Excluir publicação</h3>
            <p className="text-sm text-gray-500 mt-2">Excluir o post de <strong>{confirmDeletePost.authorName}</strong>? Esta ação não pode ser desfeita.</p>
            <div className="mt-3 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600 line-clamp-3 italic">"{confirmDeletePost.content}"</div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setConfirmDeletePost(null)} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">Cancelar</button>
              <button onClick={() => handleDeletePost(confirmDeletePost)} disabled={deletingPostId === confirmDeletePost.id}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors">
                {deletingPostId === confirmDeletePost.id ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
