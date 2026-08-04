'use client';

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2Icon, PlusIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { ComboboxCourt } from '@/components/features/bookings/combobox-court';
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
import { Textarea } from '@/components/ui/textarea';
import { showApiErrorToast } from '@/lib/api/handle-api-error';
import { useCreateWalkInBooking } from '@/stores/queries/booking';

const formSchema = z.object({
  customerName: z.string().min(2, { message: 'Nhập tên khách' }),
  customerPhone: z
    .string()
    .min(9, { message: 'Nhập số điện thoại hợp lệ' })
    .max(15, { message: 'Số điện thoại quá dài' }),
  courtId: z.string().min(1, { message: 'Chọn sân' }),
  date: z.string().min(1, { message: 'Chọn ngày' }),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, { message: 'Nhập giờ bắt đầu HH:mm' }),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, { message: 'Nhập giờ kết thúc HH:mm' }),
  note: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export type WalkInInitialValues = Partial<
  Pick<FormValues, 'courtId' | 'date' | 'startTime' | 'endTime'>
>;

const emptyValues: FormValues = {
  customerName: '',
  customerPhone: '',
  courtId: '',
  date: '',
  startTime: '',
  endTime: '',
  note: '',
};

function BookingWalkInForm({
  onClose,
  initialValues,
}: {
  onClose: () => void;
  initialValues?: WalkInInitialValues;
}) {
  const createWalkInMutation = useCreateWalkInBooking();
  const isSaving = createWalkInMutation.isPending;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { ...emptyValues, ...initialValues },
  });

  useEffect(() => {
    form.reset({ ...emptyValues, ...initialValues });
  }, [form, initialValues]);

  const handleSubmit = async (values: FormValues) => {
    try {
      await createWalkInMutation.mutateAsync({
        customerName: values.customerName.trim(),
        customerPhone: values.customerPhone.trim(),
        items: [
          {
            courtId: values.courtId,
            date: values.date,
            startTime: values.startTime,
            endTime: values.endTime,
          },
        ],
        note: values.note?.trim() || undefined,
      });
      toast.success('Tạo đặt sân walk-in thành công');
      onClose();
    } catch (error) {
      showApiErrorToast(error, 'Không tạo được đặt sân');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="customerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Tên khách <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="VD: Nguyễn Văn A" autoFocus {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="customerPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Số điện thoại <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="VD: 0901234567" inputMode="tel" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="courtId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Sân <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <ComboboxCourt value={field.value} onChange={field.onChange} />
              </FormControl>
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

        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ghi chú</FormLabel>
              <FormControl>
                <Textarea placeholder="Ghi chú thêm (tuỳ chọn)" className="min-h-14" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Huỷ
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving && <Loader2Icon className="size-3.5 animate-spin" />}
            {isSaving ? 'Đang lưu…' : 'Lưu đặt sân'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

/** Dialog controlled — calendar hoặc parent giữ state. */
export function BookingCreateDialog({
  open,
  onOpenChange,
  initialValues,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: WalkInInitialValues;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Tạo đặt sân walk-in</DialogTitle>
          <DialogDescription>
            Tạo booking cho khách tại quầy. Chỉ cần tên và số điện thoại, không cần email.
          </DialogDescription>
        </DialogHeader>
        <BookingWalkInForm onClose={() => onOpenChange(false)} initialValues={initialValues} />
      </DialogContent>
    </Dialog>
  );
}

/** Dialog + trigger — trang bookings. */
export const BookingsCreateDialog = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>
        <PlusIcon className="size-3.5" />
        Thêm đặt sân
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Tạo đặt sân walk-in</DialogTitle>
          <DialogDescription>
            Tạo booking cho khách tại quầy. Chỉ cần tên và số điện thoại, không cần email.
          </DialogDescription>
        </DialogHeader>
        <BookingWalkInForm onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};
