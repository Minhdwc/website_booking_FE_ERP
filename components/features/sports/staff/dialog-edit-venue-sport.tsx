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
import { Textarea } from '@/components/ui/textarea';
import { IVenueSport } from '@/stores/api/types';
import { useUpdateVenueSport } from '@/stores/queries/venue-sport.query';
import { Switch } from '@/components/ui/switch';

const formSchema = z.object({
  isActive: z.boolean(),
  description: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export const DialogEditVenueSport = ({ item }: { item: IVenueSport }) => {
  const [open, setOpen] = useState(false);
  const updateMutation = useUpdateVenueSport();
  const isSaving = updateMutation.isPending;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { isActive: item.isActive, description: item.description || '' },
    values: { isActive: item.isActive, description: item.description || '' },
  });

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) form.reset({ isActive: item.isActive, description: item.description || '' });
  };

  const handleSubmit = async (values: FormValues) => {
    try {
      await updateMutation.mutateAsync({
        id: item.id,
        body: { isActive: values.isActive, description: values.description?.trim() || null },
      });
      toast.success('Cập nhật thành công');
      handleOpenChange(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message || 'Không cập nhật được mô tả');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            className="h-9 w-full justify-start gap-2 rounded-lg px-3 font-normal text-orange-600 hover:bg-orange-50 hover:text-orange-700"
          />
        }
      >
        <PencilIcon className="size-3.5" />
        Chỉnh sửa
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sửa bộ môn</DialogTitle>
          <DialogDescription>
            {item.sport?.name || 'Bộ môn'} — thông tin hiển thị cho khách khi đặt sân.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Số sân, quy mô, ghi chú hoạt động…"
                      className="min-h-24 resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm font-medium">Đang hoạt động</FormLabel>
                      <p className="text-xs text-muted-foreground">
                        Tắt để tạm ẩn bộ môn này khỏi trang đặt sân
                      </p>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSaving}
              >
                Huỷ
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2Icon className="size-3.5 animate-spin" />}
                Lưu thay đổi
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
