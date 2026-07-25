'use client';

import { useMemo, useState } from 'react';
import { Loader2Icon, PlusIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';

import { PageHeader } from '@/components/custom/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrencyInput, parseCurrencyInput } from '@/lib/format';
import {
  useCreatePriceRule,
  useDeletePriceRule,
  usePriceRules,
} from '@/stores/queries/price-rule.query';
import { useCourts } from '@/stores/queries/court.query';

const DAY_OPTIONS = [
  { value: 1, label: 'T2' },
  { value: 2, label: 'T3' },
  { value: 3, label: 'T4' },
  { value: 4, label: 'T5' },
  { value: 5, label: 'T6' },
  { value: 6, label: 'T7' },
  { value: 0, label: 'CN' },
];

export function PricingPage() {
  const [courtId, setCourtId] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState<number[]>([1, 2, 3, 4, 5]);
  const [timeFrom, setTimeFrom] = useState('06:00');
  const [timeTo, setTimeTo] = useState('22:00');
  const [priceVnd, setPriceVnd] = useState(200000);

  const { data: courts = [] } = useCourts({ limit: '100' });
  const { data: rules = [], isLoading } = usePriceRules(courtId);
  const createMutation = useCreatePriceRule();
  const deleteMutation = useDeletePriceRule();

  const selectedCourt = useMemo(
    () => courts.find((court) => court.id === courtId),
    [courts, courtId],
  );

  const handleCreate = async () => {
    if (!courtId) {
      toast.error('Chọn sân trước');
      return;
    }
    try {
      await createMutation.mutateAsync({
        courtId,
        body: { dayOfWeek, timeFrom, timeTo, priceVnd, isPeak: false },
      });
      toast.success('Đã thêm quy tắc giá');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không tạo được quy tắc');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync({ id, courtId });
      toast.success('Đã xoá quy tắc');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không xoá được');
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6 lg:px-8 lg:py-8">
      <PageHeader title="Giá sân" description="Quản lý price rules theo từng sân (court)." />

      <div className="rounded-xl border border-border/70 bg-card p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <Label>Sân</Label>
            <Select value={courtId} onValueChange={setCourtId}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn sân" />
              </SelectTrigger>
              <SelectContent>
                {courts.map((court) => (
                  <SelectItem key={court.id} value={court.id}>
                    {court.name}
                    {court.venue?.name ? ` · ${court.venue.name}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedCourt ? (
            <div className="text-sm text-muted-foreground">
              Giá cơ bản: {selectedCourt.basePriceVnd.toLocaleString('vi-VN')} đ
            </div>
          ) : null}
        </div>
      </div>

      {courtId ? (
        <>
          <div className="rounded-xl border border-border/70 bg-card p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold">Thêm quy tắc</h2>
            <div className="grid gap-3 md:grid-cols-4">
              <div className="space-y-1 md:col-span-2">
                <Label>Ngày trong tuần</Label>
                <div className="flex flex-wrap gap-1">
                  {DAY_OPTIONS.map((day) => {
                    const active = dayOfWeek.includes(day.value);
                    return (
                      <Button
                        key={day.value}
                        type="button"
                        size="sm"
                        variant={active ? 'default' : 'outline'}
                        onClick={() =>
                          setDayOfWeek((current) =>
                            active
                              ? current.filter((value) => value !== day.value)
                              : [...current, day.value],
                          )
                        }
                      >
                        {day.label}
                      </Button>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-1">
                <Label>Từ</Label>
                <Input type="time" value={timeFrom} onChange={(e) => setTimeFrom(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Đến</Label>
                <Input type="time" value={timeTo} onChange={(e) => setTimeTo(e.target.value)} />
              </div>
              <div className="space-y-1 md:col-span-2">
                <Label>Giá (VNĐ)</Label>
                <Input
                  inputMode="numeric"
                  value={formatCurrencyInput(priceVnd)}
                  onChange={(e) => setPriceVnd(parseCurrencyInput(e.target.value))}
                />
              </div>
              <div className="flex items-end md:col-span-2">
                <Button onClick={handleCreate} disabled={createMutation.isPending}>
                  {createMutation.isPending ? (
                    <Loader2Icon className="size-3.5 animate-spin" />
                  ) : (
                    <PlusIcon className="size-3.5" />
                  )}
                  Thêm quy tắc
                </Button>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
            {isLoading ? (
              <Skeleton className="m-4 h-24 w-full" />
            ) : rules.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                Chưa có quy tắc giá cho sân này.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ngày</TableHead>
                    <TableHead>Khung giờ</TableHead>
                    <TableHead>Giá</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell>{rule.dayOfWeek.join(', ')}</TableCell>
                      <TableCell>
                        {rule.timeFrom} – {rule.timeTo}
                      </TableCell>
                      <TableCell>{rule.priceVnd.toLocaleString('vi-VN')} đ</TableCell>
                      <TableCell>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          onClick={() => handleDelete(rule.id)}
                        >
                          <Trash2Icon className="size-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
