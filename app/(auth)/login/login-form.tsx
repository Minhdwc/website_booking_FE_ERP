'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { AlertCircleIcon, Loader2Icon, LockKeyholeIcon, MailIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import logoSquare from '@/assets/logo/logo-9-9.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSession } from '@/provider/session-provider';

const schema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(8, 'Tối thiểu 8 ký tự'),
});

type FormValues = z.infer<typeof schema>;

export const LoginForm = () => {
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useSession();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!isLoading && isAuthenticated) router.replace('/dashboard');
  }, [isAuthenticated, isLoading, router]);

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setServerError(null);
    try {
      await login(email, password);
      router.replace('/dashboard');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setServerError(err.response?.data?.message || 'Đăng nhập thất bại');
      } else {
        setServerError(err instanceof Error ? err.message : 'Đăng nhập thất bại');
      }
    }
  });

  if (isLoading) {
    return (
      <div className="flex h-32 w-full items-center justify-center">
        <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8 flex items-center gap-3 lg:hidden">
        <Image
          src={logoSquare}
          alt="Minh Đức Booking Sport"
          className="size-11 rounded-xl object-cover ring-1 ring-border"
          priority
        />
        <div>
          <p className="text-sm font-bold text-foreground">Minh Đức Booking</p>
          <p className="text-xs text-muted-foreground">Hệ thống quản lý nội bộ</p>
        </div>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Đăng nhập</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Tài khoản do quản trị viên cấp. Chỉ dành cho nhân sự vận hành sân.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-7">
        {serverError ? (
          <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-destructive/25 bg-destructive/5 px-3.5 py-3">
            <AlertCircleIcon className="mt-0.5 size-4 shrink-0 text-destructive" />
            <p className="text-sm text-destructive">{serverError}</p>
          </div>
        ) : null}

        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium text-foreground">
              Email
            </Label>
            <div className="relative">
              <MailIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="admin@minhduc.vn"
                className="h-10 border-border bg-background pl-9 shadow-none"
                aria-invalid={Boolean(errors.email)}
                {...register('email')}
              />
            </div>
            {errors.email ? (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-medium text-foreground">
              Mật khẩu
            </Label>
            <div className="relative">
              <LockKeyholeIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className="h-10 border-border bg-background pl-9 shadow-none"
                aria-invalid={Boolean(errors.password)}
                {...register('password')}
              />
            </div>
            {errors.password ? (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            ) : null}
          </div>

          <Button type="submit" disabled={isSubmitting} className="mt-2 h-10 w-full font-semibold">
            {isSubmitting ? (
              <>
                <Loader2Icon className="animate-spin" />
                Đang xử lý…
              </>
            ) : (
              'Đăng nhập'
            )}
          </Button>
        </form>
      </div>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Gặp vấn đề? Liên hệ quản trị viên để được hỗ trợ.
      </p>
    </div>
  );
};
