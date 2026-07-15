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
import { Textarea } from '@/components/ui/textarea';
import { useCreatePaymentMethod } from '@/stores/queries/payment-method.query';

const formSchema = z.object({
  code: z
    .string()
    .min(2, { message: 'Code tối thiểu 2 ký tự' })
    .regex(/^[a-z][a-z0-9_]*$/, {
      message: 'Code chỉ gồm chữ thường, số và gạch dưới',
    }),
  name: z.string().min(2, { message: 'Tên tối thiểu 2 ký tự' }),
  description: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export const DialogCreatePaymentMethod = () => {
  const [open, setOpen] = useState(false);
  const createMutation = useCreatePaymentMethod();
  const isSaving = createMutation.isPending;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { code: '', name: '', description: '' },
  });

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) form.reset({ code: '', name: '', description: '' });
  };

  const handleSubmit = async (values: FormValues) => {
    try {
      await createMutation.mutateAsync({
        code: values.code.trim().toLowerCase(),
        name: values.name.trim(),
        description: values.description?.trim() || undefined,
        isActive: true,
      });
      toast.success('Thêm phương thức thành công');
      handleOpenChange(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message || 'Không thêm được phương thức');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button className="gap-2" />}>
        <PlusIcon className="size-4" />
        Thêm phương thức
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Thêm phương thức thanh toán</DialogTitle>
          <DialogDescription>
            Tạo phương thức trong catalog để staff đăng ký tài khoản nhận tiền theo cơ sở.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <FormControl>
                    <Input placeholder="bank_transfer, momo…" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên hiển thị</FormLabel>
                  <FormControl>
                    <Input placeholder="Chuyển khoản ngân hàng" {...field} />
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
                    <Textarea className="min-h-20" placeholder="Ghi chú cho staff…" {...field} />
                  </FormControl>
                  <FormMessage />
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
