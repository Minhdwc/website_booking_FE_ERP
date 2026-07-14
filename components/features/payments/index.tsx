'use client';

import { MoreHorizontalIcon, ReceiptIcon, SearchIcon, Trash2Icon, XIcon } from 'lucide-react';
import { toast } from 'sonner';

import { PaymentsCreateDialog } from '@/components/features/payments/dialog-create';
import { DialogEditPayment } from '@/components/features/payments/dialog-edit';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { IPayment, PaymentMethod, PaymentStatus } from '@/stores/api/types';
import { useErpUiStore } from '@/stores/index.store';
import { useDeletePayment, usePayments } from '@/stores/queries/payment.query';

const formatPrice = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const methodLabel: Record<PaymentMethod, string> = {
  cash: 'Tiền mặt',
  bank_transfer: 'Chuyển khoản',
  credit_card: 'Thẻ',
  vnpay: 'VNPay',
};

const statusLabel: Record<PaymentStatus, string> = {
  pending: 'Chờ thanh toán',
  paid: 'Đã thanh toán',
  failed: 'Thất bại',
  completed: 'Hoàn tất',
};

const statusVariant: Record<PaymentStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  pending: 'secondary',
  paid: 'default',
  failed: 'destructive',
  completed: 'outline',
};

const matchesSearch = (payment: IPayment, q: string) => {
  const haystack = [
    payment.bookingId,
    payment.method,
    payment.status,
    String(payment.amount),
    payment.id,
  ]
    .join(' ')
    .toLowerCase();
  return haystack.includes(q.toLowerCase());
};

export const PaymentsPage = () => {
  const paymentSearch = useErpUiStore((state) => state.paymentSearch);
  const setPaymentSearch = useErpUiStore((state) => state.setPaymentSearch);
  const deletePaymentMutation = useDeletePayment();

  const {
    data: paymentsData,
    isSuccess,
    isLoading,
    isError,
    error,
  } = usePayments(paymentSearch.trim() ? { search: paymentSearch.trim() } : undefined);
  const payments = isSuccess ? paymentsData : [];

  const filtered = paymentSearch.trim()
    ? payments.filter((payment: IPayment) => matchesSearch(payment, paymentSearch.trim()))
    : payments;

  const isNotEmpty = filtered.length > 0;
  const isSearching = paymentSearch.trim().length > 0;

  const handleDelete = async (paymentId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thanh toán này không?')) return;
    try {
      await deletePaymentMutation.mutateAsync(paymentId);
      toast.success('Xóa thanh toán thành công');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không xóa được thanh toán');
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Thanh toán</h1>
            {payments.length > 0 && (
              <Badge variant="secondary" className="font-semibold tabular-nums">
                {filtered.length}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Theo dõi giao dịch thanh toán gắn với các đặt sân.
          </p>
        </div>

        <PaymentsCreateDialog />
      </header>

      <InputGroup className="max-w-sm bg-card">
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupInput
          placeholder="Tìm theo booking, phương thức…"
          value={paymentSearch}
          onChange={(event) => setPaymentSearch(event.target.value)}
        />
        {isSearching && (
          <InputGroupAddon align="inline-end">
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label="Xoá tìm kiếm"
              onClick={() => setPaymentSearch('')}
            >
              <XIcon />
            </Button>
          </InputGroupAddon>
        )}
      </InputGroup>

      {isError && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error instanceof Error ? error.message : 'Không tải được danh sách thanh toán'}
        </div>
      )}

      {isLoading && !isError && (
        <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
          <div className="space-y-0 divide-y divide-border/40">
            {[0, 1, 2, 3].map((row) => (
              <div key={row} className="flex items-center gap-4 px-4 py-4">
                <Skeleton className="size-9 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isLoading && !isError && isNotEmpty && (
        <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/60 bg-muted/40">
                <TableHead className="px-4 py-3 text-xs">Giao dịch</TableHead>
                <TableHead className="hidden px-4 py-3 text-xs md:table-cell">Booking</TableHead>
                <TableHead className="px-4 py-3 text-xs">Số tiền</TableHead>
                <TableHead className="px-4 py-3 text-xs">Phương thức</TableHead>
                <TableHead className="px-4 py-3 text-xs">Trạng thái</TableHead>
                <TableHead className="w-14 px-4 py-3 text-right text-xs">
                  <span className="sr-only">Thao tác</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((payment: IPayment) => (
                <TableRow
                  key={payment.id}
                  className="group border-b border-border/40 last:border-b-0"
                >
                  <TableCell className="max-w-[180px] px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/50 text-muted-foreground">
                        <ReceiptIcon className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-mono text-xs text-muted-foreground">
                          {payment.id.slice(0, 8)}…
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {new Date(payment.createdAt).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden max-w-[160px] truncate px-4 py-3.5 font-mono text-xs text-muted-foreground md:table-cell">
                    {payment.bookingId.slice(0, 8)}…
                  </TableCell>
                  <TableCell className="px-4 py-3.5 text-sm font-medium tabular-nums">
                    {formatPrice(payment.amount)}
                  </TableCell>
                  <TableCell className="px-4 py-3.5 text-sm">
                    {methodLabel[payment.method as PaymentMethod]}
                  </TableCell>
                  <TableCell className="px-4 py-3.5">
                    <Badge variant={statusVariant[payment.status as PaymentStatus]}>
                      {statusLabel[payment.status as PaymentStatus]}
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
                            className="text-muted-foreground opacity-60 transition-opacity group-hover:opacity-100 aria-expanded:opacity-100"
                          />
                        }
                      >
                        <MoreHorizontalIcon className="size-4" />
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-44 gap-0 p-1">
                        <DialogEditPayment paymentId={payment.id} />
                        <Separator className="my-1" />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start gap-2 font-normal text-destructive hover:text-destructive"
                          onClick={() => handleDelete(payment.id)}
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

      {!isLoading && !isError && !isNotEmpty && (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center">
          <div className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
            {isSearching ? <SearchIcon className="size-5" /> : <ReceiptIcon className="size-5" />}
          </div>
          <h2 className="mt-4 text-base font-semibold text-foreground">
            {isSearching ? 'Không tìm thấy thanh toán nào' : 'Chưa có thanh toán nào'}
          </h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            {isSearching
              ? `Không có kết quả khớp với “${paymentSearch}”.`
              : 'Tạo giao dịch thanh toán gắn với đặt sân.'}
          </p>
          {isSearching ? (
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setPaymentSearch('')}
            >
              <XIcon className="size-3.5" />
              Xoá tìm kiếm
            </Button>
          ) : (
            <div className="mt-4">
              <PaymentsCreateDialog />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
