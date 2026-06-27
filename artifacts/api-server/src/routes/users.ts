import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq, like, or } from "drizzle-orm";
import { z } from "zod";

const router = Router();

router.get("/users", async (req, res) => {
  try {
    const { search, course } = req.query as { search?: string; course?: string };
    let users = await db.select().from(usersTable).orderBy(usersTable.name);
    if (search) {
      users = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.course.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (course) {
      users = users.filter(u => u.course.toLowerCase().includes(course.toLowerCase()));
    }
    const result = users.map(u => ({
      ...u,
      skills: JSON.parse(u.skills || "[]"),
      createdAt: u.createdAt.toISOString(),
    }));
    res.json(result);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/users/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ ...user, skills: JSON.parse(user.skills || "[]"), createdAt: user.createdAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/users/me/avatar", async (req, res) => {
  try {
    const session = req.session as any;
    if (!session.userId) return res.status(401).json({ error: "Não autenticado." });

    const { avatarUrl } = z.object({ avatarUrl: z.string().min(1) }).parse(req.body);

    const [user] = await db
      .update(usersTable)
      .set({ avatarUrl })
      .where(eq(usersTable.id, session.userId))
      .returning();

    res.json({ avatarUrl: user.avatarUrl });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

export default router;
