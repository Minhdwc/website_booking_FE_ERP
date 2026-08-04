'use client';

import { useState } from 'react';
import { DownloadIcon } from 'lucide-react';
import { toast } from 'sonner';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from 'recharts';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
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
import { useReportSummary } from '@/stores/queries/report';
import { reportService } from '@/stores/service/report.service';
import { showApiErrorToast } from '@/lib/api/handle-api-error';
import { daysAgoIsoDate, todayIsoDate } from '@/lib/format';

const STATUS_LABEL: Record<string, string> = {
  waiting_payment: 'Đang giữ chỗ',
  confirmed: 'Đã xác nhận',
  cancelled: 'Đã huỷ',
  completed: 'Hoàn thành',
};

const PIE_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
];

type ReportsPageProps = {
  title?: string;
  description?: string;
};

export function ReportsPage({
  title = 'Báo cáo',
  description = 'Doanh thu, trạng thái đặt sân và top sân theo khoảng ngày.',
}: ReportsPageProps) {
  const [from, setFrom] = useState(daysAgoIsoDate(30));
  const [to, setTo] = useState(todayIsoDate());
  const [applied, setApplied] = useState({ from: daysAgoIsoDate(30), to: todayIsoDate() });
  const [isExporting, setIsExporting] = useState(false);

  const { data, isLoading, isError, error, isFetching } = useReportSummary(applied);

  const statusChartData = (data?.bookingsByStatus ?? []).map((row) => ({
    status: STATUS_LABEL[row.status] ?? row.status,
    count: row.count,
  }));

  const dayChartData = (data?.revenueByDay ?? []).map((row) => ({
    date: row.date.slice(5),
    total: row.total,
  }));

  const sportChartData = (data?.revenueBySport ?? []).map((row) => ({
    name: row.sportName,
    total: row.total,
  }));

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      const blob = await reportService.downloadCsv(applied);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `bao-cao-${applied.from}-${applied.to}.csv`;
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success('Đã tải file CSV');
    } catch (exportError) {
      showApiErrorToast(exportError, 'Không xuất được CSV');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-heading">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <Label htmlFor="report-from">Từ ngày</Label>
            <Input
              id="report-from"
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
              className="w-40 bg-card"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="report-to">Đến ngày</Label>
            <Input
              id="report-to"
              type="date"
              value={to}
              onChange={(event) => setTo(event.target.value)}
              className="w-40 bg-card"
            />
          </div>
          <Button size="sm" onClick={() => setApplied({ from, to })} disabled={isFetching}>
            Áp dụng
          </Button>
          <Button size="sm" variant="outline" onClick={handleExportCsv} disabled={isExporting}>
            <DownloadIcon className="size-3.5" />
            {isExporting ? 'Đang xuất…' : 'Xuất CSV'}
          </Button>
        </div>
      </header>

      {isError && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error instanceof Error ? error.message : 'Không tải được báo cáo'}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border/60 bg-card px-5 py-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Tổng doanh thu</p>
          {isLoading ? (
            <Skeleton className="mt-2 h-8 w-40" />
          ) : (
            <p className="mt-1 text-[24px] font-medium tabular-nums text-heading">
              {(data?.revenue.total ?? 0).toLocaleString('vi-VN')} đ
            </p>
          )}
        </div>
        <div className="rounded-xl border border-border/60 bg-card px-5 py-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Giao dịch thành công</p>
          {isLoading ? (
            <Skeleton className="mt-2 h-8 w-24" />
          ) : (
            <p className="mt-1 text-[24px] font-medium tabular-nums text-heading">
              {data?.revenue.paidCount ?? 0}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-heading">Trạng thái đặt sân</h2>
          {isLoading ? (
            <Skeleton className="h-56 w-full" />
          ) : statusChartData.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">Chưa có dữ liệu</p>
          ) : (
            <ChartContainer
              config={{ count: { label: 'Số lượng', color: 'var(--chart-1)' } }}
              className="aspect-auto h-56 w-full"
            >
              <BarChart data={statusChartData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="status" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={32} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-count)" radius={6} />
              </BarChart>
            </ChartContainer>
          )}
        </div>

        <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-heading">Doanh thu theo môn</h2>
          {isLoading ? (
            <Skeleton className="h-56 w-full" />
          ) : sportChartData.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">Chưa có dữ liệu</p>
          ) : (
            <ChartContainer
              config={{ total: { label: 'Doanh thu', color: 'var(--chart-1)' } }}
              className="aspect-auto h-56 w-full"
            >
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                <Pie
                  data={sportChartData}
                  dataKey="total"
                  nameKey="name"
                  innerRadius={50}
                  paddingAngle={2}
                >
                  {sportChartData.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-heading">Xu hướng doanh thu theo ngày</h2>
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : dayChartData.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">Chưa có dữ liệu</p>
        ) : (
          <ChartContainer
            config={{ total: { label: 'Doanh thu', color: 'var(--chart-1)' } }}
            className="aspect-auto h-64 w-full"
          >
            <AreaChart data={dayChartData}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} width={56} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="total"
                stroke="var(--color-total)"
                fill="var(--color-total)"
                fillOpacity={0.2}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
          <h2 className="text-sm font-semibold text-heading">Top sân theo lượt đặt</h2>
          <Badge variant="secondary">Top 5</Badge>
        </div>
        {isLoading ? (
          <div className="space-y-3 p-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (data?.topCourts ?? []).length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">Chưa có dữ liệu</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/60 bg-card hover:bg-transparent">
                <TableHead className="px-4 text-xs">Sân</TableHead>
                <TableHead className="px-4 text-xs">Cơ sở</TableHead>
                <TableHead className="px-4 text-right text-xs">Lượt đặt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.topCourts ?? []).map((row) => (
                <TableRow key={row.courtId} className="hover:bg-foreground/3">
                  <TableCell className="px-4 py-3 font-medium">
                    {row.court?.name ?? row.courtId}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-muted-foreground">
                    {row.court?.venue?.name ?? '—'}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right tabular-nums">
                    {row.bookingCount}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
