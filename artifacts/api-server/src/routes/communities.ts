import { Router } from "express";
import { db } from "@workspace/db";
import { communitiesTable } from "@workspace/db";
import { eq, desc, isNull, sql } from "drizzle-orm";

const router = Router();

router.get("/communities", async (req, res) => {
  try {
    const { search, category, parentId, topLevel } = req.query as {
      search?: string;
      category?: string;
      parentId?: string;
      topLevel?: string;
    };

    let query = db.select().from(communitiesTable).orderBy(desc(communitiesTable.membersCount));

    let communities = await query;

    if (topLevel === "true") {
      communities = communities.filter(c => c.parentId === null);
    } else if (parentId !== undefined) {
      const pid = parseInt(parentId);
      communities = communities.filter(c => c.parentId === pid);
    }

    if (search) {
      communities = communities.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category) {
      communities = communities.filter(c => c.category === category);
    }

    const allCommunities = await db.select().from(communitiesTable);

    const result = communities.map(c => ({
      ...c,
      childrenCount: allCommunities.filter(x => x.parentId === c.id).length,
      createdAt: c.createdAt.toISOString(),
    }));

    res.json(result);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/communities", async (req, res) => {
  try {
    const { name, description, category, parentId } = req.body;
    if (!name || !description || !category) {
      return res.status(400).json({ error: "name, description, and category are required" });
    }
    const [community] = await db.insert(communitiesTable).values({
      name,
      description,
      category,
      parentId: parentId ?? null,
      membersCount: 1,
      postsCount: 0,
    }).returning();

    const childrenCount = 0;
    res.status(201).json({ ...community, childrenCount, createdAt: community.createdAt.toISOString() });
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

    const allCommunities = await db.select().from(communitiesTable);
    const childrenCount = allCommunities.filter(c => c.parentId === id).length;

    res.json({ ...community, childrenCount, createdAt: community.createdAt.toISOString() });
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

    const allCommunities = await db.select().from(communitiesTable);
    const childrenCount = allCommunities.filter(c => c.parentId === id).length;

    res.json({ ...updated, childrenCount, createdAt: updated.createdAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
