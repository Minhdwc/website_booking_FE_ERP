'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Loader2Icon, LockKeyholeIcon, MailIcon, AlertCircleIcon } from 'lucide-react';
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
        <Loader2Icon className="size-5 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      {/* Logo mobile */}
      <div className="mb-8 flex items-center gap-3 lg:hidden">
        <Image
          src={logoSquare}
          alt=""
          className="size-10 rounded-xl object-cover shadow-sm"
          priority
        />
        <div>
          <p className="text-sm font-bold text-slate-800">Minh Đức Booking</p>
          <p className="text-[11px] text-slate-400">Hệ thống quản lý nội bộ</p>
        </div>
      </div>

      {/* Heading */}
      <div className="mb-7">
        <h1 className="text-2xl font-black tracking-tight text-slate-900">Đăng nhập</h1>
        <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500">
          Tài khoản được cấp bởi quản trị viên. Chỉ dành cho nhân sự nội bộ.
        </p>
      </div>

      {/* Card form */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {/* Error */}
        {serverError && (
          <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-red-100 bg-red-50 px-3.5 py-3">
            <AlertCircleIcon className="mt-px size-4 shrink-0 text-red-500" />
            <p className="text-[13px] text-red-600">{serverError}</p>
          </div>
        )}

        <form onSubmit={onSubmit} noValidate className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-[13px] font-semibold text-slate-700">
              Email
            </Label>
            <div className="relative">
              <MailIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="admin@minhduc.vn"
                className="h-10 border-slate-200 bg-white pl-9 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 hover:border-slate-300 focus-visible:border-[#4c90d3] focus-visible:ring-2 focus-visible:ring-[#4c90d3]/20 dark:bg-white! dark:text-slate-900! dark:border-slate-200"
                aria-invalid={Boolean(errors.email)}
                {...register('email')}
              />
            </div>
            {errors.email && <p className="text-[12px] text-red-500">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-[13px] font-semibold text-slate-700">
              Mật khẩu
            </Label>
            <div className="relative">
              <LockKeyholeIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className="h-10 border-slate-200 bg-white pl-9 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 hover:border-slate-300 focus-visible:border-[#4c90d3] focus-visible:ring-2 focus-visible:ring-[#4c90d3]/20 dark:bg-white! dark:text-slate-900! dark:border-slate-200"
                aria-invalid={Boolean(errors.password)}
                {...register('password')}
              />
            </div>
            {errors.password && (
              <p className="text-[12px] text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Button */}
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

      <p className="mt-5 text-center text-[11px] text-slate-400">
        Gặp vấn đề đăng nhập? Liên hệ quản trị viên để được hỗ trợ.
      </p>
    </div>
  );
}
