import { Router } from "express";
import { db } from "@workspace/db";
import { postsTable, commentsTable, usersTable, communitiesTable } from "@workspace/db";
import { eq, desc, sql, and } from "drizzle-orm";
import { z, ZodError } from "zod";
import { verifyToken, extractToken } from "../lib/jwt";

const router = Router();

function getAuthUserId(req: any): number | null {
  const token = extractToken(req.headers.authorization);
  if (!token) return null;
  return verifyToken(token)?.userId ?? null;
}

router.get("/posts", async (req, res): Promise<void> => {
  try {
    const { userId: userIdRaw, communityId: communityIdRaw } = req.query as {
      userId?: string;
      communityId?: string;
    };

    // Validate optional query params
    const userId = userIdRaw !== undefined ? parseInt(userIdRaw) : undefined;
    const communityId = communityIdRaw !== undefined ? parseInt(communityIdRaw) : undefined;
    if (userId !== undefined && isNaN(userId)) {
      res.status(400).json({ error: "userId deve ser um número inteiro." });
      return;
    }
    if (communityId !== undefined && isNaN(communityId)) {
      res.status(400).json({ error: "communityId deve ser um número inteiro." });
      return;
    }

    // Build WHERE conditions in SQL for performance
    const conditions = [];
    if (userId !== undefined) conditions.push(eq(postsTable.authorId, userId));
    if (communityId !== undefined) conditions.push(eq(postsTable.communityId, communityId));

    // LEFT JOIN with users to always return the author's current (live) avatar URL.
    // When the user row exists, use their current avatarUrl (even if null — meaning they
    // removed it). Only fall back to the post's stored snapshot when the user was deleted.
    const rows = await db
      .select({
        post: postsTable,
        currentAvatarUrl: usersTable.avatarUrl,
        userExists: usersTable.id,
      })
      .from(postsTable)
      .leftJoin(usersTable, eq(postsTable.authorId, usersTable.id))
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(postsTable.createdAt));

    res.json(rows.map(({ post, currentAvatarUrl, userExists }) => ({
      ...post,
      // userExists non-null means the JOIN matched — use live avatarUrl (may be null)
      // userExists null means the user was deleted — fall back to post snapshot
      authorAvatarUrl: userExists !== null ? currentAvatarUrl : post.authorAvatarUrl,
      createdAt: post.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/posts", async (req, res) => {
  try {
    const { content, authorId, communityId } = req.body;
    if (!content || !authorId) return res.status(400).json({ error: "content and authorId are required" });
    const [author] = await db.select().from(usersTable).where(eq(usersTable.id, authorId));
    if (!author) return res.status(404).json({ error: "Author not found" });
    let communityName = null;
    if (communityId) {
      const [community] = await db.select().from(communitiesTable).where(eq(communitiesTable.id, communityId));
      communityName = community?.name ?? null;
    }
    const [post] = await db.insert(postsTable).values({
      content,
      authorId,
      authorName: author.name,
      authorAvatarUrl: author.avatarUrl,
      authorCourse: author.course,
      communityId: communityId || null,
      communityName,
      likesCount: 0,
      commentsCount: 0,
    }).returning();
    res.status(201).json({ ...post, createdAt: post.createdAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/posts/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(postsTable).where(eq(postsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /posts/:id/comments — list comments for a post
router.get("/posts/:id/comments", async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) { res.status(400).json({ error: "ID inválido." }); return; }

    const comments = await db
      .select()
      .from(commentsTable)
      .where(eq(commentsTable.postId, id))
      .orderBy(commentsTable.createdAt);

    res.json(comments.map(c => ({ ...c, createdAt: c.createdAt.toISOString() })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /posts/:id/comments — add a comment
router.post("/posts/:id/comments", async (req, res): Promise<void> => {
  const userId = getAuthUserId(req);
  if (!userId) { res.status(401).json({ error: "Não autenticado." }); return; }

  try {
    const postId = parseInt(req.params.id);
    if (isNaN(postId)) { res.status(400).json({ error: "ID inválido." }); return; }

    const { content } = z.object({ content: z.string().min(1) }).parse(req.body);

    const [post] = await db.select().from(postsTable).where(eq(postsTable.id, postId));
    if (!post) { res.status(404).json({ error: "Post não encontrado." }); return; }

    const [author] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    if (!author) { res.status(404).json({ error: "Usuário não encontrado." }); return; }

    const [comment] = await db.insert(commentsTable).values({
      postId,
      authorId: userId,
      authorName: author.name,
      authorAvatarUrl: author.avatarUrl ?? null,
      authorCourse: author.course,
      content,
    }).returning();

    // Increment commentsCount on the post
    await db
      .update(postsTable)
      .set({ commentsCount: sql`${postsTable.commentsCount} + 1` })
      .where(eq(postsTable.id, postId));

    res.status(201).json({ ...comment, createdAt: comment.createdAt.toISOString() });
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ error: "Conteúdo inválido." });
      return;
    }
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
