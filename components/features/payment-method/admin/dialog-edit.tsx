'use client';

import { useEffect, useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { IPaymentMethod } from '@/stores/api/types';
import { useUpdatePaymentMethod } from '@/stores/queries/payment-method.query';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Tên tối thiểu 2 ký tự' }),
  description: z.string().max(500).optional(),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export const DialogEditPaymentMethod = ({ item }: { item: IPaymentMethod }) => {
  const [open, setOpen] = useState(false);
  const updateMutation = useUpdatePaymentMethod();
  const isSaving = updateMutation.isPending;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: item.name,
      description: item.description || '',
      isActive: item.isActive,
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      name: item.name,
      description: item.description || '',
      isActive: item.isActive,
    });
  }, [open, item, form]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      form.reset({
        name: item.name,
        description: item.description || '',
        isActive: item.isActive,
      });
    }
  };

  const handleSubmit = async (values: FormValues) => {
    try {
      await updateMutation.mutateAsync({
        id: item.id,
        body: {
          name: values.name.trim(),
          description: values.description?.trim() || null,
          isActive: values.isActive,
        },
      });
      toast.success('Cập nhật phương thức thành công');
      handleOpenChange(false);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || error.message || 'Không cập nhật được phương thức',
      );
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
          <DialogTitle>Chỉnh sửa phương thức</DialogTitle>
          <DialogDescription>
            Code <span className="font-mono">{item.code}</span> không đổi sau khi tạo.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên hiển thị</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea className="min-h-20" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border px-3 py-2">
                  <FormLabel className="m-0">Đang mở</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2Icon className="size-4 animate-spin" />}
                Lưu
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
