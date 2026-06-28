---
name: Railway + Vercel Deploy Config
description: Como está configurado o deploy do FaceUFSC (API no Railway, frontend no Vercel)
---

## Regra
API no Railway, frontend no Vercel. Frontend deve chamar Railway diretamente — nunca via proxy Vercel.

**Why:** O proxy do Vercel (`rewrites` no `vercel.json`) remove headers críticos como `Set-Cookie`. Requests cross-origin diretos funcionam corretamente com CORS configurado.

**How to apply:**
- `artifacts/faceufsc/.env.production` define `VITE_API_BASE_URL=https://workspaceapi-server-production-f50d.up.railway.app`
- `vercel.json` contém apenas o SPA rewrite (`/* → /index.html`), sem proxy de API
- `app.ts` no api-server tem CORS configurado para aceitar `*.vercel.app`, `*.replit.app`, `*.replit.dev`, `localhost`
- Se a URL do Railway mudar (serviço recriado), atualizar `.env.production` e fazer push
- Railway env vars obrigatórias: `DATABASE_URL`, `SESSION_SECRET`
