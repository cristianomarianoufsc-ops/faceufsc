import { Router } from "express";
import { db } from "@workspace/db";
import { communitiesTable, communityMembershipsTable, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { verifyToken, extractToken } from "../lib/jwt";

const router = Router();

function getAuthUserId(req: any): number | null {
  const token = extractToken(req.headers.authorization);
  if (!token) return null;
  return verifyToken(token)?.userId ?? null;
}

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
    if (!name || !description || !category) {
      return res.status(400).json({ error: "name, description, and category are required" });
    }
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

// GET /communities/:id/members — list members with user info
router.get("/communities/:id/members", async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) { res.status(400).json({ error: "ID inválido." }); return; }

    const memberships = await db
      .select({
        membershipId: communityMembershipsTable.id,
        userId: communityMembershipsTable.userId,
        joinedAt: communityMembershipsTable.joinedAt,
        name: usersTable.name,
        avatarUrl: usersTable.avatarUrl,
        course: usersTable.course,
        role: usersTable.role,
      })
      .from(communityMembershipsTable)
      .innerJoin(usersTable, eq(communityMembershipsTable.userId, usersTable.id))
      .where(eq(communityMembershipsTable.communityId, id))
      .orderBy(desc(communityMembershipsTable.joinedAt));

    res.json(memberships.map(m => ({
      id: m.membershipId,
      userId: m.userId,
      name: m.name,
      avatarUrl: m.avatarUrl,
      course: m.course,
      role: m.role,
      joinedAt: m.joinedAt.toISOString(),
    })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /communities/:id/join — join a community (records membership)
router.post("/communities/:id/join", async (req, res): Promise<void> => {
  const userId = getAuthUserId(req);
  try {
    const id = parseInt(req.params.id);
    const [community] = await db.select().from(communitiesTable).where(eq(communitiesTable.id, id));
    if (!community) { res.status(404).json({ error: "Community not found" }); return; }

    // If we have a real userId, record the membership (ignore duplicate errors)
    if (userId) {
      try {
        await db.insert(communityMembershipsTable).values({ communityId: id, userId });
      } catch {
        // Already a member — just return current community without double-counting
        res.json({ ...community, createdAt: community.createdAt.toISOString() });
        return;
      }
    }

    const [updated] = await db
      .update(communitiesTable)
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
