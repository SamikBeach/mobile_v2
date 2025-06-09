export interface Feedback {
  id: number;
  title: string;
  content: string;
  type: 'bug' | 'feature' | 'improvement' | 'other';
  status: 'pending' | 'in_progress' | 'resolved' | 'rejected';
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFeedbackDto {
  title: string;
  content: string;
  type: 'bug' | 'feature' | 'improvement' | 'other';
}

export interface UpdateFeedbackDto {
  title?: string;
  content?: string;
  type?: 'bug' | 'feature' | 'improvement' | 'other';
  status?: 'pending' | 'in_progress' | 'resolved' | 'rejected';
}
