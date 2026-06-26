import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  avatarUrl: text("avatar_url"),
  course: text("course").notNull(),
  department: text("department").notNull(),
  entryYear: integer("entry_year").notNull(),
  bio: text("bio"),
  role: text("role").notNull().default("student"),
  skills: text("skills").notNull().default("[]"),
  connectionsCount: integer("connections_count").notNull().default(0),
  communitiesCount: integer("communities_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
