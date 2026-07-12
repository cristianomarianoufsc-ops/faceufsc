import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const forumTopicsTable = pgTable("forum_topics", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").notNull(),
  authorId: integer("author_id").notNull(),
  authorName: text("author_name").notNull(),
  authorAvatarUrl: text("author_avatar_url"),
  title: text("title").notNull(),
  content: text("content").notNull(),
  isPinned: boolean("is_pinned").notNull().default(false),
  repliesCount: integer("replies_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const forumRepliesTable = pgTable("forum_replies", {
  id: serial("id").primaryKey(),
  topicId: integer("topic_id").notNull(),
  authorId: integer("author_id").notNull(),
  authorName: text("author_name").notNull(),
  authorAvatarUrl: text("author_avatar_url"),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type ForumTopic = typeof forumTopicsTable.$inferSelect;
export type ForumReply = typeof forumRepliesTable.$inferSelect;

export const insertForumTopicSchema = z.object({
  title: z.string().min(3).max(200),
  content: z.string().min(1).max(5000),
});
export const insertForumReplySchema = z.object({
  content: z.string().min(1).max(5000),
});
