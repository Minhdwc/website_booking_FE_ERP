'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2Icon, PlusIcon } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSession } from '@/provider/session-provider';
import type { BookingStatus, IField, ITimeslot } from '@/stores/api/types';
import { useCreateBooking } from '@/stores/queries/booking.query';
import { useFields } from '@/stores/queries/field.query';
import { useTimeslots } from '@/stores/queries/timeslot.query';

const formSchema = z.object({
  userId: z.string().min(1, { message: 'Nhập ID khách hàng' }),
  fieldId: z.string().min(1, { message: 'Chọn sân' }),
  timeslotId: z.string().min(1, { message: 'Chọn khung giờ' }),
  date: z.string().min(1, { message: 'Chọn ngày' }),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']),
});

type FormValues = z.infer<typeof formSchema>;

const statusOptions: { value: BookingStatus; label: string }[] = [
  { value: 'pending', label: 'Chờ xác nhận' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'cancelled', label: 'Đã huỷ' },
  { value: 'completed', label: 'Hoàn thành' },
];

export const BookingsCreateDialog = () => {
  const [open, setOpen] = useState(false);
  const { user } = useSession();
  const createBookingMutation = useCreateBooking();
  const fieldsQuery = useFields();
  const timeslotsQuery = useTimeslots();
  const fields = fieldsQuery.isSuccess ? fieldsQuery.data : [];
  const timeslots = timeslotsQuery.isSuccess ? timeslotsQuery.data : [];
  const isSaving = createBookingMutation.isPending;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: user?.id || '',
      fieldId: '',
      timeslotId: '',
      date: '',
      status: 'pending',
    },
  });

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      form.reset({
        userId: user?.id || '',
        fieldId: '',
        timeslotId: '',
        date: '',
        status: 'pending',
      });
    }
  };

  const handleSubmit = async (values: FormValues) => {
    try {
      await createBookingMutation.mutateAsync({
        userId: values.userId.trim(),
        fieldId: values.fieldId,
        timeslotId: values.timeslotId,
        date: values.date,
        status: values.status,
      });
      toast.success('Tạo đặt sân thành công');
      handleOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không tạo được đặt sân. Thử lại.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button size="sm" />}>
        <PlusIcon className="size-3.5" />
        Thêm đặt sân
      </DialogTrigger>

      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Tạo đặt sân</DialogTitle>
          <DialogDescription>
            Chọn sân, khung giờ và ngày để tạo booking mới cho khách.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    ID khách hàng <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="UUID của khách" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fieldId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Sân <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chọn sân" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {fields.map((item: IField) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name}
                          {item.venue?.name ? ` · ${item.venue.name}` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Ngày <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timeslotId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Khung giờ <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Chọn giờ" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeslots.map((slot: ITimeslot) => (
                          <SelectItem key={slot.id} value={slot.id}>
                            {slot.startTime} – {slot.endTime}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Huỷ
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2Icon className="size-3.5 animate-spin" />}
                {isSaving ? 'Đang lưu…' : 'Lưu đặt sân'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
