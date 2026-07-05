import { pgTable, text, serial, integer, timestamp, boolean, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// categories: curso, centro, campus, moradia, entidade, turma, course, research, sports, culture, housing, general
export const communitiesTable = pgTable("communities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  membersCount: integer("members_count").notNull().default(0),
  postsCount: integer("posts_count").notNull().default(0),
  imageUrl: text("image_url"),
  isFixed: boolean("is_fixed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  uniqueIndex("communities_name_unique").on(t.name),
]);

export const insertCommunitySchema = createInsertSchema(communitiesTable).omit({ id: true, createdAt: true });
export type InsertCommunity = z.infer<typeof insertCommunitySchema>;
export type Community = typeof communitiesTable.$inferSelect;
