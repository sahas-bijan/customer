import { desc, eq } from 'drizzle-orm';
import { getDb, initDatabase, schema } from '../db/db';
import { getHono } from './hono-utils';

export function createHonoApp() {
  const app = getHono();

  // Initialize database middleware
  app.use('*', async (c, next) => {
    if (c.env?.DB) {
      initDatabase(c.env.DB);
    }
    await next();
  });

  // Health check
  app.get('/health', async (c) => {
    return c.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'hono' });
  });

  // POST /tickets - Create a new support ticket
  app.post('/tickets', async (c) => {
    try {
      const body = await c.req.json();
      const { title, category, description } = body;

      if (!title || !category || !description) {
        return c.json({ error: 'Missing required fields: title, category, description' }, 400);
      }

      const db = getDb();
      const result = await db
        .insert(schema.ticketsTable)
        .values({
          title,
          category,
          description,
          status: 'OPEN',
        })
        .returning();

      const ticket = result[0];

      return c.json({
        id: ticket.id,
        title: ticket.title,
        category: ticket.category,
        description: ticket.description,
        status: ticket.status,
        comments: [],
      });
    } catch (error) {
      console.error('Error creating ticket:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  });

  // GET /tickets - Retrieve all support tickets
  app.get('/tickets', async (c) => {
    try {
      const db = getDb();

      // Get all tickets with their comments
      const tickets = await db.select().from(schema.ticketsTable).orderBy(desc(schema.ticketsTable.createdAt));

      const ticketsWithComments = await Promise.all(
        tickets.map(async (ticket) => {
          const comments = await db
            .select()
            .from(schema.commentsTable)
            .where(eq(schema.commentsTable.ticketId, ticket.id))
            .orderBy(desc(schema.commentsTable.createdAt));

          return {
            id: ticket.id,
            title: ticket.title,
            category: ticket.category,
            description: ticket.description,
            status: ticket.status,
            comments: comments.map((c) => c.comment),
          };
        })
      );

      return c.json(ticketsWithComments);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  });

  // GET /tickets/{id} - Fetch a ticket by ID
  app.get('/tickets/:id', async (c) => {
    try {
      const id = parseInt(c.req.param('id'));
      if (isNaN(id)) {
        return c.json({ error: 'Invalid ticket ID' }, 400);
      }

      const db = getDb();

      const tickets = await db.select().from(schema.ticketsTable).where(eq(schema.ticketsTable.id, id));

      if (tickets.length === 0) {
        return c.json({ error: 'Ticket not found' }, 404);
      }

      const ticket = tickets[0];
      const comments = await db
        .select()
        .from(schema.commentsTable)
        .where(eq(schema.commentsTable.ticketId, id))
        .orderBy(desc(schema.commentsTable.createdAt));

      return c.json({
        id: ticket.id,
        title: ticket.title,
        category: ticket.category,
        description: ticket.description,
        status: ticket.status,
        comments: comments.map((c) => c.comment),
      });
    } catch (error) {
      console.error('Error fetching ticket:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  });

  // PUT /tickets/{id}/status - Update the status of a ticket
  app.put('/tickets/:id/status', async (c) => {
    try {
      const id = parseInt(c.req.param('id'));
      if (isNaN(id)) {
        return c.json({ error: 'Invalid ticket ID' }, 400);
      }

      const status = c.req.query('status');
      if (!status || !['OPEN', 'IN_PROGRESS', 'CLOSED'].includes(status)) {
        return c.json({ error: 'Invalid status. Must be OPEN, IN_PROGRESS, or CLOSED' }, 400);
      }

      const db = getDb();

      // Check if ticket exists
      const existingTickets = await db.select().from(schema.ticketsTable).where(eq(schema.ticketsTable.id, id));

      if (existingTickets.length === 0) {
        return c.json({ error: 'Ticket not found' }, 404);
      }

      // Update the ticket status
      await db
        .update(schema.ticketsTable)
        .set({
          status,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(schema.ticketsTable.id, id));

      return c.json({ message: 'Ticket status updated successfully' });
    } catch (error) {
      console.error('Error updating ticket status:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  });

  // POST /tickets/{id}/comment - Add a comment to a ticket
  app.post('/tickets/:id/comment', async (c) => {
    try {
      const id = parseInt(c.req.param('id'));
      if (isNaN(id)) {
        return c.json({ error: 'Invalid ticket ID' }, 400);
      }

      const body = await c.req.json();
      const { comment } = body;

      if (!comment) {
        return c.json({ error: 'Missing required field: comment' }, 400);
      }

      const db = getDb();

      // Check if ticket exists
      const existingTickets = await db.select().from(schema.ticketsTable).where(eq(schema.ticketsTable.id, id));

      if (existingTickets.length === 0) {
        return c.json({ error: 'Ticket not found' }, 404);
      }

      // Add the comment
      await db.insert(schema.commentsTable).values({
        ticketId: id,
        comment,
      });

      // Update ticket's updatedAt timestamp
      await db
        .update(schema.ticketsTable)
        .set({ updatedAt: new Date().toISOString() })
        .where(eq(schema.ticketsTable.id, id));

      return c.json({ message: 'Comment added successfully' });
    } catch (error) {
      console.error('Error adding comment:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  });

  // DELETE /tickets/{id} - Delete a ticket
  app.delete('/tickets/:id', async (c) => {
    try {
      const id = parseInt(c.req.param('id'));
      if (isNaN(id)) {
        return c.json({ error: 'Invalid ticket ID' }, 400);
      }

      const db = getDb();

      // Check if ticket exists
      const existingTickets = await db.select().from(schema.ticketsTable).where(eq(schema.ticketsTable.id, id));

      if (existingTickets.length === 0) {
        return c.json({ error: 'Ticket not found' }, 404);
      }

      // Delete the ticket (comments will be deleted automatically due to cascade)
      await db.delete(schema.ticketsTable).where(eq(schema.ticketsTable.id, id));

      return c.json({ message: 'Ticket deleted successfully' });
    } catch (error) {
      console.error('Error deleting ticket:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  });

  return app;
}
