'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircleIcon,
  EyeIcon,
  EyeOffIcon,
  Loader2Icon,
  LockKeyholeIcon,
  MailIcon,
  PhoneIcon,
  UserIcon,
} from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import logoSquare from '@/assets/logo/logo-9-9.png';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authService } from '@/stores/service/auth.service';

const phoneRegex = /^(0|\+84)(3|5|7|8|9)\d{8}$/;

const schema = z
  .object({
    name: z.string().min(2, 'Vui lòng nhập họ tên đầy đủ'),
    username: z
      .string()
      .min(3, 'Tên đăng nhập tối thiểu 3 ký tự')
      .max(50, 'Tên đăng nhập tối đa 50 ký tự')
      .regex(/^[a-zA-Z0-9._-]+$/, 'Chỉ dùng chữ, số, dấu chấm, gạch ngang'),
    email: z.string().email('Email không hợp lệ'),
    phone: z.string().regex(phoneRegex, 'Số điện thoại không hợp lệ'),
    password: z
      .string()
      .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
      .regex(/[A-Z]/, 'Mật khẩu cần ít nhất 1 chữ hoa')
      .regex(/[0-9]/, 'Mật khẩu cần ít nhất 1 chữ số'),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: 'Bạn cần đồng ý với điều khoản sử dụng',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;

export const RegisterForm = () => {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      username: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);

    try {
      await authService.register({
        name: values.name,
        username: values.username,
        email: values.email,
        phone: values.phone,
        password: values.password,
      });

      toast.success('Đăng ký thành công');
      router.push('/dashboard');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Đăng ký thất bại. Vui lòng thử lại.';
      setServerError(message);
      toast.error(message);
    }
  });

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
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Tạo tài khoản</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Đăng ký tài khoản mới. Quyền truy cập ERP do quản trị viên cấp.
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
            <Label htmlFor="name" className="text-sm font-medium text-foreground">
              Họ và tên
            </Label>
            <div className="relative">
              <UserIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="name"
                autoComplete="name"
                placeholder="Nguyễn Văn A"
                className="h-10 border-border bg-background pl-9 shadow-none"
                aria-invalid={Boolean(errors.name)}
                {...register('name')}
              />
            </div>
            {errors.name ? <p className="text-xs text-destructive">{errors.name.message}</p> : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-sm font-medium text-foreground">
              Tên đăng nhập
            </Label>
            <div className="relative">
              <UserIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="username"
                autoComplete="username"
                placeholder="nguyenvana"
                className="h-10 border-border bg-background pl-9 shadow-none"
                aria-invalid={Boolean(errors.username)}
                {...register('username')}
              />
            </div>
            {errors.username ? (
              <p className="text-xs text-destructive">{errors.username.message}</p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
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
                  placeholder="ban@email.com"
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
              <Label htmlFor="phone" className="text-sm font-medium text-foreground">
                Số điện thoại
              </Label>
              <div className="relative">
                <PhoneIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="0912345678"
                  className="h-10 border-border bg-background pl-9 shadow-none"
                  aria-invalid={Boolean(errors.phone)}
                  {...register('phone')}
                />
              </div>
              {errors.phone ? (
                <p className="text-xs text-destructive">{errors.phone.message}</p>
              ) : null}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-medium text-foreground">
              Mật khẩu
            </Label>
            <div className="relative">
              <LockKeyholeIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                className="h-10 border-border bg-background pr-10 pl-9 shadow-none"
                aria-invalid={Boolean(errors.password)}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute top-1/2 right-2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-md border border-transparent text-muted-foreground hover:border-border"
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
              </button>
            </div>
            {errors.password ? (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
              Xác nhận mật khẩu
            </Label>
            <div className="relative">
              <LockKeyholeIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                className="h-10 border-border bg-background pr-10 pl-9 shadow-none"
                aria-invalid={Boolean(errors.confirmPassword)}
                {...register('confirmPassword')}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((value) => !value)}
                className="absolute top-1/2 right-2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-md border border-transparent text-muted-foreground hover:border-border"
                aria-label={showConfirm ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showConfirm ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
              </button>
            </div>
            {errors.confirmPassword ? (
              <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-start gap-2.5">
              <Controller
                control={control}
                name="acceptTerms"
                render={({ field }) => (
                  <Checkbox
                    id="acceptTerms"
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(checked === true)}
                  />
                )}
              />
              <Label
                htmlFor="acceptTerms"
                className="text-sm leading-snug font-normal text-muted-foreground"
              >
                Tôi đồng ý với{' '}
                <Link
                  href="/dieu-khoan"
                  className="font-medium text-foreground underline underline-offset-2"
                >
                  điều khoản sử dụng
                </Link>{' '}
                và{' '}
                <Link
                  href="/chinh-sach-bao-mat"
                  className="font-medium text-foreground underline underline-offset-2"
                >
                  chính sách bảo mật
                </Link>
              </Label>
            </div>
            {errors.acceptTerms ? (
              <p className="text-xs text-destructive">{errors.acceptTerms.message}</p>
            ) : null}
          </div>

          <Button type="submit" disabled={isSubmitting} className="mt-2 h-10 w-full font-semibold">
            {isSubmitting ? (
              <>
                <Loader2Icon className="animate-spin" />
                Đang xử lý…
              </>
            ) : (
              'Đăng ký tài khoản'
            )}
          </Button>
        </form>
      </div>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        Đã có tài khoản?{' '}
        <Link href="/login" className="font-semibold text-foreground underline-offset-4 hover:underline">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
};
