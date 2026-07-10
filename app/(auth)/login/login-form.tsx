'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { AlertCircleIcon, Loader2Icon, LockKeyholeIcon, MailIcon } from 'lucide-react';
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

export function LoginForm() {
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
        setServerError(err.response?.data?.message ?? 'Đăng nhập thất bại');
      } else {
        setServerError(err instanceof Error ? err.message : 'Đăng nhập thất bại');
      }
    }
  });

  if (isLoading) {
    return (
      <div className="flex h-32 w-full max-w-sm items-center justify-center">
        <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 flex items-center gap-3 lg:hidden">
        <Image
          src={logoSquare}
          alt=""
          className="size-10 rounded-xl object-cover shadow-sm"
          priority
        />
        <div>
          <p className="text-sm font-bold text-heading">Minh Đức Booking</p>
          <p className="text-[11px] text-muted-foreground">Hệ thống quản lý nội bộ</p>
        </div>
      </div>

      <div className="mb-7">
        <h1 className="text-2xl font-black tracking-tight text-heading">Đăng nhập</h1>
        <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
          Tài khoản được cấp bởi quản trị viên. Chỉ dành cho nhân sự nội bộ.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        {serverError && (
          <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-error/20 bg-error/10 px-3.5 py-3">
            <AlertCircleIcon className="mt-px size-4 shrink-0 text-error" />
            <p className="text-[13px] text-error">{serverError}</p>
          </div>
        )}

        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-[13px] font-semibold text-foreground">
              Email
            </Label>
            <div className="relative">
              <MailIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="admin@minhduc.vn"
                className="h-10 border-border bg-surface pl-9 text-sm text-foreground shadow-sm placeholder:text-muted-foreground hover:border-border/80 focus-visible:border-brand-primary-400 focus-visible:ring-2 focus-visible:ring-brand-primary-400/20"
                aria-invalid={Boolean(errors.email)}
                {...register('email')}
              />
            </div>
            {errors.email && <p className="text-[12px] text-error">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-[13px] font-semibold text-foreground">
              Mật khẩu
            </Label>
            <div className="relative">
              <LockKeyholeIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className="h-10 border-border bg-surface pl-9 text-sm text-foreground shadow-sm placeholder:text-muted-foreground hover:border-border/80 focus-visible:border-brand-primary-400 focus-visible:ring-2 focus-visible:ring-brand-primary-400/20"
                aria-invalid={Boolean(errors.password)}
                {...register('password')}
              />
            </div>
            {errors.password && <p className="text-[12px] text-error">{errors.password.message}</p>}
          </div>

          <div className="pt-1">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-[42px] w-full rounded-lg text-[13px] font-bold"
            >
              {isSubmitting ? (
                <>
                  <Loader2Icon className="animate-spin" />
                  Đang xử lý…
                </>
              ) : (
                'Đăng nhập'
              )}
            </Button>
          </div>
        </form>
      </div>

      <p className="mt-5 text-center text-[11px] text-muted-foreground">
        Gặp vấn đề đăng nhập? Liên hệ quản trị viên để được hỗ trợ.
      </p>
    </div>
  );
}
