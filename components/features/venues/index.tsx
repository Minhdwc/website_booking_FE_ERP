'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Building2Icon,
  ClockIcon,
  EyeIcon,
  MapPinIcon,
  MoonIcon,
  MoreHorizontalIcon,
  SearchIcon,
  XIcon,
  Trash2,
} from 'lucide-react';

import { VenuesCreateDialog } from '@/components/features/venues/dialog-create';
import { DialogEditVenue } from '@/components/features/venues/dialog-edit';
import { VenuesSetupPage } from '@/components/features/venues/setup-page';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useVenuesOnboarding } from '@/hooks/use-venues-onboarding';
import { IVenue } from '@/stores/api/types';
import { useErpUiStore } from '@/stores/index.store';
import { prefetchVenue, useDeleteVenue, useVenues } from '@/stores/queries/venue.query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const formatRestTime = (restStartTime?: string, restEndTime?: string) => {
  if (!restStartTime || !restEndTime) return null;
  return `${restStartTime} – ${restEndTime}`;
};

export const VenuesPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const venueSearch = useErpUiStore((state) => state.venueSearch);
  const setVenueSearch = useErpUiStore((state) => state.setVenueSearch);
  const deleteVenueMutation = useDeleteVenue();

  useEffect(() => {
    setVenueSearch('');
  }, [setVenueSearch]);

  const {
    data: venuesData,
    isSuccess,
    isError,
    error,
  } = useVenues(venueSearch ? { search: venueSearch } : undefined);

  const venues = isSuccess ? (venuesData ?? []) : [];
  const isNotEmpty = venues.length > 0;
  const isSearching = venueSearch.trim().length > 0;
  const isEmpty = isSuccess && !isNotEmpty;
  const isPending = !isSuccess && !isError;
  const { startTour } = useVenuesOnboarding({ enabled: isEmpty });

  const handleDeleteVenue = async (venueId: string) => {
    try {
      if (!window.confirm('Bạn có chắc chắn muốn xóa cơ sở này không?')) {
        return;
      }
      const res = await deleteVenueMutation.mutateAsync(venueId);
      console.log(res);
      toast.success('Xóa cơ sở thành công');
    } catch (error: any) {
      toast.error(error.message || 'Không xóa được cơ sở');
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-7 lg:px-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-heading">Cơ sở</h1>
            {isNotEmpty && (
              <Badge variant="secondary" className="font-semibold tabular-nums">
                {venues.length}
              </Badge>
            )}
          </div>
        </div>

        {(isNotEmpty || isSearching) && <VenuesCreateDialog />}
      </header>

      <InputGroup className="h-9 w-full max-w-[220px] rounded-xl border-border/70 bg-card shadow-sm">
        <InputGroupAddon>
          <SearchIcon className="size-3.5" />
        </InputGroupAddon>
        <InputGroupInput
          placeholder="Tìm cơ sở…"
          className="text-sm"
          value={venueSearch}
          onChange={(event) => setVenueSearch(event.target.value)}
        />
        {isSearching && (
          <InputGroupAddon align="inline-end">
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label="Xoá tìm kiếm"
              onClick={() => setVenueSearch('')}
            >
              <XIcon />
            </Button>
          </InputGroupAddon>
        )}
      </InputGroup>

      {isError && (
        <div className="rounded-xl border border-error/20 bg-error/5 px-4 py-3 text-sm text-error">
          {error instanceof Error ? error.message : 'Không tải được danh sách cơ sở'}
        </div>
      )}

      {isPending && (
        <div className="overflow-hidden rounded-[22px] border border-border/80 bg-card shadow-sm">
          <div className="border-b border-border/60 bg-card px-4 py-3.5">
            <Skeleton className="h-4 w-2/3 max-w-md" />
          </div>
          <div className="space-y-0 divide-y divide-border/40">
            {[0, 1, 2, 3].map((row) => (
              <div key={row} className="flex items-center gap-4 px-4 py-4">
                <Skeleton className="size-9 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="hidden h-4 w-24 sm:block" />
                <Skeleton className="hidden h-4 w-20 md:block" />
              </div>
            ))}
          </div>
        </div>
      )}

      {isSuccess && isNotEmpty && (
        <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/60 bg-card hover:bg-transparent">
                <TableHead className="px-4 py-3 text-xs">Cơ sở</TableHead>
                <TableHead className="px-4 py-3 text-xs">Địa chỉ</TableHead>
                <TableHead className="px-4 py-3 text-xs">Giờ hoạt động</TableHead>
                <TableHead className="px-4 py-3 text-xs hidden md:table-cell">Giờ nghỉ</TableHead>
                <TableHead className="px-4 py-3 text-xs w-14 text-right">
                  <span className="sr-only">Thao tác</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {venues.map((venue: IVenue) => {
                const restTime = formatRestTime(venue.restStartTime, venue.restEndTime);

                return (
                  <TableRow
                    key={venue.id}
                    className="group cursor-pointer border-b border-border/40 last:border-b-0 hover:bg-foreground/3"
                    onMouseEnter={() => {
                      prefetchVenue(queryClient, venue.id);
                    }}
                    onClick={() => router.push(`/venues/${venue.id}`)}
                  >
                    <TableCell className="max-w-[240px] px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/50 text-muted-foreground transition-colors group-hover:border-brand-secondary-600/20 group-hover:bg-brand-secondary-50 group-hover:text-brand-secondary-600">
                          <Building2Icon className="size-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-heading">{venue.name}</p>
                          {venue.description ? (
                            <p className="truncate text-xs text-muted-foreground">
                              {venue.description}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell
                      className="max-w-[240px] px-4 py-3.5 whitespace-normal"
                      title={venue.location}
                    >
                      <div className="flex items-start gap-1.5 text-muted-foreground">
                        <MapPinIcon className="mt-0.5 size-3.5 shrink-0" />
                        <span className="line-clamp-2 text-sm">{venue.location}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3.5 whitespace-nowrap">
                      <Badge variant="outline" className="gap-1.5 font-normal tabular-nums">
                        <ClockIcon className="size-3 text-muted-foreground" />
                        {venue.openTime} – {venue.closeTime}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden px-4 py-3.5 whitespace-nowrap md:table-cell">
                      {restTime ? (
                        <Badge variant="ghost" className="gap-1.5 font-normal tabular-nums">
                          <MoonIcon className="size-3 text-muted-foreground" />
                          {restTime}
                        </Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground/60">—</span>
                      )}
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
                              className="text-muted-foreground opacity-60 transition-opacity group-hover:opacity-100 aria-expanded:opacity-100 cursor-pointer"
                            />
                          }
                        >
                          <MoreHorizontalIcon className="size-4" />
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-44 gap-0 p-1">
                          <Button
                            variant="ghost"
                            className="h-9 px-3 sm:px-4 text-blue-500 hover:text-blue-600 rounded-lg justify-start"
                            onClick={() => router.push(`/venues/${venue.id}`)}
                          >
                            <EyeIcon className="size-3.5 text-blue-500" />
                            Xem chi tiết
                          </Button>
                          <DialogEditVenue venueId={venue.id} />
                          <Button
                            variant="ghost"
                            className="h-9 px-3 sm:px-4 text-red-500 hover:text-red-600 rounded-lg justify-start"
                            onClick={() => handleDeleteVenue(venue.id)}
                          >
                            <Trash2 className="size-3.5 text-red-500" />
                            Xóa
                          </Button>
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {isEmpty && (
        <VenuesSetupPage
          onReplayTour={startTour}
          searchQuery={isSearching ? venueSearch : undefined}
          onClearSearch={isSearching ? () => setVenueSearch('') : undefined}
        />
      )}
    </div>
  );
};
