import type { CreateTicketRequest, Ticket } from './types';

const API_BASE = '/api'; // Backend API is served under /api path

export const api = {
  // Create a new ticket
  createTicket: async (ticket: CreateTicketRequest): Promise<Ticket> => {
    const response = await fetch(`${API_BASE}/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ticket),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create ticket');
    }

    return response.json();
  },

  // Get all tickets
  getTickets: async (): Promise<Ticket[]> => {
    const response = await fetch(`${API_BASE}/tickets`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch tickets');
    }

    return response.json();
  },

  // Get a specific ticket by ID
  getTicket: async (id: number): Promise<Ticket> => {
    const response = await fetch(`${API_BASE}/tickets/${id}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch ticket');
    }

    return response.json();
  },

  // Update ticket status
  updateStatus: async (id: number, status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED'): Promise<void> => {
    const response = await fetch(`${API_BASE}/tickets/${id}/status?status=${status}`, {
      method: 'PUT',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update ticket status');
    }
  },

  // Add comment to ticket
  addComment: async (id: number, comment: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/tickets/${id}/comment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ comment }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add comment');
    }
  },

  // Delete ticket
  deleteTicket: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE}/tickets/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete ticket');
    }
  },
};
