'use client';

import { useState } from 'react';
import { MoreHorizontalIcon, Trash2Icon, WalletCardsIcon } from 'lucide-react';
import { toast } from 'sonner';

import { DialogEditVenuePayment } from '@/components/features/payment-method/staff/dialog-edit';
import { DialogRegisterVenuePayment } from '@/components/features/payment-method/staff/staff-register';
import { ComboboxVenue } from '@/components/custom/combobox/combobox-venue';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { IVenuePaymentAccount } from '@/stores/api/types';
import {
  useDeleteVenuePaymentAccount,
  useUpdateVenuePaymentAccount,
  useVenuePaymentAccounts,
} from '@/stores/queries/venue-payment-account.query';
import { useVenues } from '@/stores/queries/venue.query';

function accountSummary(item: IVenuePaymentAccount) {
  const code = item.paymentMethod?.code;
  if (code === 'vnpay') {
    return {
      title: 'Cổng thanh toán nền tảng',
      subtitle: 'Không cần số tài khoản — xác nhận qua VNPay',
    };
  }
  if (code === 'momo' || code === 'zalopay') {
    return {
      title: item.accountName || '—',
      subtitle: item.accountNumber || 'Chưa có số ví',
    };
  }
  if (code === 'bank_transfer') {
    return {
      title: item.accountName || '—',
      subtitle:
        [item.accountNumber, item.bankName || item.bankCode].filter(Boolean).join(' · ') ||
        'Chưa có số tài khoản',
    };
  }
  return {
    title: item.accountName || '—',
    subtitle: item.accountNumber || 'Chưa có thông tin',
  };
}

export const StaffPaymentMethodView = () => {
  const { data: venues = [], isLoading: venuesLoading } = useVenues();
  const [venueId, setVenueId] = useState('');

  const selectedVenueId = venueId || venues[0]?.id || '';
  const selectedVenue = venues.find((venue) => venue.id === selectedVenueId);

  const {
    data: accounts = [],
    isLoading,
    isError,
    error,
  } = useVenuePaymentAccounts(selectedVenueId ? { venueId: selectedVenueId } : undefined);

  const updateMutation = useUpdateVenuePaymentAccount();
  const deleteMutation = useDeleteVenuePaymentAccount();

  const activeCount = accounts.filter((item) => item.isActive).length;
  const hasVenues = venues.length > 0;
  const hasAccounts = accounts.length > 0;

  const handleToggleActive = async (item: IVenuePaymentAccount) => {
    try {
      await updateMutation.mutateAsync({
        id: item.id,
        body: { isActive: !item.isActive },
      });
      toast.success(item.isActive ? 'Đã tạm dừng phương thức' : 'Đã kích hoạt phương thức');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message || 'Không cập nhật được trạng thái');
    }
  };

  const handleUnregister = async (item: IVenuePaymentAccount) => {
    if (!window.confirm(`Hủy đăng ký "${item.paymentMethod?.name || ''}"?`)) return;
    try {
      await deleteMutation.mutateAsync(item.id);
      toast.success('Đã hủy đăng ký phương thức');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message || 'Không hủy được đăng ký');
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
      <header className="space-y-1">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-bold tracking-tight text-heading">
            Phương thức thanh toán sân
          </h1>
          {hasAccounts && (
            <Badge variant="secondary" className="font-semibold tabular-nums">
              {accounts.length}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Đăng ký và khai báo tài khoản nhận tiền theo từng phương thức cho cơ sở.
        </p>
      </header>

      {!venuesLoading && !hasVenues && (
        <div className="rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center">
          <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <WalletCardsIcon className="size-5" />
          </div>
          <h2 className="mt-4 text-base font-semibold text-heading">Chưa được gán cơ sở</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            Liên hệ admin để được thêm vào VenueOwner trước khi đăng ký phương thức.
          </p>
        </div>
      )}

      {hasVenues && (
        <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="w-full max-w-md space-y-2">
              <Label htmlFor="staff-payment-venue">Cơ sở</Label>
              <ComboboxVenue value={selectedVenueId} onChange={setVenueId} />
              {selectedVenue?.location && (
                <p className="text-xs text-muted-foreground">{selectedVenue.location}</p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
              {hasAccounts && (
                <>
                  <Badge variant="outline" className="tabular-nums">
                    {activeCount} đang hoạt động
                  </Badge>
                  <Badge variant="secondary" className="tabular-nums">
                    {accounts.length - activeCount} tạm dừng
                  </Badge>
                </>
              )}
              <DialogRegisterVenuePayment
                venueId={selectedVenueId}
                venueName={selectedVenue?.name}
                registeredAccounts={accounts}
              />
            </div>
          </div>
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error instanceof Error ? error.message : 'Không tải được danh sách đăng ký'}
        </div>
      )}

      {isLoading && selectedVenueId && (
        <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
          <div className="space-y-0 divide-y divide-border/40 p-4">
            {[0, 1, 2].map((row) => (
              <Skeleton key={row} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        </div>
      )}

      {!isLoading && selectedVenueId && hasAccounts && (
        <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/60 bg-muted/40 hover:bg-muted/40">
                <TableHead className="px-4 py-3 text-xs">Phương thức</TableHead>
                <TableHead className="px-4 py-3 text-xs">Tài khoản</TableHead>
                <TableHead className="px-4 py-3 text-xs">Trạng thái</TableHead>
                <TableHead className="w-14 px-4 py-3 text-right text-xs">
                  <span className="sr-only">Thao tác</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((item) => (
                <TableRow key={item.id} className="group border-b border-border/40 last:border-b-0">
                  <TableCell className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/50 text-muted-foreground">
                        <WalletCardsIcon className="size-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-heading">
                          {item.paymentMethod?.name || '—'}
                        </p>
                        <p className="font-mono text-xs text-muted-foreground">
                          {item.paymentMethod?.code}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[320px] px-4 py-3.5">
                    <p className="text-sm text-heading">{accountSummary(item).title}</p>
                    <p className="text-xs text-muted-foreground">{accountSummary(item).subtitle}</p>
                  </TableCell>
                  <TableCell className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <Switch
                        checked={item.isActive}
                        onCheckedChange={() => handleToggleActive(item)}
                        disabled={updateMutation.isPending}
                      />
                      <Badge variant={item.isActive ? 'default' : 'secondary'}>
                        {item.isActive ? 'Hoạt động' : 'Tạm dừng'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-3.5 text-right">
                    <Popover>
                      <PopoverTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Mở thao tác"
                            className="text-muted-foreground opacity-60 transition-opacity group-hover:opacity-100 aria-expanded:opacity-100"
                          />
                        }
                      >
                        <MoreHorizontalIcon className="size-4" />
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-44 gap-0 p-1">
                        {item.paymentMethod?.code !== 'vnpay' && (
                          <>
                            <DialogEditVenuePayment item={item} />
                            <Separator className="my-1" />
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-9 w-full justify-start gap-2 rounded-lg px-3 font-normal text-destructive hover:text-destructive"
                          onClick={() => handleUnregister(item)}
                        >
                          <Trash2Icon className="size-3.5" />
                          Hủy đăng ký
                        </Button>
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {!isLoading && selectedVenueId && !hasAccounts && hasVenues && (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-border bg-card px-6 py-14 text-center">
          <div className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <WalletCardsIcon className="size-5" />
          </div>
          <h2 className="mt-4 text-base font-semibold text-heading">
            {selectedVenue?.name || 'Cơ sở'} chưa có phương thức
          </h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Đăng ký phương thức từ catalog và điền thông tin tài khoản nhận thanh toán hợp lệ.
          </p>
          <div className="mt-5">
            <DialogRegisterVenuePayment
              venueId={selectedVenueId}
              venueName={selectedVenue?.name}
              registeredAccounts={accounts}
            />
          </div>
        </div>
      )}
    </div>
  );
};
