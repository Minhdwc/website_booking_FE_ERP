'use client';

import { useMemo, useState } from 'react';
import { LineChart, Send } from 'lucide-react';

import { PageHeader } from '@/components/custom/page-header';
import { StatCard } from '@/components/custom/stat-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAnalyticsOverview } from '@/stores/queries/analytics.query';

const STATUS_LABEL: Record<string, string> = {
  waiting_payment: 'Đang giữ chỗ',
  confirmed: 'Đã xác nhận',
  cancelled: 'Đã huỷ',
  completed: 'Hoàn thành',
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function daysAgoIso(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

export function AnalyticsPage() {
  const [from, setFrom] = useState(daysAgoIso(30));
  const [to, setTo] = useState(todayIso());
  const [applied, setApplied] = useState({ from: daysAgoIso(30), to: todayIso() });

  const { data, isLoading, isFetching } = useAnalyticsOverview(applied);

  const statusRows = useMemo(
    () =>
      (data?.bookings.byStatus ?? []).map((row) => ({
        status: STATUS_LABEL[row.status] ?? row.status,
        count: row.count,
      })),
    [data?.bookings.byStatus],
  );

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 lg:px-8 lg:py-8">
      <PageHeader
        title="Phân tích"
        description="Phễu đặt sân, tỷ lệ thanh toán và hiệu suất cơ sở"
        icon={LineChart}
      />

      <section className="grid gap-3 rounded-xl border border-border/70 bg-card p-4 shadow-sm md:grid-cols-[1fr_1fr_auto] md:items-end">
        <div className="space-y-2">
          <Label htmlFor="analytics-from">Từ ngày</Label>
          <Input id="analytics-from" type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="analytics-to">Đến ngày</Label>
          <Input id="analytics-to" type="date" value={to} onChange={(event) => setTo(event.target.value)} />
        </div>
        <Button onClick={() => setApplied({ from, to })} disabled={isFetching}>
          Áp dụng
        </Button>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Tổng đặt sân"
          value={isLoading ? '0' : String(data?.bookings.total ?? 0)}
          loading={isLoading}
        />
        <StatCard
          title="Tỷ lệ chuyển đổi"
          value={isLoading ? '0%' : `${data?.bookings.conversionRate ?? 0}%`}
          loading={isLoading}
        />
        <StatCard
          title="Thanh toán thành công"
          value={isLoading ? '0%' : `${data?.payments.successRate ?? 0}%`}
          loading={isLoading}
        />
        <StatCard
          title="Doanh thu"
          value={
            isLoading ? '0' : `${(data?.revenue.total ?? 0).toLocaleString('vi-VN')} VNĐ`
          }
          loading={isLoading}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border/70 bg-card p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-heading">Trạng thái đặt sân</h2>
          {isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Số lượng</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statusRows.map((row) => (
                  <TableRow key={row.status}>
                    <TableCell>{row.status}</TableCell>
                    <TableCell className="text-right">{row.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <div className="rounded-xl border border-border/70 bg-card p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-heading">Top cơ sở</h2>
          {isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cơ sở</TableHead>
                  <TableHead className="text-right">Lượt đặt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data?.topVenues ?? []).map((row) => (
                  <TableRow key={row.venueId}>
                    <TableCell>{row.venue?.name ?? row.venueId}</TableCell>
                    <TableCell className="text-right">{row.bookingCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </section>
    </div>
  );
}
