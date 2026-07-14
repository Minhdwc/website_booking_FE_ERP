'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { ExternalLinkIcon, Loader2Icon, PencilIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import type { PaymentMethod, PaymentStatus } from '@/stores/api/types';
import {
  useCreateVnpayUrl,
  usePayment,
  useUpdatePayment,
} from '@/stores/queries/payment.query';

const formSchema = z.object({
  method: z.enum(['credit_card', 'cash', 'bank_transfer', 'vnpay']),
  status: z.enum(['pending', 'paid', 'failed', 'completed']),
});

type FormValues = z.infer<typeof formSchema>;

const methodOptions: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Tiền mặt' },
  { value: 'bank_transfer', label: 'Chuyển khoản' },
  { value: 'credit_card', label: 'Thẻ' },
  { value: 'vnpay', label: 'VNPay' },
];

const statusOptions: { value: PaymentStatus; label: string }[] = [
  { value: 'pending', label: 'Chờ thanh toán' },
  { value: 'paid', label: 'Đã thanh toán' },
  { value: 'failed', label: 'Thất bại' },
  { value: 'completed', label: 'Hoàn tất' },
];

const formatPrice = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

export const DialogEditPayment = ({ paymentId }: { paymentId: string }) => {
  const [open, setOpen] = useState(false);
  const { data: payment, isLoading, isError, error } = usePayment(paymentId);
  const updatePaymentMutation = useUpdatePayment();
  const createVnpayUrlMutation = useCreateVnpayUrl();
  const isSaving = updatePaymentMutation.isPending;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { method: 'cash', status: 'pending' },
    values: payment
      ? { method: payment.method, status: payment.status }
      : undefined,
  });

  const method = form.watch('method');

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) form.reset();
  };

  const handleSubmit = async (values: FormValues) => {
    if (!payment) return;

    try {
      await updatePaymentMutation.mutateAsync({
        id: payment.id,
        body: { method: values.method, status: values.status },
      });
      toast.success('Cập nhật thanh toán thành công');
      handleOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không cập nhật được thanh toán.');
    }
  };

  const handleVnpay = async () => {
    if (!payment) return;
    try {
      const response = await createVnpayUrlMutation.mutateAsync(payment.id);
      const url = response.data.paymentUrl;

      if (!url) {
        toast.error('Không nhận được URL VNPay');
        return;
      }
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không tạo được URL VNPay');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 font-normal" />
        }
      >
        <PencilIcon className="size-3.5 text-muted-foreground" />
        Chỉnh sửa
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cập nhật thanh toán</DialogTitle>
          <DialogDescription>
            Đổi phương thức / trạng thái. Có thể mở cổng VNPay nếu đang dùng VNPay.
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="space-y-3 py-2">
            <Skeleton className="h-9 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        )}

        {isError && (
          <p className="py-6 text-center text-sm text-destructive">
            {error instanceof Error ? error.message : 'Không tải được thanh toán'}
          </p>
        )}

        {payment && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5 text-sm">
                <p className="font-medium text-foreground">{formatPrice(payment.amount)}</p>
                <p className="mt-1 text-muted-foreground">Booking: {payment.bookingId}</p>
              </div>

              <FormField
                control={form.control}
                name="method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phương thức</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {methodOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trạng thái</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {(method === 'vnpay' || payment.method === 'vnpay') && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={createVnpayUrlMutation.isPending}
                  onClick={handleVnpay}
                >
                  {createVnpayUrlMutation.isPending ? (
                    <Loader2Icon className="size-3.5 animate-spin" />
                  ) : (
                    <ExternalLinkIcon className="size-3.5" />
                  )}
                  Mở cổng VNPay
                </Button>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                  Huỷ
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2Icon className="size-3.5 animate-spin" />}
                  {isSaving ? 'Đang lưu…' : 'Lưu thay đổi'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};
