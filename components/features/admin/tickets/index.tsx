'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { PageHeader } from '@/components/custom/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ISupportTicket, SupportTicketStatus } from '@/stores/api/types';
import { useSupportTickets, useUpdateSupportTicket } from '@/stores/queries/support-ticket';

const STATUS_LABEL: Record<SupportTicketStatus, string> = {
  open: 'Mở',
  in_progress: 'Đang xử lý',
  resolved: 'Đã xử lý',
};

const STATUS_ITEMS: Record<SupportTicketStatus, string> = STATUS_LABEL;

export function AdminTicketsPage() {
  const { data: tickets = [], isLoading } = useSupportTickets({ limit: '100' });
  const updateMutation = useUpdateSupportTicket();
  const [notes, setNotes] = useState<Record<string, string>>({});

  const handleUpdate = async (id: string, status: SupportTicketStatus) => {
    try {
      await updateMutation.mutateAsync({
        id,
        body: {
          status,
          adminNote: notes[id]?.trim() || undefined,
        },
      });
      toast.success('Đã cập nhật ticket');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không cập nhật được');
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 lg:px-8 lg:py-8">
      <PageHeader
        title="Hỗ trợ"
        description="Danh sách support tickets — admin cập nhật status/note."
      />

      <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
        {isLoading ? (
          <Skeleton className="m-4 h-32 w-full" />
        ) : tickets.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-muted-foreground">Chưa có ticket.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Loại</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead>Người gửi</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ghi chú admin</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket: ISupportTicket) => (
                <TableRow key={ticket.id}>
                  <TableCell>{ticket.type}</TableCell>
                  <TableCell className="max-w-xs truncate">{ticket.description}</TableCell>
                  <TableCell>{ticket.creator?.name ?? ticket.creatorId}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{STATUS_LABEL[ticket.status]}</Badge>
                  </TableCell>
                  <TableCell className="min-w-48">
                    <Textarea
                      className="min-h-16"
                      placeholder="Admin note…"
                      value={notes[ticket.id] ?? ticket.adminNote ?? ''}
                      onChange={(event) =>
                        setNotes((current) => ({ ...current, [ticket.id]: event.target.value }))
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Label className="sr-only">Status</Label>
                      <Select
                        value={ticket.status}
                        onValueChange={(value) =>
                          handleUpdate(ticket.id, value as SupportTicketStatus)
                        }
                        items={STATUS_ITEMS}
                      >
                        <SelectTrigger className="h-8 w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Mở</SelectItem>
                          <SelectItem value="in_progress">Đang xử lý</SelectItem>
                          <SelectItem value="resolved">Đã xử lý</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdate(ticket.id, ticket.status)}
                      >
                        Lưu note
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
