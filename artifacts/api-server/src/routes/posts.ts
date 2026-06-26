import { Router } from "express";
import { db } from "@workspace/db";
import { postsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

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
    const { usersTable, communitiesTable } = await import("@workspace/db");
    const { eq } = await import("drizzle-orm");
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

export default router;
