'use client';

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2Icon, PlusIcon } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { ComboboxBank } from '@/components/custom/combobox/combobox-bank';
import { ComboboxPaymentMethod } from '@/components/custom/combobox/combobox-payment-method';
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
import { IVenuePaymentAccount } from '@/stores/api/types';
import { usePaymentMethods } from '@/stores/queries/payment-method.query';
import { useCreateVenuePaymentAccount } from '@/stores/queries/venue-payment-account.query';

const emptyValues = {
  paymentMethodId: '',
  methodCode: '',
  accountNumber: '',
  accountName: '',
  bankName: '',
  bankCode: '',
};

const formSchema = z
  .object({
    paymentMethodId: z.string().min(1, { message: 'Chọn phương thức' }),
    methodCode: z.string(),
    accountNumber: z.string().optional(),
    accountName: z.string().optional(),
    bankName: z.string().optional(),
    bankCode: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    const code = values.methodCode;
    if (!code || code === 'vnpay') return;

    if (code === 'bank_transfer') {
      if (!values.accountNumber?.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['accountNumber'],
          message: 'Số tài khoản là bắt buộc',
        });
      }
      if (!values.accountName?.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['accountName'],
          message: 'Tên chủ tài khoản là bắt buộc',
        });
      }
      if (!values.bankCode?.trim() && !values.bankName?.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['bankCode'],
          message: 'Ngân hàng là bắt buộc',
        });
      }
      return;
    }

    if (code === 'momo' || code === 'zalopay') {
      if (!values.accountNumber?.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['accountNumber'],
          message: 'Số ví / SĐT là bắt buộc',
        });
      }
      if (!values.accountName?.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['accountName'],
          message: 'Tên chủ ví là bắt buộc',
        });
      }
    }
  });

type FormValues = z.infer<typeof formSchema>;

export const DialogRegisterVenuePayment = ({
  venueId,
  venueName,
  registeredAccounts,
}: {
  venueId: string;
  venueName?: string;
  registeredAccounts: IVenuePaymentAccount[];
}) => {
  const [open, setOpen] = useState(false);
  const createMutation = useCreateVenuePaymentAccount();
  const isSaving = createMutation.isPending;

  const registeredIds = registeredAccounts.map((item) => item.paymentMethodId);
  const { data: methods = [] } = usePaymentMethods({ limit: '200' });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: emptyValues,
  });

  const selectedMethodId = useWatch({ control: form.control, name: 'paymentMethodId' });
  const methodCode = useWatch({ control: form.control, name: 'methodCode' });

  useEffect(() => {
    const method = methods.find((item) => item.id === selectedMethodId);
    form.setValue('methodCode', method?.code || '');
  }, [selectedMethodId, methods, form]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) form.reset(emptyValues);
  };

  const handleSubmit = async (values: FormValues) => {
    const code = values.methodCode;
    try {
      if (code === 'vnpay') {
        await createMutation.mutateAsync({
          venueId,
          paymentMethodId: values.paymentMethodId,
          isActive: true,
        });
      } else if (code === 'momo' || code === 'zalopay') {
        await createMutation.mutateAsync({
          venueId,
          paymentMethodId: values.paymentMethodId,
          accountNumber: values.accountNumber?.trim(),
          accountName: values.accountName?.trim(),
          isActive: true,
        });
      } else {
        await createMutation.mutateAsync({
          venueId,
          paymentMethodId: values.paymentMethodId,
          accountNumber: values.accountNumber?.trim(),
          accountName: values.accountName?.trim(),
          bankName: values.bankName?.trim() || undefined,
          bankCode: values.bankCode?.trim() || undefined,
          isActive: true,
        });
      }
      toast.success(code === 'vnpay' ? 'Đã bật VNPay cho cơ sở' : 'Đăng ký phương thức thành công');
      handleOpenChange(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message || 'Không đăng ký được');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button size="sm" disabled={!venueId} />}>
        <PlusIcon className="size-3.5" />
        Đăng ký phương thức
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Đăng ký phương thức</DialogTitle>
          <DialogDescription>
            {venueName
              ? `Khai báo nhận tiền cho cơ sở ${venueName}.`
              : 'Chọn phương thức và điền thông tin phù hợp.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="paymentMethodId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Phương thức <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <ComboboxPaymentMethod
                      value={field.value}
                      onChange={(id) => {
                        field.onChange(id);
                        form.setValue('accountNumber', '');
                        form.setValue('accountName', '');
                        form.setValue('bankName', '');
                        form.setValue('bankCode', '');
                      }}
                      excludeIds={registeredIds}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {methodCode === 'vnpay' && (
              <p className="rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                VNPay dùng cổng thanh toán nền tảng. Chỉ cần bật cho cơ sở — không cần số tài khoản.
              </p>
            )}

            {methodCode === 'bank_transfer' && (
              <>
                <FormField
                  control={form.control}
                  name="accountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Số tài khoản <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="accountName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Tên chủ tài khoản <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bankCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Ngân hàng <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <ComboboxBank
                          value={field.value}
                          onChange={(bank) => {
                            field.onChange(bank?.code || '');
                            form.setValue('bankName', bank?.shortName || '');
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {(methodCode === 'momo' || methodCode === 'zalopay') && (
              <>
                <FormField
                  control={form.control}
                  name="accountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Số ví / SĐT <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Số điện thoại ví" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="accountName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Tên chủ ví <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Huỷ
              </Button>
              <Button type="submit" disabled={isSaving || !selectedMethodId}>
                {isSaving && <Loader2Icon className="size-3.5 animate-spin" />}
                {methodCode === 'vnpay' ? 'Bật VNPay' : 'Đăng ký'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
