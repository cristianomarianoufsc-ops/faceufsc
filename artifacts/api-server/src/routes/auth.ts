import { Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { db } from "@workspace/db";
import { usersTable, emailVerificationsTable } from "@workspace/db";
import { eq, lt } from "drizzle-orm";
import { signToken, verifyToken, extractToken } from "../lib/jwt";

const router = Router();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const ALLOWED_DOMAINS = ["@ufsc.br", "@grad.ufsc.br", "@posgrad.ufsc.br", "@servidor.ufsc.br"];
const VERIFY_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

function getAppUrl(req: import("express").Request): string {
  const origin = req.headers.origin as string | undefined;
  if (origin) return origin;
  const host = req.headers.host ?? "localhost";
  const proto = req.headers["x-forwarded-proto"] ?? "http";
  return `${proto}://${host}`;
}

router.post("/auth/register", async (req, res): Promise<void> => {
  try {
    const { name, email, password, course, department, entryYear, role } = req.body;

    if (!name || !email || !password || !course || !department || !entryYear) {
      res.status(400).json({ error: "Todos os campos obrigatórios devem ser preenchidos." });
      return;
    }

    if (!ALLOWED_DOMAINS.some(d => email.endsWith(d))) {
      res.status(400).json({ error: "Use um e-mail institucional da UFSC (@ufsc.br, @grad.ufsc.br, etc)." });
      return;
    }

    const [existing] = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.email, email));
    if (existing) {
      res.status(409).json({ error: "Este e-mail já está cadastrado." });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await db.delete(emailVerificationsTable).where(eq(emailVerificationsTable.email, email));

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + VERIFY_TOKEN_TTL_MS);

    await db.insert(emailVerificationsTable).values({
      token,
      email,
      pendingData: { name, email, passwordHash, course, department, entryYear: parseInt(entryYear), role: role || "student" },
      expiresAt,
    });

    const appUrl = getAppUrl(req);
    const verifyUrl = `${appUrl}/verify-email?token=${token}`;

    await transporter.sendMail({
      from: `"FaceUFSC" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Confirme seu e-mail — FaceUFSC",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #f8f9fa; border-radius: 12px;">
          <h1 style="color: #003366; font-size: 28px; margin-bottom: 8px;">FaceUFSC</h1>
          <p style="color: #333; font-size: 16px; margin-bottom: 24px;">
            Olá, <strong>${name}</strong>! Para concluir seu cadastro, confirme seu e-mail clicando no botão abaixo.
          </p>
          <a href="${verifyUrl}"
             style="display: inline-block; background: #003366; color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 15px; font-weight: 600;">
            Confirmar e-mail
          </a>
          <p style="color: #666; font-size: 13px; margin-top: 24px;">
            Este link expira em 24 horas. Se você não solicitou o cadastro, ignore este email.
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 8px;">
            Ou copie e cole no navegador:<br/>
            <span style="word-break: break-all;">${verifyUrl}</span>
          </p>
        </div>
      `,
    });

    res.status(202).json({ message: "E-mail de verificação enviado. Verifique sua caixa de entrada." });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

router.get("/auth/verify-email", async (req, res): Promise<void> => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== "string") {
      res.status(400).json({ error: "Token inválido." });
      return;
    }

    await db.delete(emailVerificationsTable).where(lt(emailVerificationsTable.expiresAt, new Date()));

    const [verification] = await db.select().from(emailVerificationsTable).where(eq(emailVerificationsTable.token, token));

    if (!verification) {
      res.status(400).json({ error: "Link de verificação inválido ou expirado." });
      return;
    }

    const pending = verification.pendingData as {
      name: string; email: string; passwordHash: string;
      course: string; department: string; entryYear: number; role: string;
    };

    const [existing] = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.email, pending.email));
    if (existing) {
      await db.delete(emailVerificationsTable).where(eq(emailVerificationsTable.token, token));
      res.status(409).json({ error: "Este e-mail já está cadastrado." });
      return;
    }

    const [user] = await db.insert(usersTable).values({
      name: pending.name,
      email: pending.email,
      passwordHash: pending.passwordHash,
      course: pending.course,
      department: pending.department,
      entryYear: pending.entryYear,
      role: pending.role,
      skills: "[]",
      connectionsCount: 0,
      communitiesCount: 0,
    }).returning();

    await db.delete(emailVerificationsTable).where(eq(emailVerificationsTable.token, token));

    const jwtToken = signToken(user.id);

    res.status(201).json({
      token: jwtToken,
      id: user.id,
      name: user.name,
      email: user.email,
      course: user.course,
      department: user.department,
      role: user.role,
      entryYear: user.entryYear,
      skills: [],
      connectionsCount: 0,
      communitiesCount: 0,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

router.post("/auth/login", async (req, res): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "E-mail e senha são obrigatórios." });
      return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (!user) {
      res.status(401).json({ error: "E-mail ou senha incorretos." });
      return;
    }

    if (!user.passwordHash) {
      res.status(401).json({ error: "Conta sem senha cadastrada. Redefina sua senha." });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "E-mail ou senha incorretos." });
      return;
    }

    const token = signToken(user.id);

    res.json({
      token,
      id: user.id,
      name: user.name,
      email: user.email,
      course: user.course,
      department: user.department,
      role: user.role,
      entryYear: user.entryYear,
      avatarUrl: user.avatarUrl,
      skills: JSON.parse(user.skills || "[]"),
      connectionsCount: user.connectionsCount,
      communitiesCount: user.communitiesCount,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

router.post("/auth/logout", (_req, res): void => {
  res.json({ ok: true });
});

router.get("/auth/me", async (req, res): Promise<void> => {
  try {
    const token = extractToken(req.headers.authorization);
    if (!token) {
      res.status(401).json({ error: "Não autenticado." });
      return;
    }

    const payload = verifyToken(token);
    if (!payload) {
      res.status(401).json({ error: "Token inválido." });
      return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, payload.userId));
    if (!user) {
      res.status(401).json({ error: "Usuário não encontrado." });
      return;
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      course: user.course,
      department: user.department,
      role: user.role,
      entryYear: user.entryYear,
      avatarUrl: user.avatarUrl,
      skills: JSON.parse(user.skills || "[]"),
      connectionsCount: user.connectionsCount,
      communitiesCount: user.communitiesCount,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

export default router;
