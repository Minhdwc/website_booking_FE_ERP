'use client';

import { useState } from 'react';
import { MoreHorizontalIcon, SearchIcon, Trash2Icon, WalletCardsIcon, XIcon } from 'lucide-react';
import { toast } from 'sonner';

import { DialogCreatePaymentMethod } from '@/components/features/payment-method/admin/dialog-create';
import { DialogEditPaymentMethod } from '@/components/features/payment-method/admin/dialog-edit';
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
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-heading">
              Phương thức thanh toán
            </h1>
            {methods.length > 0 && (
              <Badge variant="secondary" className="font-semibold tabular-nums">
                {methods.length}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Catalog phương thức — staff đăng ký tài khoản nhận tiền theo từng cơ sở.
          </p>
        </div>
        <DialogCreatePaymentMethod />
      </header>

      <InputGroup className="max-w-sm bg-surface">
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupInput
          placeholder="Tìm theo tên hoặc code…"
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
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error instanceof Error ? error.message : 'Không tải được danh sách'}
        </div>
      )}

      {isLoading && (
        <div className="space-y-3 rounded-xl border border-border/60 bg-surface p-4">
          {[0, 1, 2].map((row) => (
            <Skeleton key={row} className="h-10 w-full" />
          ))}
        </div>
      )}

      {!isLoading && !isError && methods.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border/60 bg-surface shadow-sm">
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
                <TableRow key={item.id} className="border-b border-border/40 last:border-b-0">
                  <TableCell className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/50 text-muted-foreground">
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

      {!isLoading && !isError && methods.length === 0 && (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-border bg-surface px-6 py-12 text-center">
          <div className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <WalletCardsIcon className="size-5" />
          </div>
          <h2 className="mt-4 text-base font-semibold text-heading">Chưa có phương thức</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Thêm phương thức đầu tiên để staff có thể đăng ký tài khoản nhận tiền.
          </p>
        </div>
      )}
    </div>
  );
};
