'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2Icon, PencilIcon } from 'lucide-react';
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
import { BookingStatus } from '@/stores/api/types';
import { useBooking, useUpdateBooking } from '@/stores/queries/booking.query';

const formSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']),
});

type FormValues = z.infer<typeof formSchema>;

const statusOptions: { value: BookingStatus; label: string }[] = [
  { value: 'pending', label: 'Chờ xác nhận' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'cancelled', label: 'Đã huỷ' },
  { value: 'completed', label: 'Hoàn thành' },
];

export const DialogEditBooking = ({ bookingId }: { bookingId: string }) => {
  const [open, setOpen] = useState(false);
  const { data: booking, isLoading, isError, error } = useBooking(bookingId);
  const updateBookingMutation = useUpdateBooking();
  const isSaving = updateBookingMutation.isPending;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { status: 'pending' },
    values: booking ? { status: booking.status } : undefined,
  });

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) form.reset();
  };

  const handleSubmit = async (values: FormValues) => {
    if (!booking) return;

    try {
      await updateBookingMutation.mutateAsync({
        id: booking.id,
        body: { status: values.status },
      });
      toast.success('Cập nhật đặt sân thành công');
      handleOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không cập nhật được đặt sân.');
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
          <DialogTitle>Cập nhật đặt sân</DialogTitle>
          <DialogDescription>Đổi trạng thái booking. Thông tin sân/ngày chỉ xem.</DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="space-y-3 py-2">
            <Skeleton className="h-9 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        )}

        {isError && (
          <p className="py-6 text-center text-sm text-destructive">
            {error instanceof Error ? error.message : 'Không tải được đặt sân'}
          </p>
        )}

        {booking && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5 text-sm">
                <p className="font-medium text-foreground">
                  {booking.field?.name || 'Sân'} · {booking.date}
                </p>
                <p className="mt-1 text-muted-foreground">
                  {booking.user?.name || booking.userId}
                  {booking.timeslot
                    ? ` · ${booking.timeslot.startTime} – ${booking.timeslot.endTime}`
                    : ''}
                </p>
              </div>

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Trạng thái <span className="text-destructive">*</span>
                    </FormLabel>
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
