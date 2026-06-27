import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.post("/auth/register", async (req, res) => {
  try {
    const { name, email, password, course, department, entryYear, role } = req.body;

    if (!name || !email || !password || !course || !department || !entryYear) {
      return res.status(400).json({ error: "Todos os campos obrigatórios devem ser preenchidos." });
    }

    const allowedDomains = ["@ufsc.br", "@grad.ufsc.br", "@posgrad.ufsc.br", "@servidor.ufsc.br"];
    if (!allowedDomains.some(d => email.endsWith(d))) {
      return res.status(400).json({ error: "Use um e-mail institucional da UFSC (@ufsc.br, @grad.ufsc.br, etc)." });
    }

    const [existing] = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.email, email));
    if (existing) {
      return res.status(409).json({ error: "Este e-mail já está cadastrado." });
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

    const session = req.session as any;
    session.userId = user.id;

    res.status(201).json({
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

router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "E-mail e senha são obrigatórios." });
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (!user) {
      return res.status(401).json({ error: "E-mail ou senha incorretos." });
    }

    if (!user.passwordHash) {
      return res.status(401).json({ error: "Conta sem senha cadastrada. Redefina sua senha." });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "E-mail ou senha incorretos." });
    }

    const session = req.session as any;
    session.userId = user.id;

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

router.post("/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

router.get("/auth/me", async (req, res) => {
  try {
    const session = req.session as any;
    if (!session.userId) {
      return res.status(401).json({ error: "Não autenticado." });
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, session.userId));
    if (!user) {
      return res.status(401).json({ error: "Usuário não encontrado." });
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
