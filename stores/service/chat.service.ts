import { apiRequest } from '@/stores/api/api-request';

export type ChatUser = {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string | null;
  role?: string;
};

export type ChatVenue = {
  id: string;
  name: string;
  location: string;
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender: ChatUser;
};

export type ChatConversation = {
  id: string;
  userId: string;
  venueId: string;
  lastMessageAt: string;
  createdAt: string;
  user?: ChatUser;
  venue?: ChatVenue;
  messages?: ChatMessage[];
};

export type ChatConversationsResponse = {
  statusCode: number;
  message: string;
  data: ChatConversation[];
};

export type ChatMessagesResponse = {
  statusCode: number;
  message: string;
  data: ChatMessage[];
};

export type ChatMessageResponse = {
  statusCode: number;
  message: string;
  data: ChatMessage;
};

export const chatService = {
  listConversations: () =>
    apiRequest<ChatConversationsResponse>('/chat/conversations', { method: 'GET' }),

  getMessages: (conversationId: string) =>
    apiRequest<ChatMessagesResponse>(`/chat/conversations/${conversationId}/messages`, {
      method: 'GET',
    }),

  sendMessage: (conversationId: string, content: string) =>
    apiRequest<ChatMessageResponse>(`/chat/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: { content },
    }),
};
