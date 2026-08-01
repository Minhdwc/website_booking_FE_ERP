'use client';

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2Icon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

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
import { SessionUser } from '@/lib/auth/session';
import { useSession } from '@/provider/session-provider';
import { accountService } from '@/stores/service/account.service';

const profileSchema = z.object({
  name: z.string().min(2, 'Tên tối thiểu 2 ký tự'),
  username: z.string().min(3, 'Username tối thiểu 3 ký tự'),
  phone: z.string().optional(),
});

type ProfileValues = z.infer<typeof profileSchema>;

export function AccountProfilePage() {
  const { user, setUser } = useSession();
  const [saving, setSaving] = useState(false);

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? '',
      username: user?.username ?? '',
      phone: user?.phone ?? '',
    },
  });

  useEffect(() => {
    if (!user) return;
    form.reset({
      name: user.name ?? '',
      username: user.username ?? '',
      phone: user.phone ?? '',
    });
  }, [form, user]);

  if (!user) return null;

  const onSubmit = async (values: ProfileValues) => {
    setSaving(true);
    try {
      const response = (await accountService.updateProfile({
        name: values.name.trim(),
        username: values.username.trim(),
        phone: values.phone?.trim() || undefined,
      })) as { data: SessionUser };
      setUser(response.data);
      toast.success('Cập nhật hồ sơ thành công');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể cập nhật hồ sơ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-6 lg:px-8 lg:py-8">
      <PageHeader title="Hồ sơ cá nhân" description="Thông tin tài khoản ERP của bạn" />

      <div className="rounded-xl border border-border/70 bg-card p-6 shadow-sm">
        <p className="mb-4 text-sm text-muted-foreground">
          Email: <span className="font-medium text-foreground">{user.email}</span>
        </p>
        <p className="mb-6 text-sm text-muted-foreground">
          Vai trò: <span className="font-medium text-foreground">{user.role}</span>
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Họ tên</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số điện thoại</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={saving}>
              {saving && <Loader2Icon className="size-3.5 animate-spin" />}
              Lưu thay đổi
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
