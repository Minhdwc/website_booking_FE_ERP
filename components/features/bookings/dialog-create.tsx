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
import { IField } from '@/stores/api/types';
import { useCreateBooking } from '@/stores/queries/booking.query';
import { useFields } from '@/stores/queries/field.query';

const formSchema = z.object({
  fieldId: z.string().min(1, { message: 'Chọn sân' }),
  date: z.string().min(1, { message: 'Chọn ngày' }),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, { message: 'Nhập giờ bắt đầu HH:mm' }),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, { message: 'Nhập giờ kết thúc HH:mm' }),
});

type FormValues = z.infer<typeof formSchema>;

export const BookingsCreateDialog = () => {
  const [open, setOpen] = useState(false);
  const createBookingMutation = useCreateBooking();
  const fieldsQuery = useFields();
  const fields = fieldsQuery.isSuccess ? fieldsQuery.data : [];
  const isSaving = createBookingMutation.isPending;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fieldId: '',
      date: '',
      startTime: '',
      endTime: '',
    },
  });

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      form.reset({
        fieldId: '',
        date: '',
        startTime: '',
        endTime: '',
      });
    }
  };

  const handleSubmit = async (values: FormValues) => {
    try {
      await createBookingMutation.mutateAsync({
        items: [
          {
            fieldId: values.fieldId,
            date: values.date,
            startTime: values.startTime,
            endTime: values.endTime,
          },
        ],
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
            Chọn sân, ngày và khung giờ. Booking sẽ được tạo dưới tài khoản đang đăng nhập.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Giờ bắt đầu <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Giờ kết thúc <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
