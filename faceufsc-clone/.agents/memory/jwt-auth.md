---
name: JWT Auth Decision
description: Por que usamos JWT em vez de express-session cookies no FaceUFSC
---

## Regra
Usar JWT (jsonwebtoken) para autenticação — token em `localStorage`, enviado como `Authorization: Bearer <token>`.

**Why:** Vercel proxy remove o header `Set-Cookie` de respostas upstream (Railway), então cookies de sessão nunca chegam ao browser. Além disso, `express-session` com `MemoryStore` perde todas as sessões a cada redeploy no Railway.

**How to apply:**
- `lib/jwt.ts` em `api-server/src/lib/jwt.ts`: `signToken(userId)`, `verifyToken(token)`, `extractToken(authHeader)`
- Secret: reutiliza `SESSION_SECRET` do Railway
- Rotas protegidas: leem `Authorization` header, verificam com `verifyToken`
- Frontend: salva token no `localStorage` com chave `faceufsc_token`, envia em cada fetch protegido
- Logout: apenas remove do `localStorage` (stateless, nada no servidor)
