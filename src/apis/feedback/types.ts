/**
 * 피드백 제출 DTO
 */
export interface FeedbackDto {
  content: string;
}

/**
 * 피드백 응답 DTO
 */
export interface FeedbackResponseDto {
  id: number;
  content: string;
  email: string | null;
  createdAt: Date;
  message: string;
}

// 기존 타입들 유지 (호환성)
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
