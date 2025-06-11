import axios from '../axios';
import {
  NotificationResponse,
  ExtendedNotificationResponse,
  ExtendedNotification,
  MarkAsReadRequest,
} from './types';

/**
 * 알림 목록 조회
 */
export const getNotifications = async (): Promise<NotificationResponse> => {
  const response = await axios.get<NotificationResponse>('/notifications');
  return response.data;
};

/**
 * 알림 읽음 처리
 */
export const markNotificationAsRead = async (id: number): Promise<void> => {
  await axios.patch(`/notifications/${id}/read`);
};

/**
 * 모든 알림 읽음 처리
 */
export const markAllAsRead = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  const response = await axios.post('/notifications/mark-all-read');
  return response.data;
};

/**
 * 알림 삭제
 */
export const deleteNotification = async (id: number): Promise<void> => {
  await axios.delete(`/notifications/${id}`);
};

/**
 * 확장된 알림 목록 조회 (페이지네이션 지원)
 */
export const getExtendedNotifications = async (
  page: number = 1,
  limit: number = 10
): Promise<ExtendedNotificationResponse> => {
  const response = await axios.get<ExtendedNotificationResponse>('/notifications', {
    params: { page, limit },
  });
  return response.data;
};

/**
 * 읽지 않은 알림 수 조회
 */
export const getUnreadNotificationCount = async (): Promise<number> => {
  const response = await axios.get<{ count: number }>('/notifications/count-unread');
  return response.data.count;
};

/**
 * 확장된 알림 읽음 처리
 */
export const updateNotification = async (
  id: number,
  isRead: boolean
): Promise<ExtendedNotification> => {
  const response = await axios.patch<ExtendedNotification>(`/notifications/${id}`, {
    isRead,
  } as MarkAsReadRequest);
  return response.data;
};

/**
 * 모든 알림 삭제
 */
export const deleteAllNotifications = async (): Promise<void> => {
  await axios.delete('/notifications');
};
