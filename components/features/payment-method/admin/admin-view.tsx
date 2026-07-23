'use client';

import { useState } from 'react';
import { MoreHorizontalIcon, SearchIcon, Trash2Icon, WalletCardsIcon, XIcon } from 'lucide-react';
import { toast } from 'sonner';

import { DialogCreatePaymentMethod } from '@/components/features/payment-method/admin/dialog-create';
import { DialogEditPaymentMethod } from '@/components/features/payment-method/admin/dialog-edit';
import { EmptyState } from '@/components/custom/empty-state';
import { ErrorState } from '@/components/custom/error-state';
import { PageHeader } from '@/components/custom/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
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
import { IPaymentMethod } from '@/stores/api/types';
import { useDeletePaymentMethod, usePaymentMethods } from '@/stores/queries/payment-method.query';

export const AdminPaymentMethodView = () => {
  const [search, setSearch] = useState('');
  const {
    data: methods = [],
    isLoading,
    isError,
    error,
    refetch,
  } = usePaymentMethods({
    search: search.trim() || undefined,
    limit: '100',
  });
  const deleteMutation = useDeletePaymentMethod();

  const handleDelete = async (item: IPaymentMethod) => {
    if (!window.confirm(`Xóa phương thức "${item.name}"?`)) return;
    try {
      await deleteMutation.mutateAsync(item.id);
      toast.success('Đã xóa phương thức');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message || 'Không xóa được phương thức');
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6 lg:px-8 lg:py-8">
      <PageHeader
        title="Phương thức thanh toán"
        description="Catalog phương thức — staff đăng ký tài khoản nhận tiền theo từng cơ sở"
        icon={WalletCardsIcon}
        actions={
          <>
            {methods.length > 0 && (
              <Badge variant="secondary" className="font-semibold tabular-nums">
                {methods.length}
              </Badge>
            )}
            <DialogCreatePaymentMethod />
          </>
        }
      />

      <InputGroup className="h-9 w-full max-w-sm rounded-lg border-border/70 bg-card shadow-sm">
        <InputGroupAddon>
          <SearchIcon className="size-3.5" />
        </InputGroupAddon>
        <InputGroupInput
          placeholder="Tìm theo tên hoặc code…"
          className="text-sm"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        {search.trim() && (
          <InputGroupAddon align="inline-end">
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label="Xoá tìm kiếm"
              onClick={() => setSearch('')}
            >
              <XIcon />
            </Button>
          </InputGroupAddon>
        )}
      </InputGroup>

      {isError && (
        <ErrorState
          title="Không tải được danh sách"
          description={
            error instanceof Error ? error.message : 'Không tải được danh sách phương thức'
          }
          onRetry={() => refetch()}
        />
      )}

      {isLoading && (
        <div className="space-y-3 rounded-xl border border-border/60 bg-card p-4 shadow-sm">
          {[0, 1, 2].map((row) => (
            <Skeleton key={row} className="h-10 w-full" />
          ))}
        </div>
      )}

      {!isLoading && !isError && methods.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/60 bg-muted/40 hover:bg-muted/40">
                <TableHead className="px-4 py-3 text-xs">Phương thức</TableHead>
                <TableHead className="px-4 py-3 text-xs">Code</TableHead>
                <TableHead className="px-4 py-3 text-xs">Trạng thái</TableHead>
                <TableHead className="w-14 px-4 py-3 text-right text-xs">
                  <span className="sr-only">Thao tác</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {methods.map((item) => (
                <TableRow
                  key={item.id}
                  className="border-b border-border/40 last:border-b-0 transition-colors hover:bg-muted/40"
                >
                  <TableCell className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/50 text-muted-foreground transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600">
                        <WalletCardsIcon className="size-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-heading">{item.name}</p>
                        {item.description && (
                          <p className="line-clamp-1 text-xs text-muted-foreground">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3.5 font-mono text-sm text-muted-foreground">
                    {item.code}
                  </TableCell>
                  <TableCell className="px-4 py-3.5">
                    <Badge variant={item.isActive ? 'default' : 'secondary'}>
                      {item.isActive ? 'Đang mở' : 'Tắt'}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-3 py-3.5 text-right">
                    <Popover>
                      <PopoverTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Mở thao tác"
                            className="text-muted-foreground"
                          />
                        }
                      >
                        <MoreHorizontalIcon className="size-4" />
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-44 gap-0 p-1">
                        <DialogEditPaymentMethod item={item} />
                        <Button
                          variant="ghost"
                          className="h-9 w-full justify-start rounded-lg px-3 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(item)}
                        >
                          <Trash2Icon className="mr-2 size-3.5" />
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

      {!isLoading && !isError && methods.length === 0 && (
        <EmptyState
          icon={WalletCardsIcon}
          title={search.trim() ? 'Không tìm thấy phương thức' : 'Chưa có phương thức'}
          description={
            search.trim()
              ? `Không có phương thức khớp với "${search}".`
              : 'Thêm phương thức đầu tiên để staff có thể đăng ký tài khoản nhận tiền.'
          }
        />
      )}
    </div>
  );
};
