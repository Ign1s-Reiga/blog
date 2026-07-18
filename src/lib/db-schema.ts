import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const posts = sqliteTable('blog-db', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  excerpt: text('excerpt'),
  tags: text('tags', { mode: 'json' }).$type<string[]>().default([]),
  published: integer('published', { mode: 'boolean' }).notNull().default(false),
  publishedAt: integer('published_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
