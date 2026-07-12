import { Router } from "express";
import { db } from "@workspace/db";
import { forumTopicsTable, forumRepliesTable, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { verifyToken, extractToken } from "../lib/jwt";

const router = Router();

function getAuthUserId(req: any): number | null {
  const token = extractToken(req.headers.authorization);
  if (!token) return null;
  return verifyToken(token)?.userId ?? null;
}

router.get("/communities/:id/topics", async (req, res) => {
  try {
    const communityId = parseInt(req.params.id);
    const topics = await db
      .select()
      .from(forumTopicsTable)
      .where(eq(forumTopicsTable.communityId, communityId))
      .orderBy(desc(forumTopicsTable.isPinned), desc(forumTopicsTable.createdAt));

    res.json(topics.map(t => ({ ...t, createdAt: t.createdAt.toISOString() })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/communities/:id/topics", async (req, res) => {
  try {
    const communityId = parseInt(req.params.id);
    const userId = getAuthUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { title, content } = req.body;
    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({ error: "title and content are required" });
    }
    if (title.length > 200) return res.status(400).json({ error: "title too long" });
    if (content.length > 5000) return res.status(400).json({ error: "content too long" });

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    if (!user) return res.status(404).json({ error: "User not found" });
    const authorName = `${user.firstName} ${user.lastName}`.trim();
    const authorAvatarUrl = user.avatarUrl ?? null;

    const [topic] = await db
      .insert(forumTopicsTable)
      .values({ communityId, authorId: userId, authorName, authorAvatarUrl, title: title.trim(), content: content.trim() })
      .returning();

    res.status(201).json({ ...topic, createdAt: topic.createdAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/forum/topics/:id", async (req, res) => {
  try {
    const topicId = parseInt(req.params.id);
    const [topic] = await db.select().from(forumTopicsTable).where(eq(forumTopicsTable.id, topicId));
    if (!topic) return res.status(404).json({ error: "Topic not found" });

    const replies = await db
      .select()
      .from(forumRepliesTable)
      .where(eq(forumRepliesTable.topicId, topicId))
      .orderBy(forumRepliesTable.createdAt);

    res.json({
      ...topic,
      createdAt: topic.createdAt.toISOString(),
      replies: replies.map(r => ({ ...r, createdAt: r.createdAt.toISOString() })),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/forum/topics/:id/replies", async (req, res) => {
  try {
    const topicId = parseInt(req.params.id);
    const userId = getAuthUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: "content is required" });
    if (content.length > 5000) return res.status(400).json({ error: "content too long" });

    const [topic] = await db.select().from(forumTopicsTable).where(eq(forumTopicsTable.id, topicId));
    if (!topic) return res.status(404).json({ error: "Topic not found" });

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    if (!user) return res.status(404).json({ error: "User not found" });
    const authorName = `${user.firstName} ${user.lastName}`.trim();
    const authorAvatarUrl = user.avatarUrl ?? null;

    const [reply] = await db
      .insert(forumRepliesTable)
      .values({ topicId, authorId: userId, authorName, authorAvatarUrl, content: content.trim() })
      .returning();

    await db
      .update(forumTopicsTable)
      .set({ repliesCount: topic.repliesCount + 1 })
      .where(eq(forumTopicsTable.id, topicId));

    res.status(201).json({ ...reply, createdAt: reply.createdAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
