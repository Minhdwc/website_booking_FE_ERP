'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { chatService, type ChatConversation, type ChatMessage } from '@/stores/service/chat.service';

export const chatKeys = {
  all: ['chat'] as const,
  conversations: () => [...chatKeys.all, 'conversations'] as const,
  messages: (conversationId: string) => [...chatKeys.all, 'messages', conversationId] as const,
};

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

export const useSendChatMessage = (conversationId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: string) => {
      const response = await chatService.sendMessage(conversationId, content);
      return response.data;
    },
    onSuccess: (message: ChatMessage) => {
      queryClient.setQueryData<ChatMessage[]>(chatKeys.messages(conversationId), (current) => [
        ...(current ?? []),
        message,
      ]);
      void queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
    },
  });
};

export type { ChatConversation, ChatMessage };
