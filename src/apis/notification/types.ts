export enum NotificationType {
  COMMENT = 'comment',
  LIBRARY_UPDATE = 'library_update',
  LIBRARY_SUBSCRIBE = 'library_subscribe',
  LIKE = 'like',
  FOLLOW = 'follow',
  COMMENT_LIKE = 'comment_like',
  SYSTEM = 'system',
}

export interface UserInfoDto {
  id: number;
  username: string;
  profileImage?: string;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

// 확장된 알림 타입 (src_frontend와 호환)
export interface ExtendedNotification {
  id: number;
  type: NotificationType;
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
  user?: UserInfoDto;
  actor?: UserInfoDto;
  review?: any;
  comment?: any;
  library?: any;
  book?: any;
  details?: any;

  // 프론트엔드 전용 필드 (UI 표시용)
  timestamp?: string; // createdAt을 포맷팅한 값
}

export interface CreateNotificationDto {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface NotificationResponse {
  notifications: Notification[];
  total: number;
  unreadCount: number;
}

export interface ExtendedNotificationResponse {
  notifications: ExtendedNotification[];
  total: number;
}

export interface MarkAsReadRequest {
  isRead: boolean;
}
