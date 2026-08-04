'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { chatService, type ChatMessage } from '@/stores/service/chat.service';

import { chatKeys } from './keys';

function appendChatMessage(
  current: ChatMessage[] | undefined,
  message: ChatMessage,
): ChatMessage[] {
  if (current?.some((row) => row.id === message.id)) return current;
  return [...(current ?? []), message];
}

export const useSendChatMessage = (conversationId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: string) => {
      const response = await chatService.sendMessage(conversationId, content);
      return response.data;
    },
    onSuccess: (message: ChatMessage) => {
      queryClient.setQueryData<ChatMessage[]>(chatKeys.messages(conversationId), (current) =>
        appendChatMessage(current, message),
      );
      void queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
    },
  });
};
