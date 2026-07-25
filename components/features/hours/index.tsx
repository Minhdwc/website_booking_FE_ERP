'use client';

import { useMemo, useState } from 'react';
import { Loader2Icon } from 'lucide-react';
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
import { IOperatingHour } from '@/stores/api/types';
import {
  useOperatingHours,
  useReplaceOperatingHours,
} from '@/stores/queries/operating-hours.query';
import { useVenues } from '@/stores/queries/venue.query';

const DEFAULT_HOURS: IOperatingHour[] = [
  { dayOfWeek: 1, openTime: '06:00', closeTime: '22:00' },
  { dayOfWeek: 2, openTime: '06:00', closeTime: '22:00' },
  { dayOfWeek: 3, openTime: '06:00', closeTime: '22:00' },
  { dayOfWeek: 4, openTime: '06:00', closeTime: '22:00' },
  { dayOfWeek: 5, openTime: '06:00', closeTime: '22:00' },
  { dayOfWeek: 6, openTime: '06:00', closeTime: '22:00' },
  { dayOfWeek: 0, openTime: '06:00', closeTime: '22:00' },
];

const DAY_LABEL: Record<number, string> = {
  0: 'Chủ nhật',
  1: 'Thứ 2',
  2: 'Thứ 3',
  3: 'Thứ 4',
  4: 'Thứ 5',
  5: 'Thứ 6',
  6: 'Thứ 7',
};

function mergeWithDefaults(existingHours: IOperatingHour[] | undefined): IOperatingHour[] {
  return DEFAULT_HOURS.map((defaultRow) => {
    const found = existingHours?.find((row) => row.dayOfWeek === defaultRow.dayOfWeek);
    return found ?? defaultRow;
  });
}

type HoursEditorProps = {
  venueId: string;
  initialHours: IOperatingHour[];
  replaceMutation: ReturnType<typeof useReplaceOperatingHours>;
};

function HoursEditor({ venueId, initialHours, replaceMutation }: HoursEditorProps) {
  const [hours, setHours] = useState(initialHours);

  const updateHour = (dayOfWeek: number, field: 'openTime' | 'closeTime', value: string) => {
    setHours((current) =>
      current.map((row) => (row.dayOfWeek === dayOfWeek ? { ...row, [field]: value } : row)),
    );
  };

  const handleSave = async () => {
    try {
      await replaceMutation.mutateAsync({
        venueId,
        hours: hours.map(({ dayOfWeek, openTime, closeTime }) => ({
          dayOfWeek,
          openTime,
          closeTime,
        })),
      });
      toast.success('Đã lưu giờ mở cửa');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không lưu được giờ mở cửa');
    }
  };

  return (
    <div className="space-y-3">
      {hours.map((row) => (
        <div key={row.dayOfWeek} className="grid grid-cols-3 items-center gap-3">
          <span className="text-sm font-medium">{DAY_LABEL[row.dayOfWeek]}</span>
          <Input
            type="time"
            value={row.openTime}
            onChange={(event) => updateHour(row.dayOfWeek, 'openTime', event.target.value)}
          />
          <Input
            type="time"
            value={row.closeTime}
            onChange={(event) => updateHour(row.dayOfWeek, 'closeTime', event.target.value)}
          />
        </div>
      ))}
      <Button onClick={handleSave} disabled={replaceMutation.isPending}>
        {replaceMutation.isPending && <Loader2Icon className="size-3.5 animate-spin" />}
        Lưu giờ mở cửa
      </Button>
    </div>
  );
}

export function HoursPage() {
  const [venueId, setVenueId] = useState('');

  const { data: venues = [] } = useVenues({ limit: '100' });
  const { data: existingHours, isLoading } = useOperatingHours(venueId);
  const replaceMutation = useReplaceOperatingHours();

  const initialHours = useMemo(() => mergeWithDefaults(existingHours), [existingHours]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 lg:px-8 lg:py-8">
      <PageHeader
        title="Giờ mở cửa"
        description="Cấu hình operating hours theo từng cơ sở (PUT /venues/:id/operating-hours)."
      />

      <div className="rounded-xl border border-border/70 bg-card p-4 shadow-sm">
        <div className="space-y-1">
          <Label>Cơ sở</Label>
          <Select value={venueId} onValueChange={setVenueId}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn cơ sở" />
            </SelectTrigger>
            <SelectContent>
              {venues.map((venue) => (
                <SelectItem key={venue.id} value={venue.id}>
                  {venue.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {venueId ? (
        <div className="rounded-xl border border-border/70 bg-card p-4 shadow-sm">
          {isLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <HoursEditor
              key={venueId}
              venueId={venueId}
              initialHours={initialHours}
              replaceMutation={replaceMutation}
            />
          )}
        </div>
      ) : null}
    </div>
  );
}
