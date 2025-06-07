export interface ChatMessage {
  id: number;
  content: string;
  senderId: number;
  receiverId: number;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChatRoom {
  id: number;
  participants: number[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SendMessageDto {
  receiverId: number;
  content: string;
}
