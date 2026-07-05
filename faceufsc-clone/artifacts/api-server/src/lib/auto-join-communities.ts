import { db } from "@workspace/db";
import { communitiesTable, communityMembershipsTable, usersTable } from "@workspace/db";
import { eq, or, sql } from "drizzle-orm";

/**
 * Auto-join a user to their official course and department communities.
 * Safe to call multiple times (skips if already a member).
 */
export async function autoJoinOfficialCommunities(userId: number, course: string, department: string): Promise<void> {
  // Find official communities that match this user's course or department
  const allOfficial = await db
    .select()
    .from(communitiesTable)
    .where(eq(communitiesTable.isOfficial, true));

  const matches = allOfficial.filter(c =>
    c.name.toLowerCase() === course.toLowerCase() ||
    c.name.toLowerCase() === department.toLowerCase() ||
    c.description.toLowerCase().includes(course.toLowerCase()) ||
    // match by slug stored in description tag e.g. "[course:Sistemas de Informação]"
    c.description.includes(`[course:${course}]`) ||
    c.description.includes(`[dept:${department}]`)
  );

  for (const community of matches) {
    try {
      await db.transaction(async (tx) => {
        await tx.insert(communityMembershipsTable).values({ communityId: community.id, userId });
        await tx.update(communitiesTable)
          .set({ membersCount: sql`${communitiesTable.membersCount} + 1` })
          .where(eq(communitiesTable.id, community.id));
        await tx.update(usersTable)
          .set({ communitiesCount: sql`${usersTable.communitiesCount} + 1` })
          .where(eq(usersTable.id, userId));
      });
    } catch {
      // Already a member — skip silently
    }
  }
}
