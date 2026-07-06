import { Router } from "express";
import { db } from "@workspace/db";
import { communitiesTable, communityMembershipsTable, usersTable } from "@workspace/db";
import { eq, desc, isNull, inArray, count, ilike, or, and } from "drizzle-orm";
import { verifyToken, extractToken } from "../lib/jwt";

const router = Router();

function getAuthUserId(req: any): number | null {
  const token = extractToken(req.headers.authorization);
  if (!token) return null;
  return verifyToken(token)?.userId ?? null;
}

// Attach childrenCount to a list of communities
async function withChildrenCount(communities: (typeof communitiesTable.$inferSelect)[]) {
  if (communities.length === 0) return communities.map(c => ({ ...c, childrenCount: 0 }));
  const ids = communities.map(c => c.id);
  const counts = await db
    .select({ parentId: communitiesTable.parentId, cnt: count() })
    .from(communitiesTable)
    .where(inArray(communitiesTable.parentId, ids))
    .groupBy(communitiesTable.parentId);
  const countMap = new Map(counts.map(r => [r.parentId, Number(r.cnt)]));
  return communities.map(c => ({ ...c, childrenCount: countMap.get(c.id) ?? 0 }));
}

function serializeCommunity(c: (typeof communitiesTable.$inferSelect) & { childrenCount?: number }) {
  return { ...c, childrenCount: c.childrenCount ?? 0, createdAt: c.createdAt.toISOString() };
}

// GET /communities
// - parentId not provided + no search → root-level communities (parentId IS NULL)
// - parentId=N                        → children of N
// - search (with or without parentId) → text search across all communities
router.get("/communities", async (req, res) => {
  try {
    const { search, category, parentId: parentIdRaw } = req.query as {
      search?: string;
      category?: string;
      parentId?: string;
    };

    const hasSearch = !!search;
    const hasParentId = parentIdRaw !== undefined;

    if (hasParentId && (isNaN(parseInt(parentIdRaw!)) || !/^\d+$/.test(parentIdRaw!))) {
      res.status(400).json({ error: "parentId deve ser um número inteiro válido." });
      return;
    }

    // Build WHERE clause
    let whereClause;
    if (hasSearch) {
      // Text search: ignore hierarchy filter so all results surface
      const pattern = `%${search}%`;
      whereClause = or(
        ilike(communitiesTable.name, pattern),
        ilike(communitiesTable.description, pattern),
      );
    } else if (hasParentId) {
      const pid = parseInt(parentIdRaw!);
      whereClause = eq(communitiesTable.parentId, pid);
    } else {
      // Default: root level
      whereClause = isNull(communitiesTable.parentId);
    }

    if (category && whereClause) {
      whereClause = and(whereClause, eq(communitiesTable.category, category));
    } else if (category) {
      whereClause = eq(communitiesTable.category, category);
    }

    const communities = await db
      .select()
      .from(communitiesTable)
      .where(whereClause)
      .orderBy(desc(communitiesTable.membersCount));

    const withCounts = await withChildrenCount(communities);
    res.json(withCounts.map(serializeCommunity));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /communities
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
    res.status(201).json(serializeCommunity({ ...community, childrenCount: 0 }));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /communities/:id
router.get("/communities/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [community] = await db.select().from(communitiesTable).where(eq(communitiesTable.id, id));
    if (!community) return res.status(404).json({ error: "Community not found" });
    const [withCount] = await withChildrenCount([community]);
    res.json(serializeCommunity(withCount));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /communities/:id/children — listar subcomunidades diretas
router.get("/communities/:id/children", async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) { res.status(400).json({ error: "ID inválido." }); return; }
    const children = await db
      .select()
      .from(communitiesTable)
      .where(eq(communitiesTable.parentId, id))
      .orderBy(desc(communitiesTable.membersCount));
    const withCounts = await withChildrenCount(children);
    res.json(withCounts.map(serializeCommunity));
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

    if (userId) {
      try {
        await db.insert(communityMembershipsTable).values({ communityId: id, userId });
      } catch {
        res.json(serializeCommunity({ ...community, childrenCount: 0 }));
        return;
      }
    }

    const [updated] = await db
      .update(communitiesTable)
      .set({ membersCount: community.membersCount + 1 })
      .where(eq(communitiesTable.id, id))
      .returning();

    res.json(serializeCommunity({ ...updated, childrenCount: 0 }));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
