import { Router } from "express";
import { db } from "@workspace/db";
import { postsTable, commentsTable, usersTable, communitiesTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { z, ZodError } from "zod";
import { verifyToken, extractToken } from "../lib/jwt";

const router = Router();

function getAuthUserId(req: any): number | null {
  const token = extractToken(req.headers.authorization);
  if (!token) return null;
  return verifyToken(token)?.userId ?? null;
}

router.get("/posts", async (req, res) => {
  try {
    const { userId, communityId } = req.query as { userId?: string; communityId?: string };
    let posts = await db.select().from(postsTable).orderBy(desc(postsTable.createdAt));
    if (userId) {
      posts = posts.filter(p => p.authorId === parseInt(userId));
    }
    if (communityId) {
      posts = posts.filter(p => p.communityId === parseInt(communityId));
    }
    res.json(posts.map(p => ({ ...p, createdAt: p.createdAt.toISOString() })));
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
