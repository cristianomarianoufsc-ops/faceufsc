# FaceUFSC — Documento de Handoff

> Rede social universitária da UFSC. Permite que alunos, professores e servidores criem perfil, se conectem e participem de comunidades por curso/departamento.

---

## Arquitetura

```
Browser (Vercel)              API (Railway)           Banco (Neon/PostgreSQL)
faceufsc-faceufsc.vercel.app  ─── HTTPS ───►  workspaceapi-server-...railway.app  ──►  Neon DB
      React + Vite                            Express 5 + Drizzle ORM
```

### Por que essa separação?
- Frontend estático → Vercel (CDN global, builds automáticos por push)
- API com estado → Railway (Node.js always-on, variáveis de ambiente seguras)
- Banco gerenciado → Neon (PostgreSQL serverless, sem manutenção)

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS, shadcn/ui |
| Roteamento | wouter |
| Estado/Cache | TanStack Query (React Query) |
| Backend | Express 5, Node.js 24 |
| ORM | Drizzle ORM |
| Banco | PostgreSQL (Neon) |
| Auth | JWT (jsonwebtoken) — **sem cookies, sem sessão** |
| Validação | Zod v4 |
| Monorepo | pnpm workspaces |

---

## Estrutura do Repositório

```
/
├── artifacts/
│   ├── faceufsc/          # Frontend React+Vite
│   │   ├── src/
│   │   │   ├── contexts/auth.tsx    ← contexto global de autenticação (JWT)
│   │   │   ├── pages/
│   │   │   │   ├── landing.tsx      ← página pública / login
│   │   │   │   ├── feed.tsx         ← feed de posts
│   │   │   │   ├── profile.tsx      ← perfil + upload de foto
│   │   │   │   └── ...
│   │   │   └── components/
│   │   ├── .env.production          ← VITE_API_BASE_URL → Railway URL
│   │   └── vercel.json              ← SPA rewrite only (sem proxy)
│   │
│   └── api-server/        # Backend Express 5
│       └── src/
│           ├── app.ts               ← CORS, body parser (5mb), sem session
│           ├── lib/
│           │   └── jwt.ts           ← signToken / verifyToken / extractToken
│           └── routes/
│               ├── auth.ts          ← POST /login, /register, /logout, GET /me
│               └── users.ts         ← GET /users, GET /users/:id, PATCH /me/avatar
│
└── lib/
    ├── db/                # Schema Drizzle + conexão Neon
    └── api-client-react/  # Hooks gerados por Orval (OpenAPI)
```

---

## Autenticação — Como Funciona (JWT)

**Decisão chave:** Usar JWT em vez de cookies de sessão.

**Motivo:** O stack Vercel + Railway tem um problema fundamental com cookies cross-origin:
- O Vercel proxy removia o header `Set-Cookie` das respostas do Railway
- `SameSite=None` com cookies requer requisitos específicos de browser que falhavam na prática
- JWTs são stateless, armazenados no `localStorage`, enviados via header `Authorization: Bearer`

**Fluxo:**
```
1. POST /api/auth/login  →  Railway retorna { token, ...user }
2. Frontend salva token no localStorage
3. Toda requisição protegida envia: Authorization: Bearer <token>
4. Railway verifica o token via jwt.verify()
5. Logout: apenas remove o token do localStorage (nada no servidor)
```

**Secret:** O `SESSION_SECRET` configurado no Railway é usado como chave JWT.

---

## Variáveis de Ambiente

### Railway (API Server)
| Variável | Descrição |
|---|---|
| `DATABASE_URL` | Connection string do Neon PostgreSQL |
| `SESSION_SECRET` | Chave secreta usada para assinar os JWTs |
| `PORT` | Atribuído automaticamente pelo Railway |

### Vercel (Frontend)
| Variável | Descrição |
|---|---|
| `VITE_API_BASE_URL` | URL completa do Railway API (definida em `.env.production`) |

> ⚠️ O `.env.production` já está commitado com a URL do Railway. Se a URL mudar (novo deploy Railway), atualize esse arquivo e faça novo push.

---

## Como Rodar Localmente

```bash
# 1. Instalar dependências
pnpm install

# 2. Subir API (porta 8080)
pnpm --filter @workspace/api-server run dev

# 3. Subir Frontend (porta dinâmica)
pnpm --filter @workspace/faceufsc run dev

# 4. Push de schema no banco de dev
pnpm --filter @workspace/db run push

# 5. Gerar hooks de API (quando mudar o OpenAPI spec)
pnpm --filter @workspace/api-spec run codegen
```

---

## Deploy

### Railway (API)
- Conectado ao repositório GitHub (branch `main`)
- Deploya automaticamente a cada push
- Build command: `pnpm --filter @workspace/api-server run build`
- Start command: `pnpm --filter @workspace/api-server run start`

### Vercel (Frontend)
- Conectado ao repositório GitHub (branch `main`)
- Deploya automaticamente a cada push
- Build: Vite em modo production (usa `.env.production`)
- Output dir: `dist/public`

---

## Endpoints da API

| Método | Rota | Auth? | Descrição |
|---|---|---|---|
| POST | `/api/auth/register` | ❌ | Cadastro (e-mail @ufsc.br obrigatório) |
| POST | `/api/auth/login` | ❌ | Login → retorna JWT |
| POST | `/api/auth/logout` | ❌ | (client-side: apaga token) |
| GET | `/api/auth/me` | ✅ | Dados do usuário logado |
| GET | `/api/users` | ❌ | Listar usuários (search, course) |
| GET | `/api/users/:id` | ❌ | Perfil de um usuário |
| PATCH | `/api/users/me/avatar` | ✅ | Atualizar foto de perfil (base64 JPEG) |

---

## Decisões de Arquitetura

1. **JWT em vez de cookies de sessão** — eliminação de problemas cross-origin entre Vercel e Railway. Token salvo no `localStorage`, enviado como `Authorization: Bearer`. Secret: reutiliza `SESSION_SECRET` do Railway.

2. **Foto de perfil como base64 no banco** — upload redimensiona a imagem para 300×300 e salva como JPEG base64 direto na coluna `avatarUrl`. Simples, sem dependência de bucket de storage. Limite: 5MB no body parser do Express.

3. **`.env.production` commitado** — a URL da API Railway está no `.env.production` do frontend. Não é um secret (URL pública), mas deve ser atualizada se o serviço Railway mudar de URL.

4. **Monorepo pnpm workspaces** — `lib/db` e `lib/api-client-react` são pacotes compartilhados. A API usa `@workspace/db` diretamente. O frontend usa os hooks gerados por Orval.

---

## Problemas Conhecidos / Gotchas

- `express-session` com `MemoryStore` perde todas as sessões a cada redeploy → razão para migrar para JWT
- O Railway pode mudar a URL do serviço se for recriado — atualizar `VITE_API_BASE_URL` no `.env.production`
- O e-mail de cadastro precisa terminar em `@ufsc.br`, `@grad.ufsc.br`, `@posgrad.ufsc.br` ou `@servidor.ufsc.br`
- Erros TypeScript pré-existentes em `communities.ts`, `events.ts`, `posts.ts` (TS7030) não bloqueiam o build do Railway (esbuild não faz typecheck)

---

## Próximos Passos Sugeridos

- [ ] Edição de bio e habilidades no perfil
- [ ] Sistema de conexões entre usuários
- [ ] Feed de posts funcional (criação e listagem)
- [ ] Comunidades por curso/departamento
- [ ] Notificações em tempo real (WebSocket ou polling)
- [ ] Persistência de sessão PostgreSQL (connect-pg-simple) para invalidar tokens

---

*Última atualização: Junho 2026*
