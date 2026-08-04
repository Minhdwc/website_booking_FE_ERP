'use client';

import { useQuery } from '@tanstack/react-query';

import { chatService } from '@/stores/service/chat.service';

import { chatKeys } from './keys';

export const useChatConversations = (enabled = true) =>
  useQuery({
    queryKey: chatKeys.conversations(),
    queryFn: async () => {
      const response = await chatService.listConversations();
      return response.data;
    },
    enabled,
  });

export const useChatMessages = (conversationId?: string) =>
  useQuery({
    queryKey: chatKeys.messages(conversationId ?? ''),
    queryFn: async () => {
      const response = await chatService.getMessages(conversationId!);
      return response.data;
    },
    enabled: Boolean(conversationId),
  });
