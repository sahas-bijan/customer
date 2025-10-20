export interface Ticket {
  id: number;
  title: string;
  category: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
  comments: string[];
}

export interface CreateTicketRequest {
  title: string;
  category: string;
  description: string;
}

export interface AddCommentRequest {
  comment: string;
}

export interface UpdateStatusRequest {
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}
