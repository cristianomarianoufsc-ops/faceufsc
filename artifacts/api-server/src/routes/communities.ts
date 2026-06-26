import { Router } from "express";
import { db } from "@workspace/db";
import { communitiesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

router.get("/communities", async (req, res) => {
  try {
    const { search, category } = req.query as { search?: string; category?: string };
    let communities = await db.select().from(communitiesTable).orderBy(desc(communitiesTable.membersCount));
    if (search) {
      communities = communities.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (category) {
      communities = communities.filter(c => c.category === category);
    }
    res.json(communities.map(c => ({ ...c, createdAt: c.createdAt.toISOString() })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/communities", async (req, res) => {
  try {
    const { name, description, category } = req.body;
    if (!name || !description || !category) return res.status(400).json({ error: "name, description, and category are required" });
    const [community] = await db.insert(communitiesTable).values({
      name,
      description,
      category,
      membersCount: 1,
      postsCount: 0,
    }).returning();
    res.status(201).json({ ...community, createdAt: community.createdAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/communities/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [community] = await db.select().from(communitiesTable).where(eq(communitiesTable.id, id));
    if (!community) return res.status(404).json({ error: "Community not found" });
    res.json({ ...community, createdAt: community.createdAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/communities/:id/join", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [community] = await db.select().from(communitiesTable).where(eq(communitiesTable.id, id));
    if (!community) return res.status(404).json({ error: "Community not found" });
    const [updated] = await db.update(communitiesTable)
      .set({ membersCount: community.membersCount + 1 })
      .where(eq(communitiesTable.id, id))
      .returning();
    res.json({ ...updated, createdAt: updated.createdAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
