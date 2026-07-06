import { Router } from "express";
import { db } from "@workspace/db";
import { appSettingsTable, usersTable, postsTable, communitiesTable } from "@workspace/db";
import { eq, desc, inArray, and, isNull, notInArray } from "drizzle-orm";
import { CAMPUS_SEED, CENTRO_SEED, CURSO_SEED, buildCursoDescription } from "../lib/seed-communities";

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
    if (isNaN(id)) { res.status(400).json({ error: "ID inválido." }); return; }
    const [deleted] = await db.delete(usersTable).where(eq(usersTable.id, id)).returning({ id: usersTable.id });
    if (!deleted) { res.status(404).json({ error: "Usuário não encontrado." }); return; }
    res.json({ ok: true });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno." });
  }
});

router.get("/admin/posts", requireAdmin, async (req, res): Promise<void> => {
  try {
    const posts = await db
      .select({
        id: postsTable.id,
        content: postsTable.content,
        authorId: postsTable.authorId,
        authorName: postsTable.authorName,
        authorCourse: postsTable.authorCourse,
        communityName: postsTable.communityName,
        likesCount: postsTable.likesCount,
        commentsCount: postsTable.commentsCount,
        createdAt: postsTable.createdAt,
      })
      .from(postsTable)
      .orderBy(desc(postsTable.createdAt));

    const userIds = new Set(
      (await db.select({ id: usersTable.id }).from(usersTable)).map(u => u.id)
    );
    const result = posts.map(p => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
      orphaned: !userIds.has(p.authorId),
    }));

    res.json({ posts: result, total: result.length });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno." });
  }
});

router.delete("/admin/posts/:id", requireAdmin, async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) { res.status(400).json({ error: "ID inválido." }); return; }
    const [deleted] = await db.delete(postsTable).where(eq(postsTable.id, id)).returning({ id: postsTable.id });
    if (!deleted) { res.status(404).json({ error: "Post não encontrado." }); return; }
    res.json({ ok: true });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro interno." });
  }
});

// ─── Remover categorias de comunidades fixas ─────────────────────────────────
const SEEDED_CATEGORIES = ["campus", "centro", "moradia", "entidade", "curso", "turma"] as const;

router.delete("/admin/purge-community-categories", requireAdmin, async (req, res): Promise<void> => {
  try {
    const { categories } = req.body as { categories?: string[] };
    if (!Array.isArray(categories) || categories.length === 0) {
      res.status(400).json({ error: "Informe um array 'categories' não vazio." });
      return;
    }
    const invalid = categories.filter(c => !(SEEDED_CATEGORIES as readonly string[]).includes(c));
    if (invalid.length > 0) {
      res.status(400).json({ error: `Categorias inválidas: ${invalid.join(", ")}. Permitidas: ${SEEDED_CATEGORIES.join(", ")}.` });
      return;
    }
    const deleted = await db
      .delete(communitiesTable)
      .where(and(
        inArray(communitiesTable.category, categories),
        eq(communitiesTable.isFixed, true),
      ))
      .returning({ id: communitiesTable.id });
    req.log.info({ deleted: deleted.length, categories }, "Categorias de comunidades fixas removidas");
    res.json({ deleted: deleted.length, categories });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro ao remover categorias." });
  }
});

// ─── Seed hierárquico de comunidades fixas da UFSC ───────────────────────────
// POST /admin/seed-communities
// Hierarquia: Campus → Centro → Curso
// Idempotente: usa onConflictDoUpdate para corrigir parentId em re-execuções.
router.post("/admin/seed-communities", requireAdmin, async (req, res): Promise<void> => {
  try {
    let created = 0;
    let updated = 0;

    // Helper: upsert one community, tracking created vs updated
    const existingNames = new Set(
      (await db.select({ name: communitiesTable.name }).from(communitiesTable)
        .where(eq(communitiesTable.isFixed, true))).map(r => r.name)
    );

    // ── Fase 1: Campus (sem parentId) ────────────────────────────────────────
    for (const campus of CAMPUS_SEED) {
      const isNew = !existingNames.has(campus.name);
      await db.insert(communitiesTable).values({
        name: campus.name,
        description: campus.description,
        category: "campus",
        parentId: null,
        isFixed: true,
        membersCount: 0,
        postsCount: 0,
      }).onConflictDoUpdate({
        target: communitiesTable.name,
        set: { parentId: null, isFixed: true, category: "campus" },
      });
      if (isNew) created++; else updated++;
    }

    // Busca IDs dos campus pelo nome
    const campusRows = await db
      .select({ id: communitiesTable.id, name: communitiesTable.name })
      .from(communitiesTable)
      .where(inArray(communitiesTable.name, CAMPUS_SEED.map(c => c.name)));
    const campusNameToId = new Map(campusRows.map(r => [r.name, r.id]));
    const campusKeyToId = new Map(CAMPUS_SEED.map(c => [c.key, campusNameToId.get(c.name)!]));

    // ── Fase 2: Centro (parentId = campus) ───────────────────────────────────
    for (const centro of CENTRO_SEED) {
      const parentId = campusKeyToId.get(centro.campusKey);
      if (!parentId) continue;
      const isNew = !existingNames.has(centro.name);
      await db.insert(communitiesTable).values({
        name: centro.name,
        description: centro.description,
        category: "centro",
        parentId,
        isFixed: true,
        membersCount: 0,
        postsCount: 0,
      }).onConflictDoUpdate({
        target: communitiesTable.name,
        set: { parentId, isFixed: true, category: "centro" },
      });
      if (isNew) created++; else updated++;
    }

    // Busca IDs dos centros pelo nome
    const centroRows = await db
      .select({ id: communitiesTable.id, name: communitiesTable.name })
      .from(communitiesTable)
      .where(inArray(communitiesTable.name, CENTRO_SEED.map(c => c.name)));
    const centroNameToId = new Map(centroRows.map(r => [r.name, r.id]));
    const centroKeyToId = new Map(CENTRO_SEED.map(c => [c.key, centroNameToId.get(c.name)!]));

    // ── Fase 3: Cursos (parentId = centro ou campus) ──────────────────────────
    for (const curso of CURSO_SEED) {
      const parentId = curso.centroKey
        ? centroKeyToId.get(curso.centroKey)
        : curso.campusKey
          ? campusKeyToId.get(curso.campusKey)
          : undefined;
      if (!parentId) continue;
      const isNew = !existingNames.has(curso.name);
      await db.insert(communitiesTable).values({
        name: curso.name,
        description: buildCursoDescription(curso),
        category: "curso",
        parentId,
        isFixed: true,
        membersCount: 0,
        postsCount: 0,
      }).onConflictDoUpdate({
        target: communitiesTable.name,
        set: { parentId, isFixed: true, category: "curso" },
      });
      if (isNew) created++; else updated++;
    }

    // ── Limpeza: remove comunidades fixas obsoletas (não estão no seed atual) ──
    const allSeedNames = [
      ...CAMPUS_SEED.map(c => c.name),
      ...CENTRO_SEED.map(c => c.name),
      ...CURSO_SEED.map(c => c.name),
    ];
    const purged = await db
      .delete(communitiesTable)
      .where(and(eq(communitiesTable.isFixed, true), notInArray(communitiesTable.name, allSeedNames)))
      .returning({ id: communitiesTable.id });

    const total = CAMPUS_SEED.length + CENTRO_SEED.length + CURSO_SEED.length;
    req.log.info({ created, updated, purged: purged.length, total }, "Seed hierárquico de comunidades concluído");
    res.json({
      created,
      updated,
      total,
      message: `Seed concluído: ${total} comunidades processadas.`,
      breakdown: {
        campus: CAMPUS_SEED.length,
        centro: CENTRO_SEED.length,
        curso: CURSO_SEED.length,
      },
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Erro ao fazer seed das comunidades." });
  }
});

export default router;
