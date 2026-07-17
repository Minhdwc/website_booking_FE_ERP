'use client';

import { MoreHorizontalIcon, StarIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate } from '@/lib/format';
import { IReview } from '@/stores/api/types';
import { useDeleteReview, useReviews } from '@/stores/queries/review.query';
import { cn } from '@/lib/utils';

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, index) => (
        <StarIcon
          key={index}
          className={cn(
            'size-3.5',
            index < rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30',
          )}
        />
      ))}
    </div>
  );
}

export function ReviewsPage() {
  const { data, isSuccess, isLoading, isError, error } = useReviews({ limit: '100' });
  const reviews = isSuccess ? data : [];
  const deleteMutation = useDeleteReview();

  const handleDelete = async (id: string) => {
    if (!window.confirm('Xóa đánh giá này?')) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Đã xóa đánh giá');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không xóa được đánh giá');
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
      <header className="space-y-1">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-bold tracking-tight text-heading">Đánh giá</h1>
          {reviews.length > 0 && (
            <Badge variant="secondary" className="font-semibold tabular-nums">
              {reviews.length}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">Kiểm duyệt đánh giá của khách trên các sân.</p>
      </header>

      {isError && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error instanceof Error ? error.message : 'Không tải được danh sách đánh giá'}
        </div>
      )}

      {isLoading && !isError && (
        <div className="space-y-3 rounded-xl border bg-card p-4">
          {[0, 1, 2].map((row) => (
            <Skeleton key={row} className="h-12 w-full" />
          ))}
        </div>
      )}

      {!isLoading && !isError && reviews.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/60 bg-card hover:bg-transparent">
                <TableHead className="px-4 text-xs">Khách</TableHead>
                <TableHead className="px-4 text-xs">Sân</TableHead>
                <TableHead className="px-4 text-xs">Rating</TableHead>
                <TableHead className="hidden px-4 text-xs md:table-cell">Nhận xét</TableHead>
                <TableHead className="px-4 text-xs">Ngày</TableHead>
                <TableHead className="w-14 px-4 text-right text-xs">
                  <span className="sr-only">Thao tác</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.map((review: IReview) => (
                <TableRow key={review.id} className="group hover:bg-foreground/3">
                  <TableCell className="px-4 py-3.5">
                    <p className="font-medium">{review.user?.name ?? 'Khách'}</p>
                    <p className="text-xs text-muted-foreground">{review.user?.email ?? review.userId}</p>
                  </TableCell>
                  <TableCell className="px-4 py-3.5 text-sm text-muted-foreground">
                    {review.field?.name ?? '—'}
                  </TableCell>
                  <TableCell className="px-4 py-3.5">
                    <Stars rating={review.rating} />
                  </TableCell>
                  <TableCell className="hidden max-w-xs truncate px-4 py-3.5 text-sm text-muted-foreground md:table-cell">
                    {review.comment || '—'}
                  </TableCell>
                  <TableCell className="px-4 py-3.5 text-sm tabular-nums">
                    {formatDate(review.createdAt)}
                  </TableCell>
                  <TableCell className="px-3 py-3.5 text-right">
                    <Popover>
                      <PopoverTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-muted-foreground opacity-60 group-hover:opacity-100"
                          />
                        }
                      >
                        <MoreHorizontalIcon className="size-4" />
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-36 gap-0 p-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start gap-2 font-normal text-destructive hover:text-destructive"
                          onClick={() => handleDelete(review.id)}
                        >
                          <Trash2Icon className="size-3.5" />
                          Xóa
                        </Button>
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {!isLoading && !isError && reviews.length === 0 && (
        <div className="rounded-xl border border-dashed bg-card px-6 py-12 text-center">
          <h2 className="text-base font-semibold text-heading">Chưa có đánh giá</h2>
          <p className="mt-1 text-sm text-muted-foreground">Khi khách viết đánh giá, danh sách sẽ hiện ở đây.</p>
        </div>
      )}
    </div>
  );
}
