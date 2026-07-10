'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
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

export function RegisterForm() {
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
        role: 'user',
      });

      toast.success('Đăng ký thành công');
      router.push('/dashboard');
    } catch (error: any) {
      console.log(error);
      toast.error('Đăng ký thất bại. Vui lòng thử lại.');
    }
  });

  return (
    <div className="w-full max-w-md">
      <div className="flex items-center gap-3 lg:hidden">
        <Image
          src={logoSquare}
          alt=""
          className="size-10 rounded-xl object-cover shadow-sm"
          priority
        />
        <div>
          <p className="text-sm font-bold text-heading">Minh Đức Booking</p>
          <p className="text-sm text-muted-foreground">Hệ thống quản lý nội bộ</p>
        </div>
      </div>

      <div className="mb-1">
        <h1 className="text-2xl font-black tracking-tight text-heading">Tạo tài khoản</h1>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          Đăng ký tài khoản mới. Quyền truy cập ERP do quản trị viên cấp.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        {serverError && (
          <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-error/20 bg-error/10 px-3.5 py-3">
            <AlertCircleIcon className="mt-px size-4 shrink-0 text-error" />
            <p className="text-sm text-error">{serverError}</p>
          </div>
        )}

        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-sm font-semibold text-foreground">
              Họ và tên
            </Label>
            <div className="relative">
              <UserIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="name"
                autoComplete="name"
                placeholder="Nguyễn Văn A"
                className="h-10 border-border bg-surface pl-9 text-sm text-foreground shadow-sm placeholder:text-muted-foreground hover:border-border/80 focus-visible:border-brand-primary-400 focus-visible:ring-2 focus-visible:ring-brand-primary-400/20"
                aria-invalid={Boolean(errors.name)}
                {...register('name')}
              />
            </div>
            {errors.name && <p className="text-sm text-error">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-sm font-semibold text-foreground">
              Tên đăng nhập
            </Label>
            <div className="relative">
              <UserIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="username"
                autoComplete="username"
                placeholder="nguyenvana"
                className="h-10 border-border bg-surface pl-9 text-sm text-foreground shadow-sm placeholder:text-muted-foreground hover:border-border/80 focus-visible:border-brand-primary-400 focus-visible:ring-2 focus-visible:ring-brand-primary-400/20"
                aria-invalid={Boolean(errors.username)}
                {...register('username')}
              />
            </div>
            {errors.username && <p className="text-sm text-error">{errors.username.message}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                Email
              </Label>
              <div className="relative">
                <MailIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="ban@email.com"
                  className="h-10 border-border bg-surface pl-9 text-sm text-foreground shadow-sm placeholder:text-muted-foreground hover:border-border/80 focus-visible:border-brand-primary-400 focus-visible:ring-2 focus-visible:ring-brand-primary-400/20"
                  aria-invalid={Boolean(errors.email)}
                  {...register('email')}
                />
              </div>
              {errors.email && <p className="text-sm text-error">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-sm font-semibold text-foreground">
                Số điện thoại
              </Label>
              <div className="relative">
                <PhoneIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="0912345678"
                  className="h-10 border-border bg-surface pl-9 text-sm text-foreground shadow-sm placeholder:text-muted-foreground hover:border-border/80 focus-visible:border-brand-primary-400 focus-visible:ring-2 focus-visible:ring-brand-primary-400/20"
                  aria-invalid={Boolean(errors.phone)}
                  {...register('phone')}
                />
              </div>
              {errors.phone && <p className="text-sm text-error">{errors.phone.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-semibold text-foreground">
              Mật khẩu
            </Label>
            <div className="relative">
              <LockKeyholeIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                className="h-10 border-border bg-surface pl-9 text-sm text-foreground shadow-sm placeholder:text-muted-foreground hover:border-border/80 focus-visible:border-brand-primary-400 focus-visible:ring-2 focus-visible:ring-brand-primary-400/20 pr-10"
                aria-invalid={Boolean(errors.password)}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
              </button>
            </div>
            {errors.password && <p className="text-sm text-error">{errors.password.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-sm font-semibold text-foreground">
              Xác nhận mật khẩu
            </Label>
            <div className="relative">
              <LockKeyholeIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                className="h-10 border-border bg-surface pl-9 text-sm text-foreground shadow-sm placeholder:text-muted-foreground hover:border-border/80 focus-visible:border-brand-primary-400 focus-visible:ring-2 focus-visible:ring-brand-primary-400/20 pr-10"
                aria-invalid={Boolean(errors.confirmPassword)}
                {...register('confirmPassword')}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showConfirm ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showConfirm ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-error">{errors.confirmPassword.message}</p>
            )}
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
                  className="font-medium text-heading underline underline-offset-2"
                >
                  điều khoản sử dụng
                </Link>{' '}
                và{' '}
                <Link
                  href="/chinh-sach-bao-mat"
                  className="font-medium text-heading underline underline-offset-2"
                >
                  chính sách bảo mật
                </Link>
              </Label>
            </div>
            {errors.acceptTerms && (
              <p className="text-sm text-error">{errors.acceptTerms.message}</p>
            )}
          </div>

          <div className="pt-1">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-[42px] w-full rounded-lg text-sm font-bold"
            >
              {isSubmitting ? (
                <>
                  <Loader2Icon className="animate-spin" />
                  Đang xử lý…
                </>
              ) : (
                'Đăng ký tài khoản'
              )}
            </Button>
          </div>
        </form>
      </div>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        Đã có tài khoản?{' '}
        <Link href="/login" className="font-semibold text-heading underline underline-offset-2">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}
