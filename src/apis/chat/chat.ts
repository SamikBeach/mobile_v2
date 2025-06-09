import axios from '../axios';
import { ChatMessage, ChatRoom, SendMessageDto } from './types';

/**
 * 채팅방 목록 조회
 */
export const getChatRooms = async (): Promise<ChatRoom[]> => {
  const response = await axios.get<ChatRoom[]>('/chat/rooms');
  return response.data;
};

/**
 * 특정 채팅방의 메시지 목록 조회
 */
export const getChatMessages = async (roomId: number): Promise<ChatMessage[]> => {
  const response = await axios.get<ChatMessage[]>(`/chat/rooms/${roomId}/messages`);
  return response.data;
};

/**
 * 메시지 전송
 */
export const sendMessage = async (data: SendMessageDto): Promise<ChatMessage> => {
  const response = await axios.post<ChatMessage>('/chat/messages', data);
  return response.data;
};

/**
 * 메시지 읽음 처리
 */
export const markMessageAsRead = async (messageId: number): Promise<void> => {
  await axios.patch(`/chat/messages/${messageId}/read`);
};
