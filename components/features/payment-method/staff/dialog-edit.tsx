'use client';

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2Icon, PencilIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { ComboboxBank } from '@/components/custom/combobox/combobox-bank';
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
import { useUpdateVenuePaymentAccount } from '@/stores/queries/venue-payment-account.query';

const formSchema = z
  .object({
    methodCode: z.string(),
    accountNumber: z.string().optional(),
    accountName: z.string().optional(),
    bankName: z.string().optional(),
    bankCode: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    const code = values.methodCode;
    if (code === 'vnpay') return;

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

export const DialogEditVenuePayment = ({ item }: { item: IVenuePaymentAccount }) => {
  const code = item.paymentMethod?.code;
  const [open, setOpen] = useState(false);
  const updateMutation = useUpdateVenuePaymentAccount();
  const isSaving = updateMutation.isPending;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      methodCode: code || '',
      accountNumber: item.accountNumber || '',
      accountName: item.accountName || '',
      bankName: item.bankName || '',
      bankCode: item.bankCode || '',
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      methodCode: item.paymentMethod?.code || '',
      accountNumber: item.accountNumber || '',
      accountName: item.accountName || '',
      bankName: item.bankName || '',
      bankCode: item.bankCode || '',
    });
  }, [open, item, form]);

  if (code === 'vnpay') {
    return null;
  }

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
  };

  const handleSubmit = async (values: FormValues) => {
    try {
      if (code === 'momo' || code === 'zalopay') {
        await updateMutation.mutateAsync({
          id: item.id,
          body: {
            accountNumber: values.accountNumber?.trim() || null,
            accountName: values.accountName?.trim() || null,
            bankName: null,
            bankCode: null,
            provider: null,
          },
        });
      } else {
        await updateMutation.mutateAsync({
          id: item.id,
          body: {
            accountNumber: values.accountNumber?.trim() || null,
            accountName: values.accountName?.trim() || null,
            bankName: values.bankName?.trim() || null,
            bankCode: values.bankCode?.trim() || null,
            provider: null,
          },
        });
      }
      toast.success('Cập nhật tài khoản thành công');
      handleOpenChange(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message || 'Không cập nhật được');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            className="h-9 w-full justify-start rounded-lg px-3 font-normal"
          />
        }
      >
        <PencilIcon className="size-3.5 text-muted-foreground" />
        Sửa thông tin
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sửa tài khoản nhận tiền</DialogTitle>
          <DialogDescription>
            {item.paymentMethod?.name || 'Phương thức'} — cập nhật thông tin hợp lệ.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {code === 'bank_transfer' && (
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

            {(code === 'momo' || code === 'zalopay') && (
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
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2Icon className="size-3.5 animate-spin" />}
                Lưu
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
