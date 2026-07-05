# FaceUFSC

Rede social universitária da UFSC — perfis, conexões, comunidades por curso/departamento, feed de posts.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — API server (porta 8080)
- `pnpm --filter @workspace/faceufsc run dev` — Frontend React+Vite
- `pnpm run typecheck` — typecheck completo de todos os pacotes
- `pnpm run build` — typecheck + build todos os pacotes
- `pnpm --filter @workspace/api-spec run codegen` — gerar hooks e schemas Zod do OpenAPI spec
- `pnpm --filter @workspace/db run push` — push do schema para o banco (só dev)
- Env obrigatório: `DATABASE_URL` (Neon PostgreSQL), `SESSION_SECRET` (chave JWT)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL (Neon) + Drizzle ORM
- Auth: JWT (jsonwebtoken) — sem cookies, sem sessão
- Validação: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (a partir do OpenAPI spec)
- Build: esbuild (CJS bundle)
- Frontend: React 19, Vite, Tailwind, shadcn/ui, wouter, TanStack Query

## Where things live

- `artifacts/faceufsc/` — frontend React+Vite (Vercel)
- `artifacts/api-server/` — API Express 5 (Railway)
- `artifacts/faceufsc/src/contexts/auth.tsx` — contexto JWT (token em localStorage)
- `artifacts/faceufsc/src/pages/profile.tsx` — perfil + upload de foto
- `artifacts/api-server/src/lib/jwt.ts` — sign/verify/extract token
- `artifacts/api-server/src/routes/auth.ts` — login, register, logout, /me
- `artifacts/api-server/src/routes/users.ts` — listar, buscar, avatar
- `artifacts/faceufsc/.env.production` — VITE_API_BASE_URL → Railway URL
- `lib/db/` — schema Drizzle + conexão Neon
- `lib/api-client-react/` — hooks gerados por Orval

## Architecture decisions

1. **JWT em vez de cookies de sessão** — Vercel proxy bloqueava `Set-Cookie` do Railway. JWT no `localStorage` + header `Authorization: Bearer` funciona perfeitamente cross-origin. Secret: `SESSION_SECRET` do Railway.
2. **Foto como base64 no banco** — imagem redimensionada para 300×300px e salva como JPEG base64 na coluna `avatarUrl`. Body limit: 5MB.
3. **`.env.production` commitado** — URL pública do Railway está no `.env.production` do frontend. Não é secret.
4. **Monorepo pnpm workspaces** — `lib/db` e `lib/api-client-react` são libs compartilhadas.

## Product

- Cadastro com e-mail institucional UFSC (`@ufsc.br`, `@grad.ufsc.br`, `@posgrad.ufsc.br`, `@servidor.ufsc.br`)
- Perfil com foto, curso, departamento, habilidades
- Upload de foto de perfil (resize automático no browser)
- Listagem de pessoas com busca

## Deployment

- **Frontend:** Vercel (auto-deploy no push para `main`)
  - URL: `https://faceufsc-faceufsc.vercel.app`
  - Build: Vite production, output: `dist/public`
- **API:** Railway (auto-deploy no push para `main`)
  - URL: `https://workspaceapi-server-production-f50d.up.railway.app`
  - Build: esbuild via `build.mjs`

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- `express-session` com `MemoryStore` perde sessões a cada redeploy → JWT resolve isso
- Railway muda URL se o serviço for recriado → atualizar `VITE_API_BASE_URL` em `.env.production`
- Erros TS7030 pré-existentes em `communities.ts`, `events.ts`, `posts.ts` não bloqueiam build (esbuild ignora tipos)
- Se `SESSION_SECRET` não estiver setado no Railway, a app crasha no boot

## Pointers

- Ver `HANDOFF.md` para documentação completa de arquitetura e decisões
- Ver skill `pnpm-workspace` para estrutura do workspace, TypeScript e detalhes dos pacotes
