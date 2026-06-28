import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { signToken, verifyToken, extractToken } from "../lib/jwt";

const router = Router();

router.post("/auth/register", async (req, res): Promise<void> => {
  try {
    const { name, email, password, course, department, entryYear, role } = req.body;

    if (!name || !email || !password || !course || !department || !entryYear) {
      res.status(400).json({ error: "Todos os campos obrigatórios devem ser preenchidos." });
      return;
    }

    const allowedDomains = ["@ufsc.br", "@grad.ufsc.br", "@posgrad.ufsc.br", "@servidor.ufsc.br"];
    if (!allowedDomains.some(d => email.endsWith(d))) {
      res.status(400).json({ error: "Use um e-mail institucional da UFSC (@ufsc.br, @grad.ufsc.br, etc)." });
      return;
    }

    const [existing] = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.email, email));
    if (existing) {
      res.status(409).json({ error: "Este e-mail já está cadastrado." });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [user] = await db.insert(usersTable).values({
      name,
      email,
      passwordHash,
      course,
      department,
      entryYear: parseInt(entryYear),
      role: role || "student",
      skills: "[]",
      connectionsCount: 0,
      communitiesCount: 0,
    }).returning();

    const token = signToken(user.id);

    res.status(201).json({
      token,
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
