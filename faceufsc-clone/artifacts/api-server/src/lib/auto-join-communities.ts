import { db } from "@workspace/db";
import { communitiesTable, communityMembershipsTable, usersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

/** Normalize a string for loose matching: lowercase, trim, collapse whitespace. */
function normalize(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, " ");
}

/** Extract the canonical tag value from a community description, e.g. [course:Sistemas de Informação] → "sistemas de informação" */
function extractTag(description: string, prefix: "course" | "dept"): string | null {
  const match = description.match(new RegExp(`\\[${prefix}:(.+?)\\]`));
  return match ? normalize(match[1]) : null;
}

/**
 * Auto-join a user to their official course and department communities.
 * Matches by canonical tag (stored in community description), not free-text.
 * Safe to call multiple times (skips already-members via ON CONFLICT).
 */
export async function autoJoinOfficialCommunities(
  userId: number,
  course: string,
  department: string,
): Promise<void> {
  const normCourse = normalize(course);
  const normDept = normalize(department);

  const allOfficial = await db
    .select({
      id: communitiesTable.id,
      description: communitiesTable.description,
    })
    .from(communitiesTable)
    .where(eq(communitiesTable.isOfficial, true));

  const matchedIds: number[] = [];
  for (const c of allOfficial) {
    const courseTag = extractTag(c.description, "course");
    const deptTag = extractTag(c.description, "dept");
    if (
      (courseTag && courseTag === normCourse) ||
      (deptTag && deptTag === normDept)
    ) {
      matchedIds.push(c.id);
    }
  }

  for (const communityId of matchedIds) {
    try {
      await db.transaction(async (tx) => {
        // Atomic insert — throws unique-violation (23505) if already a member
        await tx.insert(communityMembershipsTable).values({ communityId, userId });
        await tx
          .update(communitiesTable)
          .set({ membersCount: sql`${communitiesTable.membersCount} + 1` })
          .where(eq(communitiesTable.id, communityId));
        await tx
          .update(usersTable)
          .set({ communitiesCount: sql`${usersTable.communitiesCount} + 1` })
          .where(eq(usersTable.id, userId));
      });
    } catch (err: any) {
      // 23505 = unique_violation (already a member) — expected, skip silently
      if (err?.code === "23505") continue;
      // Any other DB error is unexpected — log and rethrow
      throw err;
    }
  }
}
