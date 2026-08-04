'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2Icon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { showApiErrorToast } from '@/lib/api/handle-api-error';
import { PageHeader } from '@/components/custom/page-header';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { accountService } from '@/stores/service/account.service';

const schema = z
  .object({
    currentPassword: z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự'),
    newPassword: z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự'),
    confirmNewPassword: z.string().min(1, 'Xác nhận mật khẩu'),
  })
  .refine((values) => values.newPassword === values.confirmNewPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmNewPassword'],
  });

type FormValues = z.infer<typeof schema>;

export function AccountChangePasswordPage() {
  const [saving, setSaving] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setSaving(true);
    try {
      await accountService.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      form.reset();
      toast.success('Đổi mật khẩu thành công');
    } catch (error) {
      showApiErrorToast(error, 'Không thể đổi mật khẩu');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-6 lg:px-8 lg:py-8">
      <PageHeader title="Đổi mật khẩu" description="Cập nhật mật khẩu đăng nhập ERP" />

      <div className="rounded-xl border border-border/70 bg-card p-6 shadow-sm">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu hiện tại</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="current-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu mới</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmNewPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Xác nhận mật khẩu mới</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={saving}>
              {saving && <Loader2Icon className="size-3.5 animate-spin" />}
              Cập nhật mật khẩu
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
