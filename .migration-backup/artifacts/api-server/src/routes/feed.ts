import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, postsTable, communitiesTable, eventsTable } from "@workspace/db";
import { sql, desc } from "drizzle-orm";

const router = Router();

router.get("/feed/stats", async (req, res) => {
  try {
    const [{ count: totalUsers }] = await db.select({ count: sql<number>`count(*)::int` }).from(usersTable);
    const [{ count: totalCommunities }] = await db.select({ count: sql<number>`count(*)::int` }).from(communitiesTable);
    const [{ count: totalPosts }] = await db.select({ count: sql<number>`count(*)::int` }).from(postsTable);
    const [{ count: totalEvents }] = await db.select({ count: sql<number>`count(*)::int` }).from(eventsTable);
    const allUsers = await db.select({ role: usersTable.role }).from(usersTable);
    const activeStudents = allUsers.filter(u => u.role === "student" || u.role === "alumni").length;
    const activeProfessors = allUsers.filter(u => u.role === "professor").length;
    res.json({ totalUsers, totalCommunities, totalPosts, totalEvents, activeStudents, activeProfessors });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/feed/recent", async (req, res) => {
  try {
    const recentPosts = await db.select().from(postsTable).orderBy(desc(postsTable.createdAt)).limit(5);
    const recentEvents = await db.select().from(eventsTable).orderBy(desc(eventsTable.createdAt)).limit(3);
    const items = [
      ...recentPosts.map((p, i) => ({
        id: i + 1,
        type: "post" as const,
        actorName: p.authorName,
        actorAvatarUrl: p.authorAvatarUrl ?? null,
        description: `publicou no feed: "${p.content.slice(0, 80)}${p.content.length > 80 ? "..." : ""}"`,
        createdAt: p.createdAt.toISOString(),
      })),
      ...recentEvents.map((e, i) => ({
        id: recentPosts.length + i + 1,
        type: "event" as const,
        actorName: e.organizer,
        actorAvatarUrl: null,
        description: `criou um evento: "${e.title}"`,
        createdAt: e.createdAt.toISOString(),
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(items);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
