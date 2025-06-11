export interface Notification {
  id: number;
  type: string;
  title: string;
  content?: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  sourceId?: number;
  sourceType?: string;
  imageUrl?: string;
  linkUrl?: string;

  // 확장된 정보
  user?: {
    id: number;
    username: string;
    profileImage?: string;
  };
  actor?: {
    id: number;
    username: string;
    profileImage?: string;
  };
  review?: any;
  comment?: any;
  library?: any;
  book?: any;
  details?: any;

  // 프론트엔드 전용 필드 (UI 표시용)
  timestamp?: string; // createdAt을 포맷팅한 값
}

export interface NotificationBadgeProps {
  count?: number;
}

export interface NotificationTypeBadgeProps {
  type: string;
}

export interface PostTypeBadgeProps {
  sourceType?: string;
}
