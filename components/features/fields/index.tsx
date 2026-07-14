'use client';

import { useState } from 'react';
import { LandPlotIcon, MoreHorizontalIcon, SearchIcon, Trash2Icon, XIcon } from 'lucide-react';
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
import type { FieldStatus, IField, IVenue } from '@/stores/api/types';
import { useErpUiStore } from '@/stores/index.store';
import { useDeleteField, useFields } from '@/stores/queries/field.query';
import { useVenues } from '@/stores/queries/venue.query';

const formatDurationMinutes = (minutes: number) => {
  if (!minutes || minutes < 0) return '—';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} phút`;
  if (mins === 0) return hours === 1 ? '1 giờ' : `${hours} giờ`;
  return `${hours} giờ ${mins} phút`;
};

const statusLabel: Record<FieldStatus, string> = {
  active: 'Hoạt động',
  inactive: 'Ngưng',
};

const statusVariant: Record<FieldStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  active: 'default',
  inactive: 'outline',
};

export const FieldsPage = () => {
  const [search, setSearch] = useState('');
  const fieldVenueFilter = useErpUiStore((state) => state.fieldVenueFilter);
  const setFieldVenueFilter = useErpUiStore((state) => state.setFieldVenueFilter);
  const deleteFieldMutation = useDeleteField();

  const { data: venuesData, isSuccess: venuesSuccess } = useVenues();
  const venues = venuesSuccess ? venuesData : [];
  const {
    data: fieldsData,
    isSuccess: fieldsSuccess,
    isLoading,
    isError,
    error,
  } = useFields({
    ...(search.trim() ? { search: search.trim() } : {}),
    ...(fieldVenueFilter ? { venueId: fieldVenueFilter } : {}),
  });
  const fields = fieldsSuccess ? fieldsData : [];

  const isNotEmpty = fields.length > 0;
  const isFiltering = search.trim().length > 0 || Boolean(fieldVenueFilter);
  const hasVenues = venues.length > 0;

  const handleDelete = async (fieldId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sân này không?')) return;
    try {
      await deleteFieldMutation.mutateAsync(fieldId);
      toast.success('Xóa sân thành công');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không xóa được sân');
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Sân</h1>
            {isNotEmpty && (
              <Badge variant="secondary" className="font-semibold tabular-nums">
                {fields.length}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Quản lý sân theo cơ sở và bộ môn — gắn giá và trạng thái hoạt động.
          </p>
        </div>

        {(isNotEmpty || isFiltering) && hasVenues && <DialogCreateField />}
      </header>

      {(isNotEmpty || isFiltering) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <InputGroup className="max-w-sm bg-card">
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
        <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
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
        <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
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
              {fields.map((field: IField) => (
                <TableRow
                  key={field.id}
                  className="group border-b border-border/40 last:border-b-0"
                >
                  <TableCell className="max-w-[220px] px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/50 text-muted-foreground">
                        <LandPlotIcon className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-foreground">{field.name}</p>
                        {field.description ? (
                          <p className="truncate text-xs text-muted-foreground">
                            {field.description}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3.5 text-sm text-muted-foreground">
                    {field.venue?.name || '—'}
                  </TableCell>
                  <TableCell className="hidden px-4 py-3.5 text-sm text-muted-foreground md:table-cell">
                    {field.sport?.name || '—'}
                  </TableCell>
                  <TableCell className="hidden px-4 py-3.5 text-sm text-muted-foreground lg:table-cell">
                    <div>
                      <p>{formatDurationMinutes(field.minDurationMinutes)}</p>
                      <p className="text-xs">
                        +{formatDurationMinutes(field.durationStepMinutes)}/lần
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3.5 text-sm font-medium tabular-nums">
                    {formatCurrency(field.price)}
                    <span className="ml-1 text-xs font-normal text-muted-foreground">
                      /{formatDurationMinutes(field.minDurationMinutes)}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3.5">
                    <Badge variant={statusVariant[field.status]}>{statusLabel[field.status]}</Badge>
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
                        <DialogEditField fieldId={field.id} />
                        <Separator className="my-1" />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start gap-2 font-normal text-destructive hover:text-destructive"
                          onClick={() => handleDelete(field.id)}
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
        <div className="flex flex-col items-center rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center">
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
