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

/**
 * 피드백 상세 정보 DTO
 */
export interface FeedbackDetailDto {
  id: number;
  content: string;
  email: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  isResolved: boolean;
  userId: number | null;
  user: {
    id: number;
    username: string;
    email: string;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 피드백 목록 응답 DTO
 */
export interface FeedbackListResponseDto {
  data: FeedbackDetailDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
