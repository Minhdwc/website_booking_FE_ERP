'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  EyeIcon,
  LandPlotIcon,
  MoreHorizontalIcon,
  SearchIcon,
  Trash2Icon,
  XIcon,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { formatCurrency } from '@/lib/format';
import { DialogCreateField } from '@/components/features/fields/dialog-create-field';
import { DialogEditField } from '@/components/features/fields/dialog-edit-field';
import { FieldsSetupPage } from '@/components/features/fields/setup-page';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CourtStatus, ICourt, IVenue } from '@/stores/api/types';
import { useErpUiStore } from '@/stores/index.store';
import { useDeleteCourt, prefetchCourt, useCourts } from '@/stores/queries/court.query';
import { useVenues } from '@/stores/queries/venue.query';

const formatDurationMinutes = (minutes: number) => {
  if (!minutes || minutes < 0) return '—';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} phút`;
  if (mins === 0) return hours === 1 ? '1 giờ' : `${hours} giờ`;
  return `${hours} giờ ${mins} phút`;
};

const statusLabel: Record<CourtStatus, string> = {
  active: 'Hoạt động',
  inactive: 'Ngưng',
  maintenance: 'Bảo trì',
};

const statusVariant: Record<CourtStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  active: 'default',
  inactive: 'outline',
  maintenance: 'secondary',
};

export const FieldsPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const fieldVenueFilter = useErpUiStore((state) => state.fieldVenueFilter);
  const setFieldVenueFilter = useErpUiStore((state) => state.setFieldVenueFilter);
  const deleteCourtMutation = useDeleteCourt();

  const { data: venuesData, isSuccess: venuesSuccess } = useVenues();
  const venues = venuesSuccess ? venuesData : [];
  const {
    data: fieldsData,
    isSuccess: fieldsSuccess,
    isLoading,
    isError,
    error,
  } = useCourts({
    ...(search.trim() ? { search: search.trim() } : {}),
    ...(fieldVenueFilter ? { venueId: fieldVenueFilter } : {}),
  });
  const courts = fieldsSuccess ? fieldsData : [];

  const isNotEmpty = courts.length > 0;
  const isFiltering = search.trim().length > 0 || Boolean(fieldVenueFilter);
  const hasVenues = venues.length > 0;

  const handleDelete = async (courtId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sân này không?')) return;
    try {
      await deleteCourtMutation.mutateAsync(courtId);
      toast.success('Xóa sân thành công');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không xóa được sân');
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-7 lg:px-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Sân</h1>
            {isNotEmpty && (
              <Badge variant="secondary" className="font-semibold tabular-nums">
                {courts.length}
              </Badge>
            )}
          </div>
        </div>

        {(isNotEmpty || isFiltering) && hasVenues && <DialogCreateField />}
      </header>

      {(isNotEmpty || isFiltering) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <InputGroup className="max-w-sm rounded-2xl bg-card">
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Tìm sân theo tên…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            {search.trim() && (
              <InputGroupAddon align="inline-end">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Xoá tìm kiếm"
                  onClick={() => setSearch('')}
                >
                  <XIcon />
                </Button>
              </InputGroupAddon>
            )}
          </InputGroup>

          <Select
            value={fieldVenueFilter || '__all__'}
            onValueChange={(value) =>
              setFieldVenueFilter(!value || value === '__all__' ? undefined : value)
            }
            items={{
              __all__: 'Tất cả cơ sở',
              ...Object.fromEntries(venues.map((venue: IVenue) => [venue.id, venue.name])),
            }}
          >
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue placeholder="Lọc theo cơ sở" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Tất cả cơ sở</SelectItem>
              {venues.map((venue: IVenue) => (
                <SelectItem key={venue.id} value={venue.id}>
                  {venue.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error instanceof Error ? error.message : 'Không tải được danh sách sân'}
        </div>
      )}

      {isLoading && !isError && (
        <div className="overflow-hidden rounded-[22px] border border-border/80 bg-card shadow-sm">
          <div className="space-y-0 divide-y divide-border/40">
            {[0, 1, 2, 3].map((row) => (
              <div key={row} className="flex items-center gap-4 px-4 py-4">
                <Skeleton className="size-9 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="hidden h-4 w-24 sm:block" />
              </div>
            ))}
          </div>
        </div>
      )}

      {!isLoading && !isError && isNotEmpty && (
        <div className="overflow-hidden rounded-[22px] border border-border/80 bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/60 bg-muted/40">
                <TableHead className="px-4 py-3 text-xs">Sân</TableHead>
                <TableHead className="px-4 py-3 text-xs">Cơ sở</TableHead>
                <TableHead className="hidden px-4 py-3 text-xs md:table-cell">Bộ môn</TableHead>
                <TableHead className="hidden px-4 py-3 text-xs lg:table-cell">
                  Thuê tối thiểu
                </TableHead>
                <TableHead className="px-4 py-3 text-xs">Giá</TableHead>
                <TableHead className="px-4 py-3 text-xs">Trạng thái</TableHead>
                <TableHead className="w-14 px-4 py-3 text-right text-xs">
                  <span className="sr-only">Thao tác</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courts.map((court: ICourt) => (
                <TableRow
                  key={court.id}
                  className="group cursor-pointer border-b border-border/40 last:border-b-0 hover:bg-muted/30"
                  onMouseEnter={() => prefetchCourt(queryClient, court.id)}
                  onClick={() => router.push(`/courts/${court.id}`)}
                >
                  <TableCell className="max-w-60 px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/50 text-muted-foreground">
                        <LandPlotIcon className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-foreground">{court.name}</p>
                        {court.description ? (
                          <p className="truncate text-xs text-muted-foreground">
                            {court.description}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3.5 text-sm text-muted-foreground">
                    {court.venue?.name || '—'}
                  </TableCell>
                  <TableCell className="hidden px-4 py-3.5 text-sm text-muted-foreground md:table-cell">
                    {court.sport?.name || '—'}
                  </TableCell>
                  <TableCell className="hidden px-4 py-3.5 text-sm text-muted-foreground lg:table-cell">
                    <div>
                      <p>{formatDurationMinutes(court.minDurationMinutes)}</p>
                      <p className="text-xs">
                        +{formatDurationMinutes(court.durationStepMinutes)}/lần
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3.5 text-sm font-medium tabular-nums">
                    {formatCurrency(court.basePriceVnd)}
                    <span className="ml-1 text-xs font-normal text-muted-foreground">
                      /{formatDurationMinutes(court.minDurationMinutes)}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3.5">
                    <Badge variant={statusVariant[court.status]}>{statusLabel[court.status]}</Badge>
                  </TableCell>
                  <TableCell
                    className="px-3 py-3.5 text-right"
                    onClick={(event) => event.stopPropagation()}
                  >
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
                        <Button
                          variant="ghost"
                          className="h-9 w-full justify-start gap-2 px-3 text-blue-500 hover:text-blue-600"
                          onClick={() => router.push(`/courts/${court.id}`)}
                        >
                          <EyeIcon className="size-3.5 text-blue-500" />
                          Xem chi tiết
                        </Button>
                        <DialogEditField courtId={court.id} />
                        <Separator className="my-1" />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start gap-2 font-normal text-destructive hover:text-destructive"
                          onClick={() => handleDelete(court.id)}
                        >
                          <Trash2Icon className="size-3.5" />
                          Xóa
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

      {!isLoading && !isError && !isNotEmpty && isFiltering && (
        <div className="flex flex-col items-center rounded-[22px] border border-dashed border-border/80 bg-card px-6 py-12 text-center shadow-sm">
          <div className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <SearchIcon className="size-5" />
          </div>
          <h2 className="mt-4 text-base font-semibold text-foreground">Không tìm thấy sân nào</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Thử đổi từ khoá hoặc bộ lọc cơ sở.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => {
              setSearch('');
              setFieldVenueFilter(undefined);
            }}
          >
            <XIcon className="size-3.5" />
            Xoá bộ lọc
          </Button>
        </div>
      )}

      {!isLoading && !isError && !isNotEmpty && !isFiltering && (
        <FieldsSetupPage hasVenues={hasVenues} />
      )}
    </div>
  );
};
