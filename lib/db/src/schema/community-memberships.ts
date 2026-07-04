import { pgTable, serial, integer, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { communitiesTable } from "./communities";
import { usersTable } from "./users";

export const communityMembershipsTable = pgTable(
  "community_memberships",
  {
    id: serial("id").primaryKey(),
    communityId: integer("community_id")
      .notNull()
      .references(() => communitiesTable.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    joinedAt: timestamp("joined_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("community_memberships_unique").on(t.communityId, t.userId)]
);
