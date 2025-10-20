import { sql } from 'drizzle-orm';
import { index, int, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Tickets table
export const ticketsTable = sqliteTable(
  'tickets',
  {
    id: int().primaryKey({ autoIncrement: true }),
    title: text().notNull(),
    category: text().notNull(),
    description: text().notNull(),
    status: text().notNull().default('OPEN'), // OPEN, IN_PROGRESS, CLOSED
    createdAt: text()
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text()
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index('tickets_status_idx').on(table.status), index('tickets_category_idx').on(table.category)]
);

// Comments table
export const commentsTable = sqliteTable(
  'comments',
  {
    id: int().primaryKey({ autoIncrement: true }),
    ticketId: int()
      .notNull()
      .references(() => ticketsTable.id, { onDelete: 'cascade' }),
    comment: text().notNull(),
    createdAt: text()
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index('comments_ticket_id_idx').on(table.ticketId)]
);

// Keep the existing groups table for backward compatibility
