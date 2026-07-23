'use client';

import { FormEvent, useEffect, useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

import { PageHeader } from '@/components/custom/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  chatKeys,
  useChatConversations,
  useChatMessages,
  useSendChatMessage,
  type ChatConversation,
  type ChatMessage,
} from '@/stores/queries/chat.query';

function formatTime(value: string) {
  return new Date(value).toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
  });
}

function ConversationList({
  conversations,
  activeId,
  onSelect,
}: {
  conversations: ChatConversation[];
  activeId?: string;
  onSelect: (id: string) => void;
}) {
  if (conversations.length === 0) {
    return (
      <div className="flex h-full items-center justify-center px-4 text-sm text-muted-foreground">
        Chưa có hội thoại khách hàng.
      </div>
    );
  }

  return (
    <div className="divide-y divide-border/60">
      {conversations.map((conversation) => {
        const preview = conversation.messages?.[0];
        const title = conversation.user?.name ?? 'Khách hàng';
        const subtitle = preview?.content ?? conversation.venue?.name ?? 'Hội thoại mới';

        return (
          <button
            key={conversation.id}
            type="button"
            onClick={() => onSelect(conversation.id)}
            className={cn(
              'flex w-full flex-col gap-1 px-4 py-3 text-left transition-colors hover:bg-muted/60',
              activeId === conversation.id && 'bg-brand-50',
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="truncate font-medium text-heading">{title}</span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatTime(conversation.lastMessageAt)}
              </span>
            </div>
            <p className="truncate text-sm text-muted-foreground">{subtitle}</p>
          </button>
        );
      })}
    </div>
  );
}

function MessagePanel({ conversationId }: { conversationId: string }) {
  const queryClient = useQueryClient();
  const { data: messages = [], isLoading } = useChatMessages(conversationId);
  const sendMessage = useSendChatMessage(conversationId);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    const interval = window.setInterval(() => {
      void queryClient.invalidateQueries({ queryKey: chatKeys.messages(conversationId) });
    }, 5000);

    return () => window.clearInterval(interval);
  }, [conversationId, queryClient]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content || sendMessage.isPending) return;
    await sendMessage.mutateAsync(content);
    setDraft('');
  };

  if (isLoading) {
    return <Skeleton className="h-full min-h-96 w-full rounded-xl" />;
  }

  return (
    <div className="flex h-full min-h-96 flex-col rounded-xl border border-border/70 bg-card shadow-sm">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((message: ChatMessage) => (
          <div key={message.id} className="rounded-lg bg-muted/50 px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-heading">{message.sender.name}</span>
              <span className="text-xs text-muted-foreground">{formatTime(message.createdAt)}</span>
            </div>
            <p className="mt-1 text-sm text-foreground">{message.content}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 border-t border-border/70 p-3">
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Trả lời khách hàng..."
          disabled={sendMessage.isPending}
        />
        <Button type="submit" disabled={sendMessage.isPending || !draft.trim()}>
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
}

export function ChatPage() {
  const [activeConversationId, setActiveConversationId] = useState<string>();
  const { data: conversations = [], isLoading } = useChatConversations();
  const activeConversation = conversations.find((row) => row.id === activeConversationId);

  useEffect(() => {
    if (!activeConversationId && conversations[0]?.id) {
      setActiveConversationId(conversations[0].id);
    }
  }, [activeConversationId, conversations]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 lg:px-8 lg:py-8">
      <PageHeader
        title="Chat khách hàng"
        description="Hỗ trợ khách hàng theo từng cơ sở"
        icon={MessageCircle}
      />

      <div className="grid min-h-[32rem] gap-4 lg:grid-cols-[18rem_1fr]">
        <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-14 w-full" />
              ))}
            </div>
          ) : (
            <ConversationList
              conversations={conversations}
              activeId={activeConversationId}
              onSelect={setActiveConversationId}
            />
          )}
        </div>

        <div>
          {activeConversationId ? (
            <div className="space-y-3">
              {activeConversation ? (
                <div className="rounded-xl border border-border/70 bg-card px-4 py-3 shadow-sm">
                  <p className="font-medium text-heading">{activeConversation.user?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {activeConversation.venue?.name ?? activeConversation.venueId}
                  </p>
                </div>
              ) : null}
              <MessagePanel conversationId={activeConversationId} />
            </div>
          ) : (
            <div className="flex h-full min-h-96 items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/20 px-6 text-center text-muted-foreground">
              Chọn hội thoại để bắt đầu trả lời.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
