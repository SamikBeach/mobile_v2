import axios from '../axios';
import { NotificationResponse } from './types';

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
export const markAllNotificationsAsRead = async (): Promise<void> => {
  await axios.patch('/notifications/read-all');
};

/**
 * 알림 삭제
 */
export const deleteNotification = async (id: number): Promise<void> => {
  await axios.delete(`/notifications/${id}`);
};
