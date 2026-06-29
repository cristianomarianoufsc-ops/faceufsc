import { Router } from "express";
import { db } from "@workspace/db";
import { appSettingsTable, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

function requireAdmin(req: import("express").Request, res: import("express").Response, next: import("express").NextFunction): void {
  const password = req.headers["x-admin-password"];
  if (!ADMIN_PASSWORD || password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Não autorizado." });
    return;
  }
  next();
}

export async function getSetting(key: string, defaultValue: string): Promise<string> {
  try {
    const [row] = await db.select().from(appSettingsTable).where(eq(appSettingsTable.key, key));
    return row?.value ?? defaultValue;
  } catch {
    return defaultValue;
  }
}

router.get("/admin/settings", requireAdmin, async (req, res): Promise<void> => {
  try {
    const emailVerification = await getSetting("email_verification_enabled", "true");
    res.json({ email_verification_enabled: emailVerification === "true" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno." });
  }
});

router.put("/admin/settings", requireAdmin, async (req, res): Promise<void> => {
  try {
    const { email_verification_enabled } = req.body;
    const value = email_verification_enabled ? "true" : "false";

    await db
      .insert(appSettingsTable)
      .values({ key: "email_verification_enabled", value, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: appSettingsTable.key,
        set: { value, updatedAt: new Date() },
      });

    res.json({ email_verification_enabled: value === "true" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno." });
  }
});

router.get("/admin/users", requireAdmin, async (req, res): Promise<void> => {
  try {
    const users = await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        course: usersTable.course,
        department: usersTable.department,
        role: usersTable.role,
        entryYear: usersTable.entryYear,
        createdAt: usersTable.createdAt,
      })
      .from(usersTable)
      .orderBy(desc(usersTable.createdAt));

    res.json({ users, total: users.length });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno." });
  }
});

router.delete("/admin/users/:id", requireAdmin, async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "ID inválido." });
      return;
    }

    const [deleted] = await db.delete(usersTable).where(eq(usersTable.id, id)).returning({ id: usersTable.id });

    if (!deleted) {
      res.status(404).json({ error: "Usuário não encontrado." });
      return;
    }

    res.json({ ok: true });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno." });
  }
});

export default router;
