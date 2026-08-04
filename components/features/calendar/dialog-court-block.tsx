'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2Icon } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { showApiErrorToast } from '@/lib/api/handle-api-error';

import { ComboboxCourt } from '@/components/features/bookings/combobox-court';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { courtBlockService } from '@/stores/service/court-block.service';

const formSchema = z.object({
  courtId: z.string().min(1, { message: 'Chọn sân' }),
  date: z.string().min(1, { message: 'Chọn ngày' }),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, { message: 'Nhập giờ bắt đầu HH:mm' }),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, { message: 'Nhập giờ kết thúc HH:mm' }),
  reason: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const defaultValues: FormValues = {
  courtId: '',
  date: '',
  startTime: '',
  endTime: '',
  reason: '',
};

type CourtBlockDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function toIsoDateTime(date: string, time: string) {
  return `${date}T${time}:00.000Z`;
}

export function CourtBlockDialog({ open, onOpenChange }: CourtBlockDialogProps) {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const createMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const startAt = toIsoDateTime(values.date, values.startTime);
      const endAt = toIsoDateTime(values.date, values.endTime);
      return courtBlockService.create(values.courtId, {
        startAt,
        endAt,
        reason: values.reason?.trim() || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['courts'] });
    },
  });

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
    if (!next) {
      form.reset(defaultValues);
    }
  };

  const handleSubmit = async (values: FormValues) => {
    setSaving(true);
    try {
      await createMutation.mutateAsync(values);
      toast.success('Khóa sân thành công');
      handleOpenChange(false);
    } catch (error) {
      showApiErrorToast(error, 'Không khóa được sân. Thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const isSaving = saving || createMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Khóa sân</DialogTitle>
          <DialogDescription>
            Chặn khung giờ để không nhận đặt sân online hoặc walk-in.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lý do</FormLabel>
                  <FormControl>
                    <Textarea placeholder="VD: Bảo trì sân" className="min-h-14" {...field} />
                  </FormControl>
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
                {isSaving ? 'Đang lưu…' : 'Khóa sân'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
