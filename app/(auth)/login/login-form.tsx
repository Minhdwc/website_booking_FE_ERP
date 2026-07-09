'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSession } from '@/provider/session-provider';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { Loader2Icon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useSession();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  const onSubmit = handleSubmit(async (values) => {
    setError(null);

    try {
      await login(values.email, values.password);
      router.replace('/dashboard');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message ?? 'Đăng nhập thất bại');
        return;
      }

      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại');
    }
  });

  if (isLoading) {
    return (
      <div className="flex w-full max-w-sm items-center justify-center py-16">
        <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Minh Đức Booking Sport
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Đăng nhập ERP</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Dành cho admin và nhân viên quản lý sân, khung giờ, đặt sân và thanh toán.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="email">Email công việc</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="admin@minhduc.vn"
            aria-invalid={Boolean(errors.email)}
            {...register('email')}
          />
          {errors.email ? (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Mật khẩu</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            aria-invalid={Boolean(errors.password)}
            {...register('password')}
          />
          {errors.password ? (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          ) : null}
        </div>

        <div className="flex justify-end pt-1">
          <Button type="submit" disabled={isSubmitting} className="min-w-28">
            {isSubmitting ? (
              <>
                <Loader2Icon className="animate-spin" />
                Đang xử lý
              </>
            ) : (
              'Đăng nhập'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
